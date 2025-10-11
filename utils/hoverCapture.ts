import { CONTENT_ROOT_ID } from "./types";

export type HoverCaptureOptions = {
  excludeSelectors?: string[];
  highlightColor?: string; // border color
  highlightWidth?: number; // px
  onHover?: (el: HTMLElement | null) => void;
  onClick?: (el: HTMLElement) => void;
};

/**
 * Enable element hover highlighting and click capture on the current page.
 * - Highlights the element under the cursor.
 * - On click: logs the element and its innerText (default behavior) and prevents the default click.
 * - Returns a cleanup function to remove listeners and overlay.
 *
 * Note: Caller is responsible for invoking the returned cleanup when finished.
 */
export function enableHoverCapture(options: HoverCaptureOptions = {}) {
  const {
    excludeSelectors = [
      `#${CONTENT_ROOT_ID}`,
      // Common WXT shadow host marker (defensive):
      '[data-wxt-shadow-root="career-tracker-root"]',
    ],
    highlightColor = "#22c55e", // Tailwind green-500
    highlightWidth = 2,
    onHover,
    onClick,
  } = options;

  // Create a single overlay for highlighting (pointer-events: none so it won't block interaction)
  const highlight = document.createElement("div");
  Object.assign(highlight.style, {
    position: "fixed",
    top: "0px",
    left: "0px",
    width: "0px",
    height: "0px",
    border: `${highlightWidth}px solid ${highlightColor}`,
    borderRadius: "4px",
    boxSizing: "border-box",
    zIndex: String(2147483646), // One below max to avoid browser UI clashes
    pointerEvents: "none",
    transition: "all 60ms ease-out",
  } as CSSStyleDeclaration);
  document.documentElement.appendChild(highlight);

  let currentEl: HTMLElement | null = null;

  const isExcluded = (el: Element | null | undefined): boolean => {
    if (!el || !(el instanceof Element)) return true;
    return excludeSelectors.some((sel) => {
      try {
        return (el as Element).closest(sel) !== null;
      } catch {
        return false;
      }
    });
  };

  const updateHighlight = (el: HTMLElement | null) => {
    currentEl = el;
    if (!el) {
      highlight.style.width = "0px";
      highlight.style.height = "0px";
      highlight.style.transform = "translate(-9999px, -9999px)";
      onHover?.(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    highlight.style.width = `${Math.max(0, rect.width)}px`;
    highlight.style.height = `${Math.max(0, rect.height)}px`;
    highlight.style.transform = `translate(${Math.max(0, rect.x)}px, ${Math.max(
      0,
      rect.y
    )}px)`;
    onHover?.(el);
  };

  const moveHandler = (evt: MouseEvent) => {
    // Prefer composed path to support shadow DOM
    const path = (evt.composedPath?.() || []) as Array<EventTarget>;
    const firstEl = path.find((n) => n instanceof HTMLElement) as
      | HTMLElement
      | undefined;
    let target: HTMLElement | null =
      firstEl ?? (evt.target as HTMLElement | null);

    if (
      !target ||
      target === document.documentElement ||
      target === document.body
    ) {
      updateHighlight(null);
      return;
    }

    if (isExcluded(target)) {
      updateHighlight(null);
      return;
    }

    updateHighlight(target);
  };

  const clickHandler = (evt: MouseEvent) => {
    if (!currentEl) return;

    // Prevent page navigation/side effects while picking
    evt.preventDefault();
    evt.stopPropagation();

    const text = currentEl.innerText?.trim() ?? "";
    if (onClick) {
      onClick(currentEl);
    } else {
      // Default behavior requested: console log element and text
      // eslint-disable-next-line no-console
      console.log("[HoverCapture] Element:", currentEl);
      // eslint-disable-next-line no-console
      console.log("[HoverCapture] Text:", text);
    }
  };

  const keydownHandler = (evt: KeyboardEvent) => {
    // Press Escape to temporarily hide highlight (does not cleanup listeners)
    if (evt.key === "Escape") {
      updateHighlight(null);
    }
  };

  // Attach listeners on capture phase to get events before page handlers
  document.addEventListener("mousemove", moveHandler, true);
  document.addEventListener("mouseover", moveHandler, true);
  document.addEventListener("click", clickHandler, true);
  document.addEventListener("keydown", keydownHandler, true);

  // Public cleanup
  const cleanup = () => {
    document.removeEventListener("mousemove", moveHandler, true);
    document.removeEventListener("mouseover", moveHandler, true);
    document.removeEventListener("click", clickHandler, true);
    document.removeEventListener("keydown", keydownHandler, true);
    highlight.remove();
  };

  return cleanup;
}

export default enableHoverCapture;
