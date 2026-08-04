import { useState, useEffect } from "react";

interface TypeAnimationProps {
  sequence: (string | number)[];
  speed?: number;
  className?: string;
}

export function TypeAnimation({ sequence, speed = 50, className = "" }: TypeAnimationProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (sequence.length === 0) return;

    const currentItem = sequence[currentIndex];

    // If current item is a delay number
    if (typeof currentItem === "number") {
      const timeout = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % sequence.length);
      }, currentItem);
      return () => clearTimeout(timeout);
    }

    const text = currentItem as string;

    if (isDeleting) {
      if (subIndex === 0) {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % sequence.length);
        return;
      }

      const timeout = setTimeout(() => {
        setDisplayText(text.substring(0, subIndex - 1));
        setSubIndex((prev) => prev - 1);
      }, speed / 2);
      return () => clearTimeout(timeout);
    } else {
      if (subIndex === text.length) {
        // Look ahead if next sequence item is a delay number
        const nextIndex = (currentIndex + 1) % sequence.length;
        if (typeof sequence[nextIndex] === "number") {
          const delay = sequence[nextIndex] as number;
          const timeout = setTimeout(() => {
            setIsDeleting(true);
            setCurrentIndex((prev) => (prev + 1) % sequence.length);
          }, delay);
          return () => clearTimeout(timeout);
        } else {
          setIsDeleting(true);
        }
        return;
      }

      const timeout = setTimeout(() => {
        setDisplayText(text.substring(0, subIndex + 1));
        setSubIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [subIndex, currentIndex, isDeleting, sequence, speed]);

  return (
    <span className={className}>
      {displayText}
      <span className="inline-block w-0.5 h-5 ml-1 bg-gold animate-pulse align-middle" />
    </span>
  );
}