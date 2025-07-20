"""
Policy Parser Service
Integrates document parsing with OpenAI for rule extraction from policy documents
"""

import json
import re
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
from pathlib import Path

from .document_parser import DocumentParser, DocumentParserError
from .openai_service import analyze_text, parse_policy_document
from .policy_storage import PolicyStorageService, PolicyStorageError

# Configure logging
logger = logging.getLogger(__name__)

class PolicyParserError(Exception):
    """Custom exception for policy parsing errors"""
    pass

class PolicyParser:
    """
    Policy parser service that combines document parsing with AI-powered rule extraction
    """
    
    def __init__(self, storage_service: Optional[PolicyStorageService] = None):
        """Initialize the policy parser"""
        self.document_parser = DocumentParser()
        self.storage_service = storage_service
        
        # Rule extraction patterns
        self.rule_keywords = [
            'must', 'shall', 'will', 'should', 'required', 'mandatory',
            'prohibited', 'forbidden', 'not allowed', 'cannot', 'must not',
            'shall not', 'will not', 'should not', 'required to', 'obligated to'
        ]
        
        self.severity_indicators = {
            'high': ['must', 'shall', 'required', 'mandatory', 'prohibited', 'forbidden'],
            'medium': ['should', 'recommended', 'expected', 'preferred'],
            'low': ['may', 'can', 'optional', 'suggested', 'considered']
        }
    
    async def parse_policy_document_file(self, file_content: bytes, filename: str, 
                                       document_name: Optional[str] = None,
                                       document_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Parse a policy document file and extract structured rules
        
        Args:
            file_content: Raw file content
            filename: Original filename
            document_name: Optional document name
            document_type: Optional document type
            
        Returns:
            Parsing results with extracted rules and metadata
        """
        try:
            # Step 1: Process document (validate, save, extract text)
            doc_result = self.document_parser.process_document(file_content, filename)
            
            if not doc_result['success']:
                return {
                    "success": False,
                    "error": doc_result['error'],
                    "stage": "document_processing"
                }
            
            # Step 2: Extract text and metadata
            extracted_text = doc_result['extracted_text']
            validation_result = doc_result['validation']
            processing_metadata = doc_result['processing_metadata']
            
            # Step 3: Use OpenAI to extract structured rules
            try:
                openai_result = await parse_policy_document(extracted_text)
                
                # Step 4: Process and enhance the extracted rules
                enhanced_rules = self._enhance_extracted_rules(
                    openai_result.get('rules', []),
                    extracted_text,
                    validation_result
                )
                
                # Step 5: Generate comprehensive parsing results
                parsing_results = {
                    "success": True,
                    "document_info": {
                        "filename": filename,
                        "document_name": document_name or filename,
                        "document_type": document_type or validation_result['file_type'],
                        "file_size": validation_result['file_size'],
                        "file_hash": validation_result['file_hash'],
                        "uploaded_at": validation_result['uploaded_at']
                    },
                    "text_analysis": {
                        "text_length": processing_metadata['text_length'],
                        "word_count": processing_metadata['word_count'],
                        "line_count": processing_metadata['line_count'],
                        "extraction_confidence": openai_result.get('confidence', 0.0)
                    },
                    "extracted_rules": enhanced_rules,
                    "processing_metadata": {
                        **processing_metadata,
                        "parsing_time": datetime.utcnow().isoformat(),
                        "total_rules_found": len(enhanced_rules),
                        "token_usage": openai_result.get('token_usage', 0)
                    }
                }
                
                # Step 6: Clean up temporary file
                self.document_parser.cleanup_file(processing_metadata['file_path'])
                
                return parsing_results
                
            except Exception as e:
                logger.error(f"OpenAI rule extraction error: {e}")
                return {
                    "success": False,
                    "error": f"Rule extraction failed: {str(e)}",
                    "stage": "rule_extraction",
                    "document_info": {
                        "filename": filename,
                        "file_size": validation_result['file_size'],
                        "file_hash": validation_result['file_hash']
                    }
                }
                
        except Exception as e:
            logger.error(f"Policy parsing error: {e}")
            return {
                "success": False,
                "error": str(e),
                "stage": "general"
            }
    
    def _enhance_extracted_rules(self, rules: List[Dict], text: str, 
                                validation_result: Dict) -> List[Dict]:
        """
        Enhance extracted rules with additional analysis and metadata
        
        Args:
            rules: Raw rules from OpenAI
            text: Original document text
            validation_result: Document validation results
            
        Returns:
            Enhanced rules with additional metadata
        """
        enhanced_rules = []
        
        for i, rule in enumerate(rules):
            try:
                # Extract rule text and find context
                rule_text = rule.get('description', '')
                rule_name = rule.get('name', f'Rule {i+1}')
                
                # Find rule in original text
                context = self._find_rule_context(rule_text, text)
                
                # Determine severity based on keywords
                severity = self._determine_severity(rule_text)
                
                # Extract keywords
                keywords = self._extract_keywords(rule_text)
                
                # Generate rule ID
                rule_id = f"{validation_result['file_hash'][:8]}_{i+1}"
                
                enhanced_rule = {
                    "id": rule_id,
                    "name": rule_name,
                    "description": rule_text,
                    "severity": severity,
                    "keywords": keywords,
                    "context": context,
                    "source_document": validation_result['filename'],
                    "extraction_confidence": rule.get('confidence', 0.8),
                    "created_at": datetime.utcnow().isoformat(),
                    "metadata": {
                        "rule_type": rule.get('type', 'general'),
                        "category": rule.get('category', 'policy'),
                        "original_rule": rule
                    }
                }
                
                enhanced_rules.append(enhanced_rule)
                
            except Exception as e:
                logger.warning(f"Error enhancing rule {i}: {e}")
                # Add basic rule if enhancement fails
                enhanced_rules.append({
                    "id": f"{validation_result['file_hash'][:8]}_{i+1}",
                    "name": rule.get('name', f'Rule {i+1}'),
                    "description": rule.get('description', ''),
                    "severity": "medium",
                    "keywords": [],
                    "context": "",
                    "source_document": validation_result['filename'],
                    "extraction_confidence": 0.5,
                    "created_at": datetime.utcnow().isoformat(),
                    "metadata": {"original_rule": rule}
                })
        
        return enhanced_rules
    
    def _find_rule_context(self, rule_text: str, document_text: str, 
                          context_length: int = 200) -> str:
        """
        Find the context around a rule in the original document
        
        Args:
            rule_text: The rule text to find
            document_text: The full document text
            context_length: Number of characters around the rule
            
        Returns:
            Context string around the rule
        """
        try:
            # Find the rule text in the document
            rule_lower = rule_text.lower()
            doc_lower = document_text.lower()
            
            start_pos = doc_lower.find(rule_lower)
            if start_pos == -1:
                # Try to find partial matches
                words = rule_text.split()[:5]  # First 5 words
                for word in words:
                    if len(word) > 3:  # Only meaningful words
                        pos = doc_lower.find(word.lower())
                        if pos != -1:
                            start_pos = pos
                            break
            
            if start_pos == -1:
                return ""
            
            # Extract context
            start = max(0, start_pos - context_length // 2)
            end = min(len(document_text), start_pos + len(rule_text) + context_length // 2)
            
            context = document_text[start:end]
            
            # Clean up context
            context = re.sub(r'\s+', ' ', context).strip()
            
            return context
            
        except Exception as e:
            logger.warning(f"Error finding rule context: {e}")
            return ""
    
    def _determine_severity(self, rule_text: str) -> str:
        """
        Determine rule severity based on keywords
        
        Args:
            rule_text: The rule text to analyze
            
        Returns:
            Severity level (high, medium, low)
        """
        rule_lower = rule_text.lower()
        
        # Check for high severity indicators
        for indicator in self.severity_indicators['high']:
            if indicator in rule_lower:
                return 'high'
        
        # Check for medium severity indicators
        for indicator in self.severity_indicators['medium']:
            if indicator in rule_lower:
                return 'medium'
        
        # Check for low severity indicators
        for indicator in self.severity_indicators['low']:
            if indicator in rule_lower:
                return 'low'
        
        # Default to medium if no clear indicators
        return 'medium'
    
    def _extract_keywords(self, rule_text: str) -> List[str]:
        """
        Extract keywords from rule text
        
        Args:
            rule_text: The rule text to analyze
            
        Returns:
            List of extracted keywords
        """
        keywords = []
        
        # Extract rule keywords
        rule_lower = rule_text.lower()
        for keyword in self.rule_keywords:
            if keyword in rule_lower:
                keywords.append(keyword)
        
        # Extract potential entities (simple approach)
        # Look for capitalized words that might be entities
        potential_entities = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', rule_text)
        keywords.extend(potential_entities[:5])  # Limit to first 5
        
        # Remove duplicates and limit
        unique_keywords = list(set(keywords))
        return unique_keywords[:10]  # Limit to 10 keywords
    
    async def analyze_document_compliance(self, file_content: bytes, filename: str,
                                        compliance_framework: str = "general") -> Dict[str, Any]:
        """
        Analyze document for compliance with specific frameworks
        
        Args:
            file_content: Raw file content
            filename: Original filename
            compliance_framework: Framework to check against (GDPR, PCI-DSS, etc.)
            
        Returns:
            Compliance analysis results
        """
        try:
            # First parse the document
            parsing_result = await self.parse_policy_document_file(file_content, filename)
            
            if not parsing_result['success']:
                return parsing_result
            
            # Extract text for compliance analysis
            doc_result = self.document_parser.process_document(file_content, filename)
            extracted_text = doc_result['extracted_text']
            
            # Use OpenAI to analyze compliance
            violations, token_usage = await analyze_text(
                extracted_text,
                "compliance",
                compliance_framework,
                use_cache=True
            )
            
            # Combine parsing and compliance results
            combined_result = {
                **parsing_result,
                "compliance_analysis": {
                    "framework": compliance_framework,
                    "violations": violations,
                    "compliance_score": len(violations) / 10.0 if violations else 1.0,  # Simple scoring
                    "recommendations": [v.get('recommendation', '') for v in violations if isinstance(v, dict)],
                    "analysis_confidence": 0.8,  # Default confidence
                    "token_usage": token_usage
                }
            }
            
            return combined_result
                
        except Exception as e:
            logger.error(f"Compliance analysis error: {e}")
            return {
                "success": False,
                "error": str(e),
                "stage": "compliance_analysis"
            }

    async def parse_and_store_policy_document(
        self,
        file_content: bytes,
        filename: str,
        team_id: str,
        document_name: Optional[str] = None,
        document_type: Optional[str] = None,
        compliance_framework: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Parse a policy document and store results in the database
        """
        if not self.storage_service:
            raise PolicyParserError("Storage service not initialized")
        
        start_time = datetime.now()
        document_id = None
        
        try:
            # Step 1: Store initial document metadata
            document_parser = DocumentParser()
            validation_result = document_parser.validate_file(file_content, filename)
            
            document_id = await self.storage_service.store_document_metadata(
                team_id=team_id,
                filename=validation_result['filename'],
                original_filename=filename,
                file_type=validation_result['file_type'],
                file_size=validation_result['file_size'],
                file_hash=validation_result['file_hash'],
                document_name=document_name,
                document_type=document_type,
                compliance_framework=compliance_framework
            )
            
            # Log processing start
            await self.storage_service.log_processing_event(
                team_id=team_id,
                document_id=document_id,
                stage="validation",
                status="completed",
                message="Document validation completed successfully"
            )
            
            # Step 2: Update status to processing
            await self.storage_service.update_document_processing_status(
                document_id=document_id,
                status="processing"
            )
            
            # Step 3: Extract text from document
            await self.storage_service.log_processing_event(
                team_id=team_id,
                document_id=document_id,
                stage="text_extraction",
                status="started",
                message="Starting text extraction"
            )
            
            document_result = document_parser.process_document(file_content, filename)
            
            if not document_result['success']:
                raise PolicyParserError(f"Document processing failed: {document_result['error']}")
            
            extracted_text = document_result['extracted_text']
            processing_metadata = document_result['processing_metadata']
            
            # Step 4: Extract rules using OpenAI
            await self.storage_service.log_processing_event(
                team_id=team_id,
                document_id=document_id,
                stage="rule_extraction",
                status="started",
                message="Starting rule extraction with GPT-4"
            )
            
            parsing_result = await parse_policy_document(extracted_text)
            
            if not parsing_result or 'rules' not in parsing_result:
                raise PolicyParserError("Failed to extract rules from document")
            
            # Step 5: Store extracted rules
            rules = parsing_result.get('rules', [])
            rule_ids = await self.storage_service.store_policy_rules(
                team_id=team_id,
                document_id=document_id,
                rules=rules,
                extraction_metadata=parsing_result
            )
            
            # Step 6: Update document with processing results
            await self.storage_service.update_document_processing_status(
                document_id=document_id,
                status="completed",
                processing_metadata={
                    **processing_metadata,
                    "extracted_text": extracted_text,
                    "start_time": start_time
                }
            )
            
            # Log successful completion
            await self.storage_service.log_processing_event(
                team_id=team_id,
                document_id=document_id,
                stage="storage",
                status="completed",
                message=f"Successfully stored {len(rules)} rules",
                duration_ms=int((datetime.now() - start_time).total_seconds() * 1000),
                tokens_used=parsing_result.get('token_usage', 0),
                api_calls=1
            )
            
            return {
                'success': True,
                'document_id': document_id,
                'rules_extracted': len(rules),
                'processing_time_ms': int((datetime.now() - start_time).total_seconds() * 1000),
                'token_usage': parsing_result.get('token_usage', 0),
                'confidence': parsing_result.get('confidence', 0.0)
            }
            
        except Exception as e:
            # Log error and update document status
            if document_id:
                await self.storage_service.update_document_processing_status(
                    document_id=document_id,
                    status="failed",
                    error_message=str(e),
                    error_stage="rule_extraction"
                )
                
                await self.storage_service.log_processing_event(
                    team_id=team_id,
                    document_id=document_id,
                    stage="rule_extraction",
                    status="failed",
                    message=str(e),
                    error_type=type(e).__name__,
                    error_details={"error": str(e)}
                )
            
            logger.error(f"Policy document parsing failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'document_id': document_id
            } 