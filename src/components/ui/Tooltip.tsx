import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isHovered) {
      setIsVisible(true);
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
        });
      }
      requestAnimationFrame(() => {
        setOpacity(1);
      });
    } else {
      setOpacity(0);
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, 150);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHovered]);

  return (
    <div
      ref={triggerRef}
      className="inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isVisible &&
        createPortal(
          <div
            className="fixed min-w-[200px] max-w-[300px] p-3 bg-white rounded-lg shadow-lg border border-gray-200 transition-opacity duration-150"
            style={{
              top: position.top,
              left: position.left,
              zIndex: 9999,
              opacity,
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </div>
  );
}
