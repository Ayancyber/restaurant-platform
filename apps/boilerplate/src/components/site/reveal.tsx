"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";

type RevealVariant =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom-in"
  | "blur-up"
  | "plain";

const VARIANT_CLASSES: Record<RevealVariant, string> = {
  "fade-up": "translate-y-6",
  "fade-down": "-translate-y-6",
  "fade-left": "-translate-x-8",
  "fade-right": "translate-x-8",
  "zoom-in": "scale-[0.94]",
  "blur-up": "translate-y-4 blur-sm",
  plain: "",
};

/**
 * Scroll-triggered reveal animation.
 * Wraps any block and fades/slides it in the first time it enters the viewport.
 * Degrades gracefully: content is always in the DOM, only transformed.
 */
export function Reveal({
  children,
  className,
  variant = "fade-up",
  delay = 0,
  once = true,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  /** Stagger delay in ms */
  delay?: number;
  once?: boolean;
  as?: "div" | "section" | "li" | "span" | "header" | "footer" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion / no observer support:
    // reveal on the next frame instead of synchronously (avoids cascading renders)
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const style: CSSProperties | undefined =
    delay > 0 ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cn(
        "transition-all duration-700 ease-out will-change-transform",
        !visible && `opacity-0 ${VARIANT_CLASSES[variant]}`,
        visible && "opacity-100 translate-x-0 translate-y-0 scale-100 blur-none",
        className
      )}
      style={style}
    >
      {children}
    </Tag>
  );
}

/**
 * Stagger container: children are wrapped in Reveal automatically with
 * increasing delays. Simpler alternative: use <Reveal delay={i * 80}> manually.
 */
export function RevealStagger({
  children,
  className,
  baseDelay = 80,
  variant = "fade-up",
}: {
  children: ReactNode[];
  className?: string;
  baseDelay?: number;
  variant?: RevealVariant;
}) {
  return (
    <>
      {children.map((child, i) => (
        <Reveal
          key={i}
          variant={variant}
          delay={i * baseDelay}
          className={className}
        >
          {child}
        </Reveal>
      ))}
    </>
  );
}
