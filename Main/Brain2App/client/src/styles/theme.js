// src/styles/theme.js

const THEMES = ["light", "dark", "ocean"]; // Add more themes if needed

/**
 * Sets a specific theme on <html> and saves it to localStorage
 * @param {string} mode - Theme name
 */
export function setTheme(mode) {
  if (!THEMES.includes(mode)) mode = "light"; // fallback
  document.documentElement.setAttribute("data-theme", mode);
  localStorage.setItem("theme", mode);
  // Optional: dispatch custom event to notify app of theme change
  window.dispatchEvent(new CustomEvent("themeChanged", { detail: mode }));
}

/**
 * Loads saved theme or defaults to system preference
 */
export function loadTheme() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const defaultTheme = saved || (prefersDark ? "dark" : "light");
  setTheme(defaultTheme);
  return defaultTheme;
}

/**
 * Cycles through all available themes
 * light → dark → ocean → light
 */
export function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const currentIndex = THEMES.indexOf(current);
  const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
  setTheme(nextTheme);
  return nextTheme;
}

/**
 * Returns the currently active theme
 */
export function getCurrentTheme() {
  return document.documentElement.getAttribute("data-theme") || "light";
}

/**
 * Optional helper: Subscribe to theme changes
 * @param {function} callback - function(theme) {}
 */
export function onThemeChange(callback) {
  window.addEventListener("themeChanged", (e) => callback(e.detail));
}
