import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext.js";
import Button from "./Button.jsx";
import "./App.css";

const API_BASE = "http://localhost:8000";

const keys = [
  ["⌫", "backspace", "function"],
  ["AC", "clear", "function"],
  ["%", "percent", "function"],
  ["÷", "÷", "operator"],
  ["7", "7", "number"],
  ["8", "8", "number"],
  ["9", "9", "number"],
  ["×", "×", "operator"],
  ["4", "4", "number"],
  ["5", "5", "number"],
  ["6", "6", "number"],
  ["−", "−", "operator"],
  ["1", "1", "number"],
  ["2", "2", "number"],
  ["3", "3", "number"],
  ["+", "+", "operator"],
  ["±", "negate", "function"],
  ["0", "0", "number"],
  [".", ".", "number"],
  ["=", "equals", "operator"],
];

async function requestHistory() {
  const response = await fetch(`${API_BASE}/history?limit=50`);
  if (!response.ok) throw new Error("Cannot load history");
  return response.json();
}

function App() {
  const [current, setCurrent] = useState("0");
  const [expression, setExpression] = useState("");
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    let active = true;

    requestHistory()
      .then((items) => {
        if (active) setHistory(items);
      })
      .catch(() => {
        if (active) setError("Cannot connect to backend.");
      });

    return () => {
      active = false;
    };
  }, []);

  function addDigit(digit) {
    setError("");

    if (justEvaluated) {
      setCurrent(digit === "." ? "0." : digit);
      setExpression("");
      setJustEvaluated(false);
      return;
    }

    setCurrent((previous) => {
      if (digit === ".") {
        if (previous.includes(".") || previous.endsWith("%")) {
          return previous;
        }
        return `${previous}.`;
      }

      if (previous.endsWith("%")) return previous;

      return previous === "0" ? digit : `${previous}${digit}`;
    });
  }

  function addOperator(operator) {
    setError("");

    if (
      expression &&
      current === "0" &&
      !justEvaluated &&
      /[+−×÷]$/.test(expression)
    ) {
      setExpression(`${expression.slice(0, -1)}${operator}`);
      return;
    }

    const prefix = justEvaluated ? "" : expression;

    setExpression(
      `${prefix ? `${prefix} ` : ""}${current} ${operator}`
    );

    setCurrent("0");
    setJustEvaluated(false);
  }

  function clearAll() {
    setCurrent("0");
    setExpression("");
    setJustEvaluated(false);
    setError("");
  }

  function backspace() {
    setError("");

    if (justEvaluated) {
      clearAll();
      return;
    }

    setCurrent((previous) => {
      const trimmed = previous.slice(0, -1);
      return !trimmed || trimmed === "-" ? "0" : trimmed;
    });
  }

  function negate() {
    setCurrent((previous) => {
      if (previous === "0") return "0";
      return previous.startsWith("-")
        ? previous.slice(1)
        : `-${previous}`;
    });
  }

  function percent() {
    setCurrent((previous) =>
      previous.endsWith("%") ? previous : `${previous}%`
    );
  }

  async function calculate() {
    if (loading) return;

    const formula = `${justEvaluated ? "" : expression} ${current}`.trim();
    if (!formula) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expr: formula
            .replaceAll("−", "-")
            .replaceAll("×", "*")
            .replaceAll("÷", "/"),
        }),
      });

      if (!response.ok) {
        throw new Error("Calculate request failed");
      }

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Calculation error");
      }

      setCurrent(String(data.result));
      setExpression(`${formula} =`);
      setJustEvaluated(true);

      setHistory(await requestHistory());
    } catch (err) {
      setError(err.message || "Calculation failed");
    } finally {
      setLoading(false);
    }
  }

  async function clearHistory() {
    try {
      const response = await fetch(`${API_BASE}/history`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Cannot clear history");
      }

      setHistory(await requestHistory());
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  function handleKey(key, kind) {
    if (loading) return;

    if (kind === "number") {
      addDigit(key);
    } else if (key === "equals") {
      void calculate();
    } else if (kind === "operator") {
      addOperator(key);
    } else if (key === "clear") {
      clearAll();
    } else if (key === "backspace") {
      backspace();
    } else if (key === "negate") {
      negate();
    } else if (key === "percent") {
      percent();
    }
  }

 return (
  <ThemeContext.Provider value={theme}>
    <main className={`calculator ${theme}`}>
      <h1>Calculator React</h1>

      <Button
        className="theme-toggle"
        onClick={() =>
          setTheme((previous) =>
            previous === "light" ? "dark" : "light"
          )
        }
      >
        {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </Button>

      <section className="screen">
        <div className="expression">
          {expression || "\u00a0"}
        </div>
        <div className="result">{current}</div>
      </section>

      <div className="keys">
        {keys.map(([label, key, kind]) => (
          <Button
            key={key}
            className={
              kind === "operator" ? "key operator" : "key"
            }
            disabled={loading}
            onClick={() => handleKey(key, kind)}
          >
            {label}
          </Button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}

      <section className="history">
        <h2>History</h2>

        {history.length === 0 ? (
          <p>No calculations yet</p>
        ) : (
          <ul>
            {history.map((item, index) => (
              <li key={`${item.timestamp}-${index}`}>
                {item.expr} = {String(item.result)}
              </li>
            ))}
          </ul>
        )}

        <Button
          className="clear-history"
          onClick={clearHistory}
        >
          Clear History
        </Button>
      </section>
    </main>
  </ThemeContext.Provider>
);
}

export default App;