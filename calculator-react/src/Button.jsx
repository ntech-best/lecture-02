import { useContext } from "react";
import { ThemeContext } from "./ThemeContext.js";

function Button({
  onClick,
  children,
  className = "",
  disabled = false,
}) {
  const theme = useContext(ThemeContext);

  return (
    <button
      type="button"
      className={`button-${theme} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;