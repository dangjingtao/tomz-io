import { useEffect, useState } from "react";

type HeadingRef = { id: string };

type ActiveHeadingOptions = {
  enabled?: boolean;
  rootMargin?: string;
  threshold?: number | number[];
};

const DEFAULT_THRESHOLD = [0, 1];

export function useActiveHeading(
  headings: readonly HeadingRef[] | undefined,
  {
    enabled = true,
    rootMargin = "-90px 0px -65% 0px",
    threshold = DEFAULT_THRESHOLD,
  }: ActiveHeadingOptions = {},
) {
  const [activeHeading, setActiveHeading] = useState("");

  useEffect(() => {
    if (!enabled || !headings?.length || typeof IntersectionObserver === "undefined") {
      setActiveHeading("");
      return;
    }

    const nodes = headings
      .map((heading) => document.getElementById(heading.id))
      .filter(Boolean) as HTMLElement[];

    if (!nodes.length) {
      setActiveHeading("");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) =>
            left.boundingClientRect.top - right.boundingClientRect.top,
          );
        if (visible[0]) setActiveHeading(visible[0].target.id);
      },
      { rootMargin, threshold },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [enabled, headings, rootMargin, threshold]);

  return activeHeading;
}
