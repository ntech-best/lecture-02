from fastapi.testclient import TestClient
from main import app, history  # or whatever your app module is

client = TestClient(app)

#test post /calculate endpoint

def test_basic_division():
    r = client.post("/calculate", params={"expr": "30/4"})
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True
    assert abs(data["result"] - 7.5) < 1e-9

def test_percent_subtraction():
    r = client.post("/calculate", params={"expr": "100 - 6%"})
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True
    assert abs(data["result"] - 94.0) < 1e-9

def test_standalone_percent():
    r = client.post("/calculate", params={"expr": "6%"})
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True
    assert abs(data["result"] - 0.06) < 1e-9

def test_invalid_expr_returns_ok_false():
    r = client.post("/calculate", params={"expr": "2**(3"})
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is False
    assert "error" in data and data["error"] != ""


# test get /history endpoint

def test_history_empty():
    history.clear()
    r = client.get("/history")
    assert r.status_code == 200
    assert r.json() == []


def test_history_after_calculation():
    history.clear()

    client.post("/calculate", params={"expr": "10+5"})

    r = client.get("/history")
    assert r.status_code == 200

    data = r.json()
    assert len(data) == 1
    assert data[0]["expr"] == "10+5"
    assert data[0]["result"] == 15


def test_history_limit():
    history.clear()

    client.post("/calculate", params={"expr": "1+1"})
    client.post("/calculate", params={"expr": "2+2"})
    client.post("/calculate", params={"expr": "3+3"})

    r = client.get("/history", params={"limit": 2})
    assert r.status_code == 200

    data = r.json()
    assert len(data) == 2
    assert data[0]["expr"] == "3+3"
    assert data[1]["expr"] == "2+2"

# test delete /history endpoint

def test_delete_history():
    history.clear()

    client.post("/calculate", params={"expr": "10+5"})

    r = client.delete("/history")
    assert r.status_code == 200
    assert r.json()["message"] == "History cleared"

    r = client.get("/history")
    assert r.status_code == 200
    assert r.json() == []

def test_delete_empty_history():
    history.clear()

    r = client.delete("/history")

    assert r.status_code == 200
    assert r.json()["message"] == "History cleared"

def test_delete_all_history():
    history.clear()

    client.post("/calculate", params={"expr": "1+1"})
    client.post("/calculate", params={"expr": "2+2"})
    client.post("/calculate", params={"expr": "3+3"})

    r = client.delete("/history")

    assert r.status_code == 200
    assert r.json()["message"] == "History cleared"

    r = client.get("/history")
    assert r.status_code == 200
    assert r.json() == []