"use client";

import { useState, useEffect } from "react";

const themes = [
  { name: "light", label: "Light" },
  { name: "dark", label: "Dark" },
  { name: "corporate", label: "Corporate" },
];

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("corporate");

  useEffect(() => {
    const savedTheme = localStorage.getItem("daisyui-theme") || "corporate";
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem("daisyui-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-square">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
        </svg>
      </div>
      <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-box z-50 w-52 p-2 shadow-lg">
        {themes.map((theme) => (
          <li key={theme.name}>
            <button
              onClick={() => handleThemeChange(theme.name)}
              className={currentTheme === theme.name ? "active" : ""}
            >
              {theme.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
