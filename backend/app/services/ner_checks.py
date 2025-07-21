"""
Named Entity Recognition (NER) service for enhanced PII detection.
"""

import spacy
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
from enum import Enum
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ViolationType(Enum):
    PII = "PII"
    SECURITY = "Security"
    DATA_SHARING = "Data Sharing"
    REGULATORY = "Regulatory"

class Severity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class NERViolation:
    type: ViolationType
    issue: str
    recommendation: str
    severity: Severity
    span: Tuple[int, int] = None
    matched_content: str = None
    confidence_score: float = 0.8
    entity_type: str = None

# Entity types that indicate PII
PII_ENTITY_TYPES = {
    "PERSON": {
        "severity": Severity.MEDIUM,
        "issue": "Person name detected",
        "recommendation": "Consider if person names need to be exposed. Use generic placeholders in examples."
    },
    "ORG": {
        "severity": Severity.LOW,
        "issue": "Organization name detected",
        "recommendation": "Consider if organization names need to be exposed. Use generic placeholders in examples."
    },
    "GPE": {  # Countries, cities, states
        "severity": Severity.LOW,
        "issue": "Geographic location detected",
        "recommendation": "Consider if geographic locations need to be exposed. Use generic placeholders in examples."
    },
    "LOC": {  # Non-GPE locations
        "severity": Severity.LOW,
        "issue": "Location detected",
        "recommendation": "Consider if locations need to be exposed. Use generic placeholders in examples."
    },
    "DATE": {
        "severity": Severity.LOW,
        "issue": "Date detected",
        "recommendation": "Consider if specific dates need to be exposed. Use generic date placeholders in examples."
    },
    "TIME": {
        "severity": Severity.LOW,
        "issue": "Time detected",
        "recommendation": "Consider if specific times need to be exposed. Use generic time placeholders in examples."
    },
    "MONEY": {
        "severity": Severity.MEDIUM,
        "issue": "Monetary amount detected",
        "recommendation": "Consider if monetary amounts need to be exposed. Use generic placeholders in examples."
    },
    "CARDINAL": {  # Numbers
        "severity": Severity.LOW,
        "issue": "Cardinal number detected",
        "recommendation": "Consider if specific numbers need to be exposed. Use generic placeholders in examples."
    }
}

# Initialize spaCy model (fallback to smaller model if large one not available)
try:
    nlp = spacy.load("en_core_web_sm")
    logger.info("Loaded spaCy model: en_core_web_sm")
except OSError:
    try:
        nlp = spacy.load("en_core_web_md")
        logger.info("Loaded spaCy model: en_core_web_md")
    except OSError:
        # Fallback: use basic English model
        nlp = spacy.load("en_core_web_sm")
        logger.warning("Using fallback spaCy model. Install 'python -m spacy download en_core_web_sm' for better NER")

def tag_entities(text: str) -> List[NERViolation]:
    """
    Use spaCy NER to detect named entities that might be PII.
    
    Args:
        text: Input text to analyze
        
    Returns:
        List of NER violations found
    """
    violations = []
    
    try:
        # Process text with spaCy
        doc = nlp(text)
        
        for ent in doc.ents:
            # Check if this entity type is in our PII mapping
            if ent.label_ in PII_ENTITY_TYPES:
                entity_info = PII_ENTITY_TYPES[ent.label_]
                
                # Calculate confidence based on entity length and context
                confidence_score = calculate_ner_confidence(ent, text)
                
                # Skip low confidence matches
                if confidence_score < 0.5:
                    continue
                
                violation = NERViolation(
                    type=ViolationType.PII,
                    issue=entity_info["issue"],
                    recommendation=entity_info["recommendation"],
                    severity=entity_info["severity"],
                    span=(ent.start_char, ent.end_char),
                    matched_content=ent.text,
                    confidence_score=confidence_score,
                    entity_type=ent.label_
                )
                
                violations.append(violation)
                
    except Exception as e:
        logger.error(f"Error in NER processing: {e}")
        # Return empty list on error to not break the pipeline
    
    return violations

def calculate_ner_confidence(entity, text: str) -> float:
    """
    Calculate confidence score for NER entity based on various factors.
    
    Args:
        entity: spaCy entity object
        text: Original text
        
    Returns:
        Confidence score between 0 and 1
    """
    base_confidence = 0.7
    
    # Adjust confidence based on entity length
    if len(entity.text) < 2:
        base_confidence *= 0.5
    elif len(entity.text) > 20:
        base_confidence *= 0.8
    
    # Adjust confidence based on entity type
    if entity.label_ == "PERSON":
        # Names are more likely to be PII
        base_confidence *= 1.2
    elif entity.label_ == "CARDINAL":
        # Numbers are less likely to be PII unless in specific contexts
        base_confidence *= 0.6
    
    # Adjust confidence based on context
    context_words = ["user", "customer", "client", "employee", "admin", "test"]
    if any(word in text.lower() for word in context_words):
        base_confidence *= 1.1
    
    # Cap confidence at 0.95
    return min(base_confidence, 0.95)

def filter_ner_violations(violations: List[NERViolation], min_confidence: float = 0.6) -> List[NERViolation]:
    """
    Filter NER violations based on confidence threshold.
    
    Args:
        violations: List of NER violations
        min_confidence: Minimum confidence threshold
        
    Returns:
        Filtered list of violations
    """
    return [v for v in violations if v.confidence_score >= min_confidence]

def get_ner_summary(violations: List[NERViolation]) -> Dict[str, Any]:
    """
    Generate a summary of NER violations.
    
    Args:
        violations: List of NER violations
        
    Returns:
        Summary dictionary
    """
    summary = {
        "total_ner_violations": len(violations),
        "by_entity_type": {},
        "by_severity": {},
        "average_confidence": 0.0
    }
    
    if violations:
        total_confidence = sum(v.confidence_score for v in violations)
        summary["average_confidence"] = total_confidence / len(violations)
    
    for violation in violations:
        # Count by entity type
        entity_type = violation.entity_type or "unknown"
        if entity_type not in summary["by_entity_type"]:
            summary["by_entity_type"][entity_type] = 0
        summary["by_entity_type"][entity_type] += 1
        
        # Count by severity
        severity = violation.severity.value
        if severity not in summary["by_severity"]:
            summary["by_severity"][severity] = 0
        summary["by_severity"][severity] += 1
    
    return summary 