"""
Retrieval-Augmented Generation (RAG) service for regulatory compliance context.
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum
import hashlib
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RegulationType(Enum):
    GDPR = "GDPR"
    HIPAA = "HIPAA"
    PCI_DSS = "PCI-DSS"
    SOC2 = "SOC2"
    SOX = "SOX"
    CCPA = "CCPA"
    ISO27001 = "ISO27001"
    NIST = "NIST"

@dataclass
class RegulatoryContext:
    regulation: RegulationType
    section: str
    title: str
    content: str
    relevance_score: float
    source: str

# Sample regulatory knowledge base
REGULATORY_KNOWLEDGE_BASE = {
    RegulationType.GDPR: [
        {
            "section": "Article 5",
            "title": "Principles of processing personal data",
            "content": "Personal data shall be processed lawfully, fairly and in a transparent manner. Data minimization: personal data shall be adequate, relevant and limited to what is necessary.",
            "keywords": ["personal data", "data minimization", "transparency", "lawful processing"]
        },
        {
            "section": "Article 32",
            "title": "Security of processing",
            "content": "Implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including encryption of personal data.",
            "keywords": ["security", "encryption", "technical measures", "risk assessment"]
        },
        {
            "section": "Article 25",
            "title": "Data protection by design and by default",
            "content": "Implement appropriate technical and organizational measures designed to implement data-protection principles effectively.",
            "keywords": ["privacy by design", "data protection", "technical measures"]
        }
    ],
    RegulationType.HIPAA: [
        {
            "section": "164.312",
            "title": "Technical safeguards",
            "content": "Implement technical policies and procedures for electronic information systems that maintain electronic protected health information.",
            "keywords": ["technical safeguards", "electronic health information", "access control"]
        },
        {
            "section": "164.308",
            "title": "Administrative safeguards",
            "content": "Implement policies and procedures to prevent, detect, contain, and correct security violations.",
            "keywords": ["administrative safeguards", "security policies", "incident response"]
        }
    ],
    RegulationType.PCI_DSS: [
        {
            "section": "Requirement 3",
            "title": "Protect stored cardholder data",
            "content": "Protect stored cardholder data through strong cryptography and other security measures.",
            "keywords": ["cardholder data", "encryption", "strong cryptography", "storage security"]
        },
        {
            "section": "Requirement 4",
            "title": "Encrypt transmission of cardholder data",
            "content": "Encrypt transmission of cardholder data across open, public networks.",
            "keywords": ["transmission encryption", "public networks", "cardholder data"]
        },
        {
            "section": "Requirement 7",
            "title": "Restrict access to cardholder data",
            "content": "Restrict access to cardholder data on a need-to-know basis.",
            "keywords": ["access control", "need-to-know", "cardholder data", "restricted access"]
        }
    ],
    RegulationType.SOC2: [
        {
            "section": "CC6.1",
            "title": "Logical and physical access controls",
            "content": "The entity implements logical access security software, infrastructure, and architectures over protected information assets.",
            "keywords": ["access controls", "logical security", "protected information", "infrastructure"]
        },
        {
            "section": "CC7.1",
            "title": "System operation monitoring",
            "content": "The entity selects and develops security monitoring and control activities that detect and respond to security events.",
            "keywords": ["monitoring", "security events", "detection", "response"]
        }
    ],
    RegulationType.SOX: [
        {
            "section": "Section 404",
            "title": "Management assessment of internal controls",
            "content": "Management must establish and maintain adequate internal control structure and procedures for financial reporting.",
            "keywords": ["internal controls", "financial reporting", "management assessment"]
        }
    ],
    RegulationType.CCPA: [
        {
            "section": "1798.100",
            "title": "General duties of businesses that collect personal information",
            "content": "A business that collects personal information about a consumer shall disclose the categories of personal information collected.",
            "keywords": ["personal information", "disclosure", "consumer rights", "transparency"]
        }
    ],
    RegulationType.ISO27001: [
        {
            "section": "A.9.2",
            "title": "User access management",
            "content": "Formal user registration and de-registration procedures shall be implemented to enable assignment of access rights.",
            "keywords": ["access management", "user registration", "access rights", "procedures"]
        },
        {
            "section": "A.12.2",
            "title": "Protection from malware",
            "content": "Detection, prevention and recovery controls to protect against malware shall be implemented.",
            "keywords": ["malware protection", "detection", "prevention", "recovery"]
        }
    ],
    RegulationType.NIST: [
        {
            "section": "NIST CSF PR.AC",
            "title": "Identity Management and Access Control",
            "content": "Access to physical and logical assets and associated facilities is limited to authorized users, processes, and devices.",
            "keywords": ["access control", "identity management", "authorized access", "physical security"]
        },
        {
            "section": "NIST CSF DE.CM",
            "title": "Security Continuous Monitoring",
            "content": "The information system and assets are monitored at discrete intervals to identify cybersecurity events.",
            "keywords": ["continuous monitoring", "cybersecurity events", "system monitoring"]
        }
    ]
}

def calculate_relevance_score(text: str, keywords: List[str]) -> float:
    """
    Calculate relevance score between text and keywords.
    
    Args:
        text: Input text to analyze
        keywords: List of keywords to match against
        
    Returns:
        Relevance score between 0 and 1
    """
    text_lower = text.lower()
    matches = 0
    
    for keyword in keywords:
        if keyword.lower() in text_lower:
            matches += 1
    
    # Normalize by number of keywords
    if not keywords:
        return 0.0
    
    return min(matches / len(keywords), 1.0)

def retrieve_regulation_context(text: str, max_contexts: int = 3) -> List[RegulatoryContext]:
    """
    Retrieve relevant regulatory contexts for the given text.
    
    Args:
        text: Input text to analyze
        max_contexts: Maximum number of contexts to return per regulation
        
    Returns:
        List of relevant regulatory contexts
    """
    contexts = []
    
    try:
        for regulation_type, regulation_data in REGULATORY_KNOWLEDGE_BASE.items():
            regulation_contexts = []
            
            for item in regulation_data:
                relevance_score = calculate_relevance_score(text, item["keywords"])
                
                # Only include contexts with reasonable relevance
                if relevance_score > 0.1:
                    context = RegulatoryContext(
                        regulation=regulation_type,
                        section=item["section"],
                        title=item["title"],
                        content=item["content"],
                        relevance_score=relevance_score,
                        source=f"{regulation_type.value} {item['section']}"
                    )
                    regulation_contexts.append(context)
            
            # Sort by relevance and take top contexts
            regulation_contexts.sort(key=lambda x: x.relevance_score, reverse=True)
            contexts.extend(regulation_contexts[:max_contexts])
        
        # Sort all contexts by relevance
        contexts.sort(key=lambda x: x.relevance_score, reverse=True)
        
        logger.info(f"Retrieved {len(contexts)} regulatory contexts")
        
    except Exception as e:
        logger.error(f"Error retrieving regulatory context: {e}")
    
    return contexts

def analyze_regulatory_compliance(text: str, source: str) -> Dict[str, Any]:
    """
    Analyze text for regulatory compliance issues.
    
    Args:
        text: Input text to analyze
        source: Source of the content
        
    Returns:
        Dictionary with regulatory analysis results
    """
    analysis_result = {
        "regulatory_violations": [],
        "relevant_regulations": [],
        "compliance_score": 0.0,
        "recommendations": []
    }
    
    try:
        # Retrieve relevant regulatory contexts
        contexts = retrieve_regulation_context(text)
        
        # Analyze for specific regulatory violations
        violations = []
        relevant_regulations = set()
        
        # Check for GDPR violations
        if any("personal data" in text.lower() or "gdpr" in text.lower() for context in contexts if context.regulation == RegulationType.GDPR):
            relevant_regulations.add("GDPR")
            if "password" in text.lower() or "email" in text.lower():
                violations.append({
                    "regulation": "GDPR",
                    "issue": "Potential personal data exposure",
                    "severity": "high",
                    "recommendation": "Ensure personal data is processed lawfully and securely"
                })
        
        # Check for PCI-DSS violations
        if any("card" in text.lower() or "payment" in text.lower() for context in contexts if context.regulation == RegulationType.PCI_DSS):
            relevant_regulations.add("PCI-DSS")
            if "sk_" in text or "pk_" in text:
                violations.append({
                    "regulation": "PCI-DSS",
                    "issue": "Payment card data security violation",
                    "severity": "critical",
                    "recommendation": "Encrypt all payment card data and follow PCI-DSS requirements"
                })
        
        # Check for HIPAA violations
        if any("health" in text.lower() or "medical" in text.lower() for context in contexts if context.regulation == RegulationType.HIPAA):
            relevant_regulations.add("HIPAA")
            if "patient" in text.lower() or "medical" in text.lower():
                violations.append({
                    "regulation": "HIPAA",
                    "issue": "Potential PHI exposure",
                    "severity": "high",
                    "recommendation": "Implement appropriate safeguards for protected health information"
                })
        
        # Check for SOC2 violations
        if any("access" in text.lower() or "security" in text.lower() for context in contexts if context.regulation == RegulationType.SOC2):
            relevant_regulations.add("SOC2")
            if "root" in text.lower() or "admin" in text.lower():
                violations.append({
                    "regulation": "SOC2",
                    "issue": "Access control violation",
                    "severity": "medium",
                    "recommendation": "Implement proper access controls and monitoring"
                })
        
        # Calculate compliance score
        total_checks = len(relevant_regulations)
        passed_checks = total_checks - len(violations)
        compliance_score = (passed_checks / total_checks * 100) if total_checks > 0 else 100.0
        
        analysis_result.update({
            "regulatory_violations": violations,
            "relevant_regulations": list(relevant_regulations),
            "compliance_score": compliance_score,
            "contexts": [{
                "regulation": context.regulation.value,
                "section": context.section,
                "title": context.title,
                "content": context.content,
                "relevance_score": context.relevance_score
            } for context in contexts[:5]]  # Top 5 most relevant contexts
        })
        
        logger.info(f"Regulatory analysis found {len(violations)} violations across {len(relevant_regulations)} regulations")
        
    except Exception as e:
        logger.error(f"Error in regulatory compliance analysis: {e}")
    
    return analysis_result

def get_regulatory_summary(analysis_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate a summary of regulatory compliance analysis.
    
    Args:
        analysis_result: Result from regulatory compliance analysis
        
    Returns:
        Summary dictionary
    """
    summary = {
        "total_regulatory_violations": len(analysis_result.get("regulatory_violations", [])),
        "relevant_regulations": analysis_result.get("relevant_regulations", []),
        "compliance_score": analysis_result.get("compliance_score", 100.0),
        "by_regulation": {},
        "by_severity": {}
    }
    
    # Count violations by regulation and severity
    for violation in analysis_result.get("regulatory_violations", []):
        regulation = violation.get("regulation", "unknown")
        severity = violation.get("severity", "medium")
        
        # Count by regulation
        if regulation not in summary["by_regulation"]:
            summary["by_regulation"][regulation] = 0
        summary["by_regulation"][regulation] += 1
        
        # Count by severity
        if severity not in summary["by_severity"]:
            summary["by_severity"][severity] = 0
        summary["by_severity"][severity] += 1
    
    return summary

def create_regulatory_prompt(text: str, contexts: List[RegulatoryContext]) -> str:
    """
    Create a prompt for LLM analysis with regulatory context.
    
    Args:
        text: Input text to analyze
        contexts: Relevant regulatory contexts
        
    Returns:
        Formatted prompt for LLM analysis
    """
    prompt = """You are AutoProof, a compliance analysis system. Analyze the following text for regulatory compliance issues.

RELEVANT REGULATORY CONTEXTS:
"""
    
    for context in contexts[:3]:  # Top 3 most relevant contexts
        prompt += f"""
{context.regulation.value} - {context.section}: {context.title}
{context.content}
"""
    
    prompt += f"""
TEXT TO ANALYZE:
{text}

Please identify specific regulatory compliance violations and provide recommendations. Consider:
1. Data protection and privacy regulations (GDPR, CCPA)
2. Financial regulations (SOX, PCI-DSS)
3. Healthcare regulations (HIPAA)
4. Security standards (SOC2, ISO27001, NIST)

Format your response as a JSON object with the following structure:
{{
    "violations": [
        {{
            "regulation": "regulation_name",
            "issue": "description of the violation",
            "severity": "low|medium|high|critical",
            "recommendation": "specific recommendation to fix the issue"
        }}
    ],
    "compliance_score": 85.0,
    "relevant_regulations": ["GDPR", "PCI-DSS"],
    "summary": "brief summary of compliance status"
}}
"""
    
    return prompt 