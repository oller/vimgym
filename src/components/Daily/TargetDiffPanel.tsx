import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tokyoNightStorm } from "@uiw/codemirror-theme-tokyo-night-storm";
import CodeMirror from "@uiw/react-codemirror";
import { useMemo, useState } from "react";
import type { DailyLanguage } from "../../schemas/daily";
import { cn } from "../../utils/cn";
import { computeLineDiff, isExactDailyMatch } from "../../utils/daily";

type TargetDiffPanelProps = {
  currentText: string;
  targetText: string;
  language: DailyLanguage;
};

type ViewMode = "target" | "diff";

export const TargetDiffPanel = ({
  currentText,
  targetText,
  language,
}: TargetDiffPanelProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("target");

  const diffLines = useMemo(
    () => computeLineDiff(currentText, targetText),
    [currentText, targetText],
  );

  const differingCount = useMemo(
    () => diffLines.filter((line) => line.status !== "same").length,
    [diffLines],
  );

  const isMatched = useMemo(
    () => isExactDailyMatch(currentText, targetText),
    [currentText, targetText],
  );

  const languageExtension = useMemo(() => {
    switch (language) {
      case "html":
        return html();
      case "json":
        return json();
      case "javascript":
        return javascript({ jsx: true, typescript: true });
      default:
        return markdown();
    }
  }, [language]);

  const readOnlyExtensions = useMemo(
    () => [
      languageExtension,
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
    ],
    [languageExtension],
  );

  return (
    <div
      className={cn(
        "border rounded-md bg-tokyo-night-storm overflow-hidden flex flex-col select-none min-h-0",
        isMatched ? "border-tokyo-night-turquoise" : "border-gray-800",
      )}
      data-testid="target-diff-panel"
      onCopy={(e) => e.preventDefault()}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 bg-tokyo-night/70 shrink-0">
        <div className="flex items-center gap-1" role="tablist">
          <button
            aria-selected={viewMode === "target"}
            className={cn(
              "cursor-pointer px-2.5 py-1 rounded text-xs font-roboto-mono uppercase tracking-wider transition-colors",
              viewMode === "target"
                ? "bg-tokyo-night-storm text-white border border-gray-700"
                : "text-gray-400 hover:text-gray-200",
            )}
            onClick={() => setViewMode("target")}
            role="tab"
            type="button"
          >
            Target
          </button>
          <button
            aria-selected={viewMode === "diff"}
            className={cn(
              "cursor-pointer px-2.5 py-1 rounded text-xs font-roboto-mono uppercase tracking-wider transition-colors",
              viewMode === "diff"
                ? "bg-tokyo-night-storm text-white border border-gray-700"
                : "text-gray-400 hover:text-gray-200",
            )}
            onClick={() => setViewMode("diff")}
            role="tab"
            type="button"
          >
            Diff
          </button>
        </div>

        <span
          className={cn(
            "text-[11px] font-roboto-mono",
            isMatched ? "text-tokyo-night-turquoise" : "text-gray-400",
          )}
          data-testid="diff-status"
        >
          {isMatched
            ? "✓ Exact match"
            : `${differingCount} ${differingCount === 1 ? "line" : "lines"} left`}
        </span>
      </div>

      {/* Panel Body */}
      <div className="grow overflow-auto scrollbar-thin p-3 font-roboto-mono text-sm md:text-base leading-6 md:leading-7">
        {viewMode === "target" ? (
          <div className="pointer-events-none">
            <CodeMirror
              basicSetup={{
                lineNumbers: true,
                highlightActiveLine: false,
                foldGutter: false,
                autocompletion: false,
                closeBrackets: false,
              }}
              editable={false}
              extensions={readOnlyExtensions}
              theme={tokyoNightStorm}
              value={targetText}
            />
          </div>
        ) : (
          <div className="space-y-1" data-testid="line-diff-view">
            {diffLines.map((line) => (
              <div
                className="font-roboto-mono text-xs md:text-sm leading-6"
                key={line.lineNumber}
              >
                {line.status === "same" && (
                  <div className="flex gap-2 px-2 rounded text-gray-500">
                    <span className="w-5 text-right select-none opacity-50">
                      {line.lineNumber}
                    </span>
                    <span className="w-3 text-center text-tokyo-night-turquoise">
                      ✓
                    </span>
                    <span className="whitespace-pre">{line.target || " "}</span>
                  </div>
                )}

                {line.status === "modified" && (
                  <div className="space-y-0.5">
                    <div className="flex gap-2 px-2 rounded bg-tokyo-night-peach/10 text-tokyo-night-peach">
                      <span className="w-5 text-right select-none opacity-60">
                        {line.lineNumber}
                      </span>
                      <span className="w-3 text-center font-bold">-</span>
                      <span className="whitespace-pre">
                        {line.current || " "}
                      </span>
                    </div>
                    <div className="flex gap-2 px-2 rounded bg-tokyo-night-turquoise/10 text-tokyo-night-turquoise">
                      <span className="w-5 text-right select-none opacity-60">
                        {line.lineNumber}
                      </span>
                      <span className="w-3 text-center font-bold">+</span>
                      <span className="whitespace-pre">
                        {line.target || " "}
                      </span>
                    </div>
                  </div>
                )}

                {line.status === "missing" && (
                  <div className="flex gap-2 px-2 rounded bg-tokyo-night-turquoise/10 text-tokyo-night-turquoise">
                    <span className="w-5 text-right select-none opacity-60">
                      {line.lineNumber}
                    </span>
                    <span className="w-3 text-center font-bold">+</span>
                    <span className="whitespace-pre">{line.target || " "}</span>
                  </div>
                )}

                {line.status === "extra" && (
                  <div className="flex gap-2 px-2 rounded bg-tokyo-night-peach/10 text-tokyo-night-peach">
                    <span className="w-5 text-right select-none opacity-60">
                      {line.lineNumber}
                    </span>
                    <span className="w-3 text-center font-bold">-</span>
                    <span className="whitespace-pre">
                      {line.current || " "}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
