from datetime import datetime
from typing import Any

from pydantic import BaseModel


class BaseExpression(BaseModel):
    expr: str


class ExpressionIn(BaseExpression):
    pass


class ExpressionOut(BaseExpression):
    result: Any
    timestamp: str = datetime.now().isoformat() + "Z"