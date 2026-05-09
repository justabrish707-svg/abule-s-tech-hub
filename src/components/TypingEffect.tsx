import { useEffect, useState } from "react";

interface TypingEffectProps {
  phrases?: string[];
  /** Typing speed in ms per character */
  typingSpeed?: number;
  /** Deleting speed in ms per character */
  deletingSpeed?: number;
  /** Pause in ms after a phrase finishes typing */
  pauseDuration?: number;
  /** Cursor visual style */
  cursorStyle?: "bar" | "block" | "underscore";
  className?: string;
}

const defaultPhrases = [
  "Code. Create. Learn. Repeat.",
  "Exploring Cybersecurity.",
  "Building with JavaScript.",
  "Learning C++ & Algorithms.",
];

const cursorClasses: Record<NonNullable<TypingEffectProps["cursorStyle"]>, string> = {
  bar: "border-r-2 border-primary ml-0.5",
  block: "bg-primary text-primary ml-0.5 w-[0.55em]",
  underscore: "border-b-2 border-primary ml-0.5",
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const TypingEffect = ({
  phrases = defaultPhrases,
  typingSpeed = 65,
  deletingSpeed = 35,
  pauseDuration = 1800,
  cursorStyle = "bar",
  className = "",
}: TypingEffectProps) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const current = phrases[phraseIndex];
    const speed = deleting ? deletingSpeed : typingSpeed;

    if (!deleting && charIndex === current.length) {
      const t = setTimeout(() => setDeleting(true), pauseDuration);
      return () => clearTimeout(t);
    }
    if (deleting && charIndex === 0) {
      setDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
      return;
    }

    const t = setTimeout(() => {
      setCharIndex((prev) => prev + (deleting ? -1 : 1));
    }, speed);
    return () => clearTimeout(t);
  }, [charIndex, deleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration, reduced]);

  if (reduced) {
    return <span className={`text-primary font-mono ${className}`}>{phrases[0]}</span>;
  }

  return (
    <span className={`text-primary font-mono ${className}`}>
      {phrases[phraseIndex].slice(0, charIndex)}
      <span aria-hidden className={`inline-block animate-typing-cursor ${cursorClasses[cursorStyle]}`}>
        &nbsp;
      </span>
    </span>
  );
};

export default TypingEffect;
