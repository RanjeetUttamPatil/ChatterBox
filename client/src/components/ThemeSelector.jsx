import { Palette } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../constants";

const ThemeSelector = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="relative group">
      {/* TRIGGER */}
      <button className="p-2 hover:bg-[var(--bg)] rounded-full transition-colors text-[var(--muted)] hover:text-[var(--primary)]">
        <Palette className="size-5" />
      </button>

      {/* DROPDOWN */}
      <div
        className="absolute right-0 mt-2 p-2 shadow-2xl bg-[var(--surface)] backdrop-blur-lg rounded-2xl
        w-64 border border-[var(--border)] max-h-[500px] overflow-y-auto hidden group-hover:block z-50 custom-scrollbar"
      >
        <div className="space-y-1">
          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] border-b border-[var(--border)] mb-1">
            Light Themes
          </div>
          {THEMES.filter(t => t.type === "light").map((themeOption) => (
            <button
              key={themeOption.name}
              className={`
              w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-colors
              ${
                theme === themeOption.name
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "hover:bg-[var(--bg)] text-[var(--text-primary)]"
              }
            `}
              onClick={() => setTheme(themeOption.name)}
            >
              <Palette className="size-4" />
              <span className="text-sm font-medium">{themeOption.label}</span>
              {/* THEME PREVIEW COLORS */}
              <div className="ml-auto flex gap-1">
                {Object.entries(themeOption.colors)
                  .filter(([key]) => ["primary", "bg", "surface"].includes(key))
                  .map(([key, color], i) => (
                    <span
                      key={i}
                      className="size-2 rounded-full border border-[var(--border)]"
                      style={{ backgroundColor: color }}
                    />
                  ))}
              </div>
            </button>
          ))}

          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] border-b border-[var(--border)] mt-4 mb-1">
            Dark Themes
          </div>
          {THEMES.filter(t => t.type === "dark").map((themeOption) => (
            <button
              key={themeOption.name}
              className={`
              w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-colors
              ${
                theme === themeOption.name
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "hover:bg-[var(--bg)] text-[var(--text-primary)]"
              }
            `}
              onClick={() => setTheme(themeOption.name)}
            >
              <Palette className="size-4" />
              <span className="text-sm font-medium">{themeOption.label}</span>
              {/* THEME PREVIEW COLORS */}
              <div className="ml-auto flex gap-1">
                {Object.entries(themeOption.colors)
                  .filter(([key]) => ["primary", "bg", "surface"].includes(key))
                  .map(([key, color], i) => (
                    <span
                      key={i}
                      className="size-2 rounded-full border border-[var(--border)]"
                      style={{ backgroundColor: color }}
                    />
                  ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ThemeSelector;
