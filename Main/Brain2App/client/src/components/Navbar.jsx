import React, { useState, useEffect } from "react";
import { toggleTheme, getCurrentTheme, onThemeChange } from "../styles/theme";
import { Sun, Moon, Droplet } from "lucide-react";

const Navbar = ({ onLogout, user }) => {
  const [theme, setTheme] = useState(getCurrentTheme());

  // Update local state whenever theme changes
  useEffect(() => {
    const handleThemeChange = (newTheme) => setTheme(newTheme);
    onThemeChange(handleThemeChange);
    return () => {
      window.removeEventListener("themeChanged", handleThemeChange);
    };
  }, []);

  // Decide icon based on current theme
  const getIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="w-5 h-5" />;
      case "ocean":
        return <Droplet className="w-5 h-5" />;
      default:
        return <Sun className="w-5 h-5" />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        padding: "0 16px",
        borderBottom: "1px solid var(--border-color)",
        background: "var(--card-bg)",
        borderRadius: "0 0 16px 16px",
        boxShadow: "0 4px 20px var(--shadow-color)",
        transition: "background 0.3s, box-shadow 0.3s",
      }}
    >
      <div style={{ fontWeight: 500 }}>
        Logged in as <strong>{user}</strong>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={toggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 12,
            backgroundColor: "var(--pink)",
            color: "white",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          title="Toggle Theme"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--dark-pink)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--pink)")}
        >
          {getIcon()}
          <span
            style={{
              display: "none",
              fontSize: 14,
            }}
            className="sm:inline"
          >
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </span>
        </button>

        <button
          onClick={onLogout}
          style={{
            padding: "6px 14px",
            borderRadius: 12,
            backgroundColor: "var(--pink)",
            color: "white",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--dark-pink)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--pink)")}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
