"""
Regex-based compliance checks for PII, security misconfigurations, and unauthorized data sharing.
"""

import re
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
from enum import Enum

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
class Violation:
    type: ViolationType
    issue: str
    recommendation: str
    severity: Severity
    span: Tuple[int, int] = None
    matched_content: str = None
    confidence_score: float = 0.8

# PII Patterns
SSN_PATTERN = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
CREDIT_CARD_PATTERN = re.compile(r"\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b")
EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
PHONE_PATTERN = re.compile(r"\b(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b")
IP_ADDRESS_PATTERN = re.compile(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b")
MAC_ADDRESS_PATTERN = re.compile(r"\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\b")

# Security Misconfiguration Patterns
HTTP_PATTERN = re.compile(r"https?://[^\s]+", re.IGNORECASE)
NO_MFA_PATTERN = re.compile(r"\b(no mfa|2fa disabled|two factor disabled|multifactor disabled)\b", re.IGNORECASE)
ROOT_USER_PATTERN = re.compile(r"\b(runAsNonRoot:\s*false|run_as_root|root user)\b", re.IGNORECASE)
HARDCODED_PASSWORD_PATTERN = re.compile(r"\b(password|passwd|pwd)\s*[:=]\s*['\"]?\w+['\"]?\b", re.IGNORECASE)
DEBUG_MODE_PATTERN = re.compile(r"\b(debug:\s*true|debug_mode|development mode)\b", re.IGNORECASE)

# Unauthorized Data Sharing Patterns
UNAPPROVED_DOMAINS = [
    r"dropbox\.com",
    r"wetransfer\.com", 
    r"sendspace\.com",
    r"mediafire\.com",
    r"mega\.nz",
    r"4shared\.com",
    r"rapidshare\.com",
    r"filefactory\.com",
    r"uploaded\.net",
    r"turbobit\.net"
]

UNAPPROVED_SHARING_PATTERN = re.compile(
    r"https?://(" + "|".join(UNAPPROVED_DOMAINS) + r")[^\s]*", 
    re.IGNORECASE
)

def scan_pii(text: str) -> List[Violation]:
    """
    Scan text for Personally Identifiable Information (PII).
    
    Args:
        text: Input text to scan
        
    Returns:
        List of PII violations found
    """
    violations = []
    
    # SSN Detection
    for match in SSN_PATTERN.finditer(text):
        violations.append(Violation(
            type=ViolationType.PII,
            issue="Social Security Number (SSN) detected",
            recommendation="Remove or redact SSN. Use environment variables or secure storage for sensitive identifiers.",
            severity=Severity.HIGH,
            span=match.span(),
            matched_content=match.group(),
            confidence_score=0.95
        ))
    
    # Credit Card Detection
    for match in CREDIT_CARD_PATTERN.finditer(text):
        violations.append(Violation(
            type=ViolationType.PII,
            issue="Credit card number detected",
            recommendation="Remove credit card information. Use PCI-compliant payment processors for handling payment data.",
            severity=Severity.CRITICAL,
            span=match.span(),
            matched_content=match.group(),
            confidence_score=0.9
        ))
    
    # Email Detection
    for match in EMAIL_PATTERN.finditer(text):
        violations.append(Violation(
            type=ViolationType.PII,
            issue="Email address detected",
            recommendation="Consider if email addresses need to be exposed. Use generic placeholders in examples.",
            severity=Severity.MEDIUM,
            span=match.span(),
            matched_content=match.group(),
            confidence_score=0.8
        ))
    
    # Phone Number Detection
    for match in PHONE_PATTERN.finditer(text):
        violations.append(Violation(
            type=ViolationType.PII,
            issue="Phone number detected",
            recommendation="Remove or redact phone numbers. Use placeholder values in documentation.",
            severity=Severity.MEDIUM,
            span=match.span(),
            matched_content=match.group(),
            confidence_score=0.8
        ))
    
    # IP Address Detection
    for match in IP_ADDRESS_PATTERN.finditer(text):
        violations.append(Violation(
            type=ViolationType.PII,
            issue="IP address detected",
            recommendation="Remove or redact IP addresses. Use placeholder IPs (e.g., 192.168.1.1) in examples.",
            severity=Severity.MEDIUM,
            span=match.span(),
            matched_content=match.group(),
            confidence_score=0.7
        ))
    
    # MAC Address Detection
    for match in MAC_ADDRESS_PATTERN.finditer(text):
        violations.append(Violation(
            type=ViolationType.PII,
            issue="MAC address detected",
            recommendation="Remove or redact MAC addresses. Use placeholder MACs in examples.",
            severity=Severity.MEDIUM,
            span=match.span(),
            matched_content=match.group(),
            confidence_score=0.7
        ))
    
    return violations

def scan_security_misconfigs(text: str) -> List[Violation]:
    """
    Scan text for security misconfigurations.
    
    Args:
        text: Input text to scan
        
    Returns:
        List of security misconfiguration violations found
    """
    violations = []
    
    # HTTP vs HTTPS
    for match in HTTP_PATTERN.finditer(text):
        if match.group().startswith("http://"):
            violations.append(Violation(
                type=ViolationType.SECURITY,
                issue="Insecure HTTP URL detected",
                recommendation="Use HTTPS instead of HTTP for all web communications. HTTP transmits data in plain text.",
                severity=Severity.HIGH,
                span=match.span(),
                matched_content=match.group(),
                confidence_score=0.9
            ))
    
    # MFA/2FA Disabled
    for match in NO_MFA_PATTERN.finditer(text):
        violations.append(Violation(
            type=ViolationType.SECURITY,
            issue="Multi-factor authentication disabled or not configured",
            recommendation="Enable multi-factor authentication (MFA/2FA) for all user accounts and administrative access.",
            severity=Severity.HIGH,
            span=match.span(),
            matched_content=match.group(),
            confidence_score=0.85
        ))
    
    # Root User Configuration
    for match in ROOT_USER_PATTERN.finditer(text):
        violations.append(Violation(
            type=ViolationType.SECURITY,
            issue="Container or process configured to run as root user",
            recommendation="Configure containers and processes to run as non-root users. Use runAsNonRoot: true in Kubernetes.",
            severity=Severity.HIGH,
            span=match.span(),
            matched_content=match.group(),
            confidence_score=0.9
        ))
    
    # Hardcoded Passwords
    for match in HARDCODED_PASSWORD_PATTERN.finditer(text):
        violations.append(Violation(
            type=ViolationType.SECURITY,
            issue="Hardcoded password or credential detected",
            recommendation="Remove hardcoded credentials. Use environment variables, secrets management, or secure credential stores.",
            severity=Severity.CRITICAL,
            span=match.span(),
            matched_content=match.group(),
            confidence_score=0.95
        ))
    
    # Debug Mode Enabled
    for match in DEBUG_MODE_PATTERN.finditer(text):
        violations.append(Violation(
            type=ViolationType.SECURITY,
            issue="Debug mode enabled in production configuration",
            recommendation="Disable debug mode in production environments. Debug mode can expose sensitive information.",
            severity=Severity.MEDIUM,
            span=match.span(),
            matched_content=match.group(),
            confidence_score=0.8
        ))
    
    return violations

def scan_unauthorized_sharing(text: str) -> List[Violation]:
    """
    Scan text for unauthorized data sharing via unapproved services.
    
    Args:
        text: Input text to scan
        
    Returns:
        List of unauthorized sharing violations found
    """
    violations = []
    
    for match in UNAPPROVED_SHARING_PATTERN.finditer(text):
        domain = match.group(1) if match.groups() else "unknown"
        violations.append(Violation(
            type=ViolationType.DATA_SHARING,
            issue=f"Unauthorized data sharing via {domain}",
            recommendation=f"Use approved enterprise storage solutions instead of {domain}. Contact IT for approved alternatives.",
            severity=Severity.HIGH,
            span=match.span(),
            matched_content=match.group(),
            confidence_score=0.9
        ))
    
    return violations

def scan_all_regex_patterns(text: str, source: str = "manual") -> List[Violation]:
    """
    Run all regex-based compliance checks.
    
    Args:
        text: Input text to scan
        source: Source of the content (github, manual, etc.)
        
    Returns:
        List of all violations found
    """
    violations = []
    
    # Always scan for PII and unauthorized sharing
    violations.extend(scan_pii(text))
    violations.extend(scan_unauthorized_sharing(text))
    
    # Scan for security misconfigurations (especially relevant for code/config files)
    if source in ["github", "gitlab", "manual"]:
        violations.extend(scan_security_misconfigs(text))
    
    return violations

def get_violation_summary(violations: List[Violation]) -> Dict[str, Any]:
    """
    Generate a summary of violations by type and severity.
    
    Args:
        violations: List of violations
        
    Returns:
        Summary dictionary with counts and breakdowns
    """
    summary = {
        "total_violations": len(violations),
        "by_type": {},
        "by_severity": {},
        "critical_count": 0,
        "high_count": 0,
        "medium_count": 0,
        "low_count": 0
    }
    
    for violation in violations:
        # Count by type
        violation_type = violation.type.value
        if violation_type not in summary["by_type"]:
            summary["by_type"][violation_type] = 0
        summary["by_type"][violation_type] += 1
        
        # Count by severity
        severity = violation.severity.value
        if severity not in summary["by_severity"]:
            summary["by_severity"][severity] = 0
        summary["by_severity"][severity] += 1
        
        # Count critical/high violations
        if violation.severity == Severity.CRITICAL:
            summary["critical_count"] += 1
        elif violation.severity == Severity.HIGH:
            summary["high_count"] += 1
        elif violation.severity == Severity.MEDIUM:
            summary["medium_count"] += 1
        elif violation.severity == Severity.LOW:
            summary["low_count"] += 1
    
    return summary 