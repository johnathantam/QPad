import { useState, useRef } from "react";
import type { ReactNode } from "react";
import "./collapsiblePanelSection.css";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <button
        className="collapsible-section-header"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span className={`collapsible-section-chevron ${isOpen ? "open" : ""}`}>
          ▶
        </span>
        <span className="collapsible-section-title">{title}</span>
      </button>
      <div
        className="collapsible-section-content-wrapper"
        style={{ gridTemplateRows: isOpen ? "minmax(0, 1fr)" : "minmax(0, 0fr)"  }}
      >
        <div className="collapsible-section-content" ref={contentRef}>
          {children}
        </div>
      </div>
    </div>
  );
}

export { CollapsibleSection };