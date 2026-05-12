import { useEffect, useState } from "react";
import { Type, AlignJustify, Sun, Moon, RotateCcw } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export interface ReaderPrefs {
  fontSize: number; // px
  lineHeight: number; // unitless
}

const DEFAULTS: ReaderPrefs = { fontSize: 17, lineHeight: 1.75 };
const STORAGE_KEY = "blog-reader-prefs";

export const useReaderPrefs = (): [ReaderPrefs, (p: Partial<ReaderPrefs>) => void, () => void] => {
  const [prefs, setPrefs] = useState<ReaderPrefs>(() => {
    if (typeof window === "undefined") return DEFAULTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
  }, [prefs]);

  const update = (p: Partial<ReaderPrefs>) => setPrefs((cur) => ({ ...cur, ...p }));
  const reset = () => setPrefs(DEFAULTS);
  return [prefs, update, reset];
};

interface Props {
  prefs: ReaderPrefs;
  onChange: (p: Partial<ReaderPrefs>) => void;
  onReset: () => void;
}

const BlogReaderToolbar = ({ prefs, onChange, onReset }: Props) => {
  const { theme, toggle } = useTheme();

  const fontSizes = [15, 17, 19, 21];
  const lineHeights = [1.5, 1.75, 2];

  return (
    <div className="sticky top-20 z-20 mb-6 rounded-xl border border-border/50 bg-card/80 backdrop-blur-md px-3 py-2 flex items-center gap-3 flex-wrap shadow-sm">
      <div className="flex items-center gap-1.5">
        <Type className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">Size</span>
        <div className="flex items-center rounded-md border border-border/50 overflow-hidden">
          {fontSizes.map((s) => (
            <button
              key={s}
              onClick={() => onChange({ fontSize: s })}
              aria-label={`Font size ${s}px`}
              className={`px-2 py-1 text-[11px] font-semibold transition-colors ${
                prefs.fontSize === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
              style={{ fontSize: `${Math.min(s, 14)}px` }}
            >
              A
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <AlignJustify className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">Spacing</span>
        <div className="flex items-center rounded-md border border-border/50 overflow-hidden">
          {lineHeights.map((lh) => (
            <button
              key={lh}
              onClick={() => onChange({ lineHeight: lh })}
              className={`px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                prefs.lineHeight === lh ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {lh}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={toggle}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/50 text-[11px] font-medium text-muted-foreground hover:bg-secondary transition-colors"
        aria-label="Toggle contrast"
      >
        {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
      </button>

      <button
        onClick={onReset}
        className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Reset reader settings"
      >
        <RotateCcw className="h-3 w-3" />
        <span className="hidden sm:inline">Reset</span>
      </button>
    </div>
  );
};

export default BlogReaderToolbar;
