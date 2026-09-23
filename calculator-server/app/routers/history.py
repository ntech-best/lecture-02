from fastapi import APIRouter, Depends

from app.dependencies import get_history, HISTORY_MAX
from app.schemas import ExpressionOut


router = APIRouter()


@router.get("/history")
def read_history(
    limit: int = 50,
    history=Depends(get_history)
) -> list[ExpressionOut]:
    return list(history)[: max(0, min(limit, HISTORY_MAX))]


@router.delete("/history")
def clear_history(
    history=Depends(get_history)
):
    history.clear()
    return {"ok": True, "cleared": True}