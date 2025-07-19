from typing import List, Literal
from pydantic import BaseModel

class AnalyzeRequest(BaseModel):
    source: Literal["slack", "github", "custom"]
    text: str

class Violation(BaseModel):
    type: str
    issue: str
    recommendation: str
    severity: str  # e.g., "low", "medium", "high"

class AnalyzeResponse(BaseModel):
    violations: List[Violation]
    token_usage: int 