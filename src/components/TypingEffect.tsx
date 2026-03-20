import { useEffect, useState } from "react";

const phrases = [
  "Code. Create. Learn. Repeat.",
  "Exploring Cybersecurity.",
  "Building with JavaScript.",
  "Learning C++ & Algorithms.",
];

const TypingEffect = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIndex];
    const speed = deleting ? 35 : 65;

    if (!deleting && charIndex === current.length) {
      const t = setTimeout(() => setDeleting(true), 1800);
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
  }, [charIndex, deleting, phraseIndex]);

  return (
    <span className="text-primary font-mono">
      {phrases[phraseIndex].slice(0, charIndex)}
      <span className="border-r-2 animate-typing-cursor ml-0.5">&nbsp;</span>
    </span>
  );
};

export default TypingEffect;
