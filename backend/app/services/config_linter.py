"""
Static configuration linter for detecting security misconfigurations.
"""

import yaml
import json
import re
from typing import List, Dict, Any, Tuple, Optional
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
class ConfigViolation:
    type: ViolationType
    issue: str
    recommendation: str
    severity: Severity
    line_number: Optional[int] = None
    matched_content: str = None
    confidence_score: float = 0.8
    config_type: str = None

# Kubernetes security checks
KUBERNETES_CHECKS = {
    "run_as_root": {
        "pattern": r"runAsNonRoot:\s*false",
        "issue": "Container configured to run as root user",
        "recommendation": "Set runAsNonRoot: true to prevent containers from running as root",
        "severity": Severity.HIGH
    },
    "privileged_container": {
        "pattern": r"privileged:\s*true",
        "issue": "Container running in privileged mode",
        "recommendation": "Avoid privileged containers. Use specific capabilities instead",
        "severity": Severity.CRITICAL
    },
    "host_network": {
        "pattern": r"hostNetwork:\s*true",
        "issue": "Container using host network",
        "recommendation": "Avoid hostNetwork. Use service networking instead",
        "severity": Severity.HIGH
    },
    "host_pid": {
        "pattern": r"hostPID:\s*true",
        "issue": "Container using host PID namespace",
        "recommendation": "Avoid hostPID. Use container PID namespace",
        "severity": Severity.HIGH
    },
    "host_volume": {
        "pattern": r"hostPath:",
        "issue": "Host path volume mounted",
        "recommendation": "Avoid hostPath volumes. Use persistent volumes instead",
        "severity": Severity.MEDIUM
    },
    "no_resource_limits": {
        "pattern": r"resources:\s*{}",
        "issue": "No resource limits defined",
        "recommendation": "Define resource requests and limits for all containers",
        "severity": Severity.MEDIUM
    }
}

# Docker security checks
DOCKER_CHECKS = {
    "root_user": {
        "pattern": r"USER\s+root",
        "issue": "Dockerfile runs as root user",
        "recommendation": "Use non-root user in Dockerfile. Add USER directive",
        "severity": Severity.HIGH
    },
    "latest_tag": {
        "pattern": r"FROM\s+.*:latest",
        "issue": "Using 'latest' tag in Dockerfile",
        "recommendation": "Use specific version tags instead of 'latest'",
        "severity": Severity.MEDIUM
    },
    "no_healthcheck": {
        "pattern": r"(?<!HEALTHCHECK).*",
        "issue": "No health check defined",
        "recommendation": "Add HEALTHCHECK directive to Dockerfile",
        "severity": Severity.LOW
    }
}

# Terraform security checks
TERRAFORM_CHECKS = {
    "public_access": {
        "pattern": r"publicly_accessible\s*=\s*true",
        "issue": "Resource configured for public access",
        "recommendation": "Set publicly_accessible = false unless required",
        "severity": Severity.HIGH
    },
    "encryption_disabled": {
        "pattern": r"encrypted\s*=\s*false",
        "issue": "Encryption disabled on resource",
        "recommendation": "Enable encryption for all storage resources",
        "severity": Severity.CRITICAL
    },
    "no_logging": {
        "pattern": r"logging\s*{\s*}",
        "issue": "No logging configuration",
        "recommendation": "Configure comprehensive logging for security monitoring",
        "severity": Severity.MEDIUM
    }
}

# Environment variable security checks
ENV_CHECKS = {
    "hardcoded_secret": {
        "pattern": r"(API_KEY|SECRET|PASSWORD|TOKEN)\s*=\s*['\"]?\w+['\"]?",
        "issue": "Hardcoded secret in environment variable",
        "recommendation": "Use environment variables or secrets management instead of hardcoded values",
        "severity": Severity.CRITICAL
    },
    "debug_enabled": {
        "pattern": r"DEBUG\s*=\s*true",
        "issue": "Debug mode enabled",
        "recommendation": "Disable debug mode in production environments",
        "severity": Severity.MEDIUM
    }
}

def detect_config_type(text: str) -> str:
    """
    Detect the type of configuration file based on content.
    
    Args:
        text: Configuration file content
        
    Returns:
        Detected config type (kubernetes, docker, terraform, env, json, yaml, unknown)
    """
    text_lower = text.lower()
    
    # Check for Kubernetes manifests
    if any(keyword in text_lower for keyword in ["apiVersion:", "kind:", "metadata:", "spec:"]):
        return "kubernetes"
    
    # Check for Dockerfile
    if any(keyword in text_lower for keyword in ["FROM", "RUN", "COPY", "ADD", "CMD", "ENTRYPOINT"]):
        return "docker"
    
    # Check for Terraform
    if any(keyword in text_lower for keyword in ["terraform", "resource", "provider", "variable", "output"]):
        return "terraform"
    
    # Check for environment files
    if re.search(r"^\w+\s*=", text, re.MULTILINE):
        return "env"
    
    # Check for JSON
    if text.strip().startswith("{") or text.strip().startswith("["):
        return "json"
    
    # Check for YAML
    if re.search(r"^\s*[\w-]+:", text, re.MULTILINE):
        return "yaml"
    
    return "unknown"

def lint_kubernetes_config(text: str) -> List[ConfigViolation]:
    """
    Lint Kubernetes configuration for security issues.
    
    Args:
        text: Kubernetes YAML content
        
    Returns:
        List of security violations found
    """
    violations = []
    lines = text.split('\n')
    
    for check_name, check_config in KUBERNETES_CHECKS.items():
        pattern = re.compile(check_config["pattern"], re.IGNORECASE)
        
        for line_num, line in enumerate(lines, 1):
            if pattern.search(line):
                violations.append(ConfigViolation(
                    type=ViolationType.SECURITY,
                    issue=check_config["issue"],
                    recommendation=check_config["recommendation"],
                    severity=check_config["severity"],
                    line_number=line_num,
                    matched_content=line.strip(),
                    confidence_score=0.9,
                    config_type="kubernetes"
                ))
    
    return violations

def lint_docker_config(text: str) -> List[ConfigViolation]:
    """
    Lint Dockerfile for security issues.
    
    Args:
        text: Dockerfile content
        
    Returns:
        List of security violations found
    """
    violations = []
    lines = text.split('\n')
    
    for check_name, check_config in DOCKER_CHECKS.items():
        pattern = re.compile(check_config["pattern"], re.IGNORECASE)
        
        for line_num, line in enumerate(lines, 1):
            if pattern.search(line):
                violations.append(ConfigViolation(
                    type=ViolationType.SECURITY,
                    issue=check_config["issue"],
                    recommendation=check_config["recommendation"],
                    severity=check_config["severity"],
                    line_number=line_num,
                    matched_content=line.strip(),
                    confidence_score=0.9,
                    config_type="docker"
                ))
    
    return violations

def lint_terraform_config(text: str) -> List[ConfigViolation]:
    """
    Lint Terraform configuration for security issues.
    
    Args:
        text: Terraform HCL content
        
    Returns:
        List of security violations found
    """
    violations = []
    lines = text.split('\n')
    
    for check_name, check_config in TERRAFORM_CHECKS.items():
        pattern = re.compile(check_config["pattern"], re.IGNORECASE)
        
        for line_num, line in enumerate(lines, 1):
            if pattern.search(line):
                violations.append(ConfigViolation(
                    type=ViolationType.SECURITY,
                    issue=check_config["issue"],
                    recommendation=check_config["recommendation"],
                    severity=check_config["severity"],
                    line_number=line_num,
                    matched_content=line.strip(),
                    confidence_score=0.9,
                    config_type="terraform"
                ))
    
    return violations

def lint_env_config(text: str) -> List[ConfigViolation]:
    """
    Lint environment configuration for security issues.
    
    Args:
        text: Environment file content
        
    Returns:
        List of security violations found
    """
    violations = []
    lines = text.split('\n')
    
    for check_name, check_config in ENV_CHECKS.items():
        pattern = re.compile(check_config["pattern"], re.IGNORECASE)
        
        for line_num, line in enumerate(lines, 1):
            if pattern.search(line):
                violations.append(ConfigViolation(
                    type=ViolationType.SECURITY,
                    issue=check_config["issue"],
                    recommendation=check_config["recommendation"],
                    severity=check_config["severity"],
                    line_number=line_num,
                    matched_content=line.strip(),
                    confidence_score=0.9,
                    config_type="env"
                ))
    
    return violations

def lint_configs(text: str) -> List[ConfigViolation]:
    """
    Lint configuration files for security misconfigurations.
    
    Args:
        text: Configuration file content
        
    Returns:
        List of security violations found
    """
    violations = []
    
    try:
        # Detect configuration type
        config_type = detect_config_type(text)
        logger.info(f"Detected config type: {config_type}")
        
        # Apply appropriate linting based on config type
        if config_type == "kubernetes":
            violations.extend(lint_kubernetes_config(text))
        elif config_type == "docker":
            violations.extend(lint_docker_config(text))
        elif config_type == "terraform":
            violations.extend(lint_terraform_config(text))
        elif config_type == "env":
            violations.extend(lint_env_config(text))
        elif config_type in ["json", "yaml"]:
            # Generic checks for JSON/YAML
            violations.extend(lint_generic_config(text, config_type))
        
        logger.info(f"Config linting found {len(violations)} violations")
        
    except Exception as e:
        logger.error(f"Error during config linting: {e}")
        # Return empty list on error to not break the pipeline
    
    return violations

def lint_generic_config(text: str, config_type: str) -> List[ConfigViolation]:
    """
    Generic linting for JSON/YAML configurations.
    
    Args:
        text: Configuration content
        config_type: Type of configuration (json/yaml)
        
    Returns:
        List of security violations found
    """
    violations = []
    
    try:
        # Parse configuration
        if config_type == "json":
            config = json.loads(text)
        elif config_type == "yaml":
            config = yaml.safe_load(text)
        else:
            return violations
        
        # Check for common security issues in parsed config
        violations.extend(check_parsed_config_security(config, config_type))
        
    except (json.JSONDecodeError, yaml.YAMLError) as e:
        logger.warning(f"Failed to parse {config_type} config: {e}")
    
    return violations

def check_parsed_config_security(config: Any, config_type: str) -> List[ConfigViolation]:
    """
    Check parsed configuration for security issues.
    
    Args:
        config: Parsed configuration object
        config_type: Type of configuration
        
    Returns:
        List of security violations found
    """
    violations = []
    
    # Recursively check for hardcoded secrets
    def check_for_secrets(obj, path=""):
        if isinstance(obj, dict):
            for key, value in obj.items():
                current_path = f"{path}.{key}" if path else key
                check_for_secrets(value, current_path)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                current_path = f"{path}[{i}]"
                check_for_secrets(item, current_path)
        elif isinstance(obj, str):
            # Check for potential secrets
            secret_patterns = [
                (r"sk_[a-zA-Z0-9]{24}", "Stripe secret key"),
                (r"AKIA[A-Z0-9]{16}", "AWS access key"),
                (r"[a-zA-Z0-9]{32,}", "Long string (potential secret)")
            ]
            
            for pattern, description in secret_patterns:
                if re.match(pattern, obj):
                    violations.append(ConfigViolation(
                        type=ViolationType.SECURITY,
                        issue=f"Potential {description} in configuration",
                        recommendation="Remove hardcoded secrets. Use environment variables or secrets management",
                        severity=Severity.CRITICAL,
                        matched_content=obj,
                        confidence_score=0.8,
                        config_type=config_type
                    ))
    
    check_for_secrets(config)
    return violations

def get_config_summary(violations: List[ConfigViolation]) -> Dict[str, Any]:
    """
    Generate a summary of configuration violations.
    
    Args:
        violations: List of configuration violations
        
    Returns:
        Summary dictionary
    """
    summary = {
        "total_config_violations": len(violations),
        "by_config_type": {},
        "by_severity": {},
        "critical_count": 0,
        "high_count": 0,
        "medium_count": 0,
        "low_count": 0
    }
    
    for violation in violations:
        # Count by config type
        config_type = violation.config_type or "unknown"
        if config_type not in summary["by_config_type"]:
            summary["by_config_type"][config_type] = 0
        summary["by_config_type"][config_type] += 1
        
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