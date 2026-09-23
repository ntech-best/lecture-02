from app.schemas import ExpressionIn
from app.dependencies import expand_percent


def test_add_percent():
    e = ExpressionIn(expr="5 + 10%")
    _, result = expand_percent(e)
    assert result == "5 + ((10/100)*5)"


def test_subtract_percent():
    e = ExpressionIn(expr="20 - 30%")
    _, result = expand_percent(e)
    assert result == "20 - ((30/100)*20)"


def test_multiply_percent():
    e = ExpressionIn(expr="15 * 25%")
    _, result = expand_percent(e)
    assert result == "15 * (25/100)"


def test_divide_percent():
    e = ExpressionIn(expr="40 / 50%")
    _, result = expand_percent(e)
    assert result == "40 / (50/100)"


def test_multiple_operations():
    e = ExpressionIn(expr="3 * 4% + 2 / 1%")
    _, result = expand_percent(e)
    assert result == "3 * (4/100) + 2 / (1/100)"


def test_standalone_100_percent():
    e = ExpressionIn(expr="100%")
    _, result = expand_percent(e)
    assert result == "(100/100)"


def test_two_standalone_percents():
    e = ExpressionIn(expr="10% + 20%")
    _, result = expand_percent(e)
    assert result == "(10/100) + (20/100)"