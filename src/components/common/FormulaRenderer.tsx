import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    katex?: {
      render: (tex: string, element: HTMLElement, options?: { displayMode?: boolean; throwOnError?: boolean }) => void;
      renderToString: (tex: string, options?: { displayMode?: boolean; throwOnError?: boolean }) => string;
    };
  }
}

interface FormulaRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export const FormulaRenderer: React.FC<FormulaRendererProps> = ({ content, className = '', inline = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Helper to render KaTeX or fallback
    const renderMathInHtml = (rawText: string): string => {
      if (!rawText) return '';

      // Pattern 1: Block formula $$...$$
      let processed = rawText.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
        if (window.katex) {
          try {
            return `<div class="my-2 py-1 text-center overflow-x-auto text-blue-900">${window.katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false })}</div>`;
          } catch (e) {
            console.warn('KaTeX error:', e);
          }
        }
        return `<div class="my-2 p-2 bg-slate-100 rounded text-center font-mono text-sm overflow-x-auto text-blue-800">${tex}</div>`;
      });

      // Pattern 2: Inline formula $...$
      processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, tex) => {
        if (window.katex) {
          try {
            return `<span class="inline-block px-1 align-middle text-blue-900">${window.katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false })}</span>`;
          } catch (e) {
            console.warn('KaTeX error:', e);
          }
        }
        return `<span class="font-mono text-xs px-1 bg-slate-100 rounded text-blue-800">${tex}</span>`;
      });

      // Convert linebreaks to <br/>
      return processed.replace(/\n/g, '<br/>');
    };

    container.innerHTML = renderMathInHtml(content);
  }, [content]);

  if (inline) {
    return <span ref={containerRef} className={`inline-block ${className}`} />;
  }

  return <div ref={containerRef} className={`leading-relaxed ${className}`} />;
};
