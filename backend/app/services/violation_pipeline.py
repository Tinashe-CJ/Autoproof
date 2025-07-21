"""
Main violation detection pipeline orchestrator.
Coordinates all stages of compliance detection and analysis.
"""

import time
import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

# Import all pipeline stages
from backend.app.services.regex_checks import scan_all_regex_patterns, get_violation_summary as get_regex_summary
from backend.app.services.ner_checks import tag_entities, filter_ner_violations, get_ner_summary
from backend.app.services.config_linter import lint_configs, get_config_summary
from backend.app.services.rag_service import retrieve_regulation_context, analyze_regulatory_compliance, get_regulatory_summary
from backend.app.services.openai_service import ComplianceAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PipelineStage(Enum):
    REGEX_SCANNING = "regex_scanning"
    NER_ANALYSIS = "ner_analysis"
    CONFIG_LINTING = "config_linting"
    REGULATORY_ANALYSIS = "regulatory_analysis"
    LLM_ANALYSIS = "llm_analysis"

@dataclass
class PipelineResult:
    stage: PipelineStage
    violations: List[Dict[str, Any]]
    processing_time_ms: float
    summary: Dict[str, Any]
    success: bool
    error_message: Optional[str] = None
    token_usage: Optional[int] = None

@dataclass
class FullAnalysisResult:
    total_violations: int
    violations_by_stage: Dict[str, List[Dict[str, Any]]]
    stage_results: List[PipelineResult]
    overall_summary: Dict[str, Any]
    total_processing_time_ms: float
    token_usage: Optional[int] = None

class ViolationPipeline:
    """
    Main pipeline orchestrator for compliance violation detection.
    """
    
    def __init__(self):
        self.compliance_analyzer = ComplianceAnalyzer()
        self.stage_results = []
    
    async def run_full_analysis(self, text: str, source: str = "manual") -> FullAnalysisResult:
        """
        Run the complete compliance detection pipeline.
        
        Args:
            text: Input text to analyze
            source: Source of the content (github, manual, slack, api)
        
        Returns:
            Complete analysis result with all violations and summaries
        """
        start_time = time.time()
        all_violations = []
        stage_results = []
        
        logger.info(f"Starting full compliance analysis pipeline for {source} content")
        
        try:
            # Stage 1: Regex & Keyword Scanning
            stage_result = self._run_regex_stage(text, source)
            stage_results.append(stage_result)
            if stage_result.success:
                # Convert Violation objects to dictionaries
                violations = []
                for violation in stage_result.violations:
                    if hasattr(violation, 'type'):
                        violations.append({
                            "type": violation.type.value if hasattr(violation.type, 'value') else str(violation.type),
                            "issue": violation.issue,
                            "recommendation": violation.recommendation,
                            "severity": violation.severity.value if hasattr(violation.severity, 'value') else str(violation.severity),
                            "confidence_score": violation.confidence_score,
                            "matched_content": violation.matched_content
                        })
                    else:
                        violations.append(violation)
                all_violations.extend(violations)
            
            # Stage 2: Named Entity Recognition (NER)
            stage_result = self._run_ner_stage(text)
            stage_results.append(stage_result)
            if stage_result.success:
                # Convert Violation objects to dictionaries
                violations = []
                for violation in stage_result.violations:
                    if hasattr(violation, 'type'):
                        violations.append({
                            "type": violation.type.value if hasattr(violation.type, 'value') else str(violation.type),
                            "issue": violation.issue,
                            "recommendation": violation.recommendation,
                            "severity": violation.severity.value if hasattr(violation.severity, 'value') else str(violation.severity),
                            "confidence_score": violation.confidence_score,
                            "matched_content": violation.matched_content
                        })
                    else:
                        violations.append(violation)
                all_violations.extend(violations)
            
            # Stage 3: Static Config Linting (for code/config files)
            if source in ["github", "gitlab", "manual"]:
                stage_result = self._run_config_linting_stage(text)
                stage_results.append(stage_result)
                if stage_result.success:
                    # Convert Violation objects to dictionaries
                    violations = []
                    for violation in stage_result.violations:
                        if hasattr(violation, 'type'):
                            violations.append({
                                "type": violation.type.value if hasattr(violation.type, 'value') else str(violation.type),
                                "issue": violation.issue,
                                "recommendation": violation.recommendation,
                                "severity": violation.severity.value if hasattr(violation.severity, 'value') else str(violation.severity),
                                "confidence_score": violation.confidence_score,
                                "matched_content": violation.matched_content
                            })
                        else:
                            violations.append(violation)
                    all_violations.extend(violations)
            
            # Stage 4: Regulatory Analysis (RAG)
            stage_result = self._run_regulatory_stage(text, source)
            stage_results.append(stage_result)
            if stage_result.success:
                # Regulatory violations are already dictionaries
                all_violations.extend(stage_result.violations)
            
            # Stage 5: LLM Analysis (with context from previous stages)
            stage_result = await self._run_llm_stage(text, source, all_violations)
            stage_results.append(stage_result)
            if stage_result.success:
                # LLM violations are already dictionaries
                all_violations.extend(stage_result.violations)
            
            # Calculate total processing time
            total_time = (time.time() - start_time) * 1000
            
            # Generate overall summary
            overall_summary = self._generate_overall_summary(stage_results, all_violations)
            
            # Group violations by stage
            violations_by_stage = self._group_violations_by_stage(stage_results)
            
            result = FullAnalysisResult(
                total_violations=len(all_violations),
                violations_by_stage=violations_by_stage,
                stage_results=stage_results,
                overall_summary=overall_summary,
                total_processing_time_ms=total_time,
                token_usage=stage_result.token_usage if stage_result else None
            )
            
            logger.info(f"Pipeline completed: {len(all_violations)} total violations in {total_time:.2f}ms")
            return result
            
        except Exception as e:
            logger.error(f"Pipeline failed: {e}")
            # Return partial results if available
            total_time = (time.time() - start_time) * 1000
            return FullAnalysisResult(
                total_violations=len(all_violations),
                violations_by_stage=self._group_violations_by_stage(stage_results),
                stage_results=stage_results,
                overall_summary={"error": str(e)},
                total_processing_time_ms=total_time
            )
    
    def _run_regex_stage(self, text: str, source: str) -> PipelineResult:
        """Run regex-based pattern scanning."""
        start_time = time.time()
        
        try:
            violations = scan_all_regex_patterns(text, source)
            summary = get_regex_summary(violations)
            processing_time = (time.time() - start_time) * 1000
            
            logger.info(f"Regex stage: {len(violations)} violations found in {processing_time:.2f}ms")
            
            return PipelineResult(
                stage=PipelineStage.REGEX_SCANNING,
                violations=violations,
                processing_time_ms=processing_time,
                summary=summary,
                success=True
            )
            
        except Exception as e:
            logger.error(f"Regex stage failed: {e}")
            return PipelineResult(
                stage=PipelineStage.REGEX_SCANNING,
                violations=[],
                processing_time_ms=(time.time() - start_time) * 1000,
                summary={},
                success=False,
                error_message=str(e)
            )
    
    def _run_ner_stage(self, text: str) -> PipelineResult:
        """Run Named Entity Recognition analysis."""
        start_time = time.time()
        
        try:
            # Perform NER analysis
            raw_violations = tag_entities(text)
            
            # Filter violations by confidence
            filtered_violations = filter_ner_violations(raw_violations, min_confidence=0.6)
            
            summary = get_ner_summary(filtered_violations)
            processing_time = (time.time() - start_time) * 1000
            
            logger.info(f"NER stage: {len(filtered_violations)} violations found in {processing_time:.2f}ms")
            
            return PipelineResult(
                stage=PipelineStage.NER_ANALYSIS,
                violations=filtered_violations,
                processing_time_ms=processing_time,
                summary=summary,
                success=True
            )
            
        except Exception as e:
            logger.error(f"NER stage failed: {e}")
            return PipelineResult(
                stage=PipelineStage.NER_ANALYSIS,
                violations=[],
                processing_time_ms=(time.time() - start_time) * 1000,
                summary={},
                success=False,
                error_message=str(e)
            )
    
    def _run_config_linting_stage(self, text: str) -> PipelineResult:
        """Run configuration file linting."""
        start_time = time.time()
        
        try:
            violations = lint_configs(text)
            summary = get_config_summary(violations)
            processing_time = (time.time() - start_time) * 1000
            
            logger.info(f"Config linting stage: {len(violations)} violations found in {processing_time:.2f}ms")
            
            return PipelineResult(
                stage=PipelineStage.CONFIG_LINTING,
                violations=violations,
                processing_time_ms=processing_time,
                summary=summary,
                success=True
            )
            
        except Exception as e:
            logger.error(f"Config linting stage failed: {e}")
            return PipelineResult(
                stage=PipelineStage.CONFIG_LINTING,
                violations=[],
                processing_time_ms=(time.time() - start_time) * 1000,
                summary={},
                success=False,
                error_message=str(e)
            )
    
    def _run_regulatory_stage(self, text: str, source: str) -> PipelineResult:
        """Run regulatory compliance analysis."""
        start_time = time.time()
        
        try:
            # Perform regulatory analysis
            analysis_result = analyze_regulatory_compliance(text, source)
            summary = get_regulatory_summary(analysis_result)
            processing_time = (time.time() - start_time) * 1000
            
            # Convert regulatory violations to standard format
            violations = []
            for violation in analysis_result.get("regulatory_violations", []):
                violations.append({
                    "type": "Regulatory",
                    "issue": violation.get("issue", ""),
                    "recommendation": violation.get("recommendation", ""),
                    "severity": violation.get("severity", "medium"),
                    "regulation": violation.get("regulation", ""),
                    "confidence_score": 0.8
                })
            
            logger.info(f"Regulatory stage: {len(violations)} violations found in {processing_time:.2f}ms")
            
            return PipelineResult(
                stage=PipelineStage.REGULATORY_ANALYSIS,
                violations=violations,
                processing_time_ms=processing_time,
                summary=summary,
                success=True
            )
            
        except Exception as e:
            logger.error(f"Regulatory stage failed: {e}")
            return PipelineResult(
                stage=PipelineStage.REGULATORY_ANALYSIS,
                violations=[],
                processing_time_ms=(time.time() - start_time) * 1000,
                summary={},
                success=False,
                error_message=str(e)
            )
    
    async def _run_llm_stage(self, text: str, source: str, pre_violations: List[Dict[str, Any]]) -> PipelineResult:
        """Run LLM analysis with context from previous stages."""
        start_time = time.time()
        
        try:
            # Retrieve regulatory context for LLM
            contexts = retrieve_regulation_context(text)
            
            # Prepare context for LLM analysis
            context = {
                "pre_violations": pre_violations,
                "regulatory_contexts": [ctx.__dict__ for ctx in contexts] if contexts else []
            }
            
            # Run LLM analysis with enhanced context
            llm_violations, token_usage = await self.compliance_analyzer.analyze_with_context(
                text=text,
                context=context
            )
            
            processing_time = (time.time() - start_time) * 1000
            
            logger.info(f"LLM stage: {len(llm_violations)} violations found in {processing_time:.2f}ms")
            
            return PipelineResult(
                stage=PipelineStage.LLM_ANALYSIS,
                violations=llm_violations,
                processing_time_ms=processing_time,
                summary={"violations_count": len(llm_violations)},
                success=True,
                token_usage=token_usage
            )
            
        except Exception as e:
            logger.error(f"LLM stage failed: {e}")
            return PipelineResult(
                stage=PipelineStage.LLM_ANALYSIS,
                violations=[],
                processing_time_ms=(time.time() - start_time) * 1000,
                summary={},
                success=False,
                error_message=str(e),
                token_usage=None
            )
    
    def _generate_overall_summary(self, stage_results: List[PipelineResult], all_violations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate overall summary from all pipeline stages."""
        summary = {
            "total_violations": len(all_violations),
            "stages_completed": len([r for r in stage_results if r.success]),
            "stages_failed": len([r for r in stage_results if not r.success]),
            "total_processing_time_ms": sum(r.processing_time_ms for r in stage_results),
            "by_stage": {},
            "by_severity": {},
            "by_type": {}
        }
        
        # Aggregate stage summaries
        for result in stage_results:
            if result.success:
                stage_name = result.stage.value
                summary["by_stage"][stage_name] = {
                    "violations": len(result.violations),
                    "processing_time_ms": result.processing_time_ms,
                    "summary": result.summary
                }
        
        # Aggregate by severity and type
        for violation in all_violations:
            # Handle both Violation objects and dictionaries
            if hasattr(violation, 'severity'):
                severity = violation.severity.value if hasattr(violation.severity, 'value') else str(violation.severity)
                violation_type = violation.type.value if hasattr(violation.type, 'value') else str(violation.type)
            else:
                severity = violation.get("severity", "medium")
                violation_type = violation.get("type", "unknown")
            
            if severity not in summary["by_severity"]:
                summary["by_severity"][severity] = 0
            summary["by_severity"][severity] += 1
            
            if violation_type not in summary["by_type"]:
                summary["by_type"][violation_type] = 0
            summary["by_type"][violation_type] += 1
        
        return summary
    
    def _group_violations_by_stage(self, stage_results: List[PipelineResult]) -> Dict[str, List[Dict[str, Any]]]:
        """Group violations by pipeline stage."""
        grouped = {}
        
        for result in stage_results:
            if result.success:
                stage_name = result.stage.value
                grouped[stage_name] = result.violations
        
        return grouped 