"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";

export function HighlightedCode({
  code,
  language = "typescript",
  lineNumbers = false,
}: {
  code: string;
  language?: string;
  lineNumbers?: boolean;
}) {
  return (
    <Highlight code={code} language={language} theme={themes.dracula}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <code
          className={`highlighted-code ${lineNumbers ? "with-line-numbers" : ""}`}
        >
          {tokens.map((line, i) => (
            <span key={i} {...getLineProps({ line })}>
              {lineNumbers && (
                <span className="line-number" aria-hidden="true">
                  {i + 1}
                </span>
              )}
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
              {i < tokens.length - 1 ? "\n" : null}
            </span>
          ))}
        </code>
      )}
    </Highlight>
  );
}

export function Code({
  code,
  name = "example.ts",
}: {
  code: string;
  name?: string;
}) {
  const language =
    name === "terminal"
      ? "bash"
      : name.endsWith(".json")
        ? "json"
        : name.endsWith(".tsx")
          ? "tsx"
          : "typescript";
  const [feedback, setFeedback] = useState("");
  useEffect(() => setFeedback(""), [code]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setFeedback("Copied!");
    } catch {
      setFeedback("Select the code and copy it manually.");
    }
  }

  return (
    <div className="code-window">
      <div className="code-title">
        <span>
          <Terminal aria-hidden="true" />
          {name}
          <span className="code-language">
            {language === "typescript"
              ? "TS"
              : language === "tsx"
                ? "TSX"
                : language === "json"
                  ? "JSON"
                  : "SHELL"}
          </span>
        </span>
        <button onClick={copy}>
          {feedback === "Copied!" ? (
            <Check aria-hidden="true" />
          ) : (
            <Copy aria-hidden="true" />
          )}
          Copy code
        </button>
      </div>
      <pre tabIndex={0} aria-label={`${name} code example`}>
        <HighlightedCode
          code={code}
          language={language}
          lineNumbers={name !== "terminal"}
        />
      </pre>
      <span className="copy-status" role="status">
        {feedback}
      </span>
    </div>
  );
}
