import { useState } from "react";

function App() {
  const [input, setInput] = useState("0");

  const buttons = [
    "⌫", "AC", "%", "÷",
    "7", "8", "9", "×",
    "4", "5", "6", "−",
    "1", "2", "3", "+",
    "±", "0", ".", "="
  ];

  const handleClick = (value) => {
    if (value === "AC") {
      setInput("0");

    } else if (value === "⌫") {
      setInput(input.length <= 1 || input === "Error"
        ? "0"
        : input.slice(0, -1));

    } else if (value === "±") {
      if (/^-?\d+(\.\d+)?$/.test(input) && input !== "0") {
        setInput(input.startsWith("-")
          ? input.slice(1)
          : "-" + input);
      }

    } else if (value === "=") {
      try {
        const expr = input
          .replaceAll("÷", "/")
          .replaceAll("×", "*")
          .replaceAll("−", "-")
          .replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

        if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
          throw new Error("Invalid expression");
        }

        const result = eval(expr);

        if (!Number.isFinite(result)) {
          throw new Error("Invalid result");
        }

        setInput(Number(result.toFixed(8)).toString());
      } catch {
        setInput("Error");
      }

    } else {
      if (input === "Error") {
        setInput(value === "." ? "0." : value);
      } else if (value === ".") {
        const lastNumber = input.split(/[+−×÷]/).pop();

        if (!lastNumber.includes(".")) {
          setInput(input + ".");
        }
      } else {
        setInput(input === "0" ? value : input + value);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-black rounded-[36px] shadow-2xl p-6">

        <div className="text-white text-6xl text-right mb-8 min-h-20 break-all">
          {input}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {buttons.map((key, index) => {
            const isTopRow = index < 4;
            const isOperator = ["×", "−", "+", "="].includes(key);

            return (
              <button
                key={key}
                onClick={() => handleClick(key)}
                className={`
                  aspect-square rounded-full text-white text-2xl
                  cursor-pointer hover:opacity-80
                  ${isTopRow
                    ? "bg-gray-500"
                    : isOperator
                    ? "bg-orange-500"
                    : "bg-gray-700"
                  }
                `}
              >
                {key}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default App;