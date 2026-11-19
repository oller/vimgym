import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import NumberFlow from "@number-flow/react";
import { getCM, Vim, vim } from "@replit/codemirror-vim";
import { tokyoNightStorm } from "@uiw/codemirror-theme-tokyo-night-storm";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { normalizeKeydownEvent, normalizeVimKey } from "../../utils/keyboard";
import { useVimSetup } from "./useVimSetup";
import { VimStatusBar } from "./VimStatusBar";

type EditorLanguage = "html" | "javascript" | "markdown" | "json";
type CursorPosition = { line: number; ch: number };

type ActiveVimKeyTarget = {
  isLocked: () => boolean;
  onKeyStroke: (key: string) => void;
};

/**
 * Module-level Vim.handleKey wrapper.
 *
 * Intercepts every key that vim processes — regardless of input method
 * (keydown on desktop, composition/mutation on mobile). Installed once
 * at module load and delegates to the currently active editor target.
 *
 * A synchronous flag (`keydownHandledCurrentEvent`) coordinates with the
 * per-instance keydown listener: if keydown already logged the key
 * (desktop), the wrapper skips it. On mobile where keydown fires
 * "Unidentified", the flag stays false and the wrapper logs the key.
 */
let keydownHandledCurrentEvent = false;
let handleKeyDepth = 0;
let activeVimKeyTarget: ActiveVimKeyTarget | null = null;

const originalHandleKey = Vim.handleKey.bind(Vim);
Vim.handleKey = (
  cm: Parameters<typeof Vim.handleKey>[0],
  key: string,
  origin: string,
) => {
  handleKeyDepth++;
  try {
    // Only log at the top-level call (depth 1). Vim internally
    // re-dispatches keys for mapped motions (e.g. space → 'l'),
    // which would cause ghost keystrokes at depth > 1.
    if (handleKeyDepth === 1) {
      if (
        !keydownHandledCurrentEvent &&
        activeVimKeyTarget &&
        !activeVimKeyTarget.isLocked()
      ) {
        const normalized = normalizeVimKey(key);
        if (normalized) {
          activeVimKeyTarget.onKeyStroke(normalized);
        }
      }
      keydownHandledCurrentEvent = false;
    }
    return originalHandleKey(cm, key, origin);
  } finally {
    handleKeyDepth--;
  }
};

type BaseVimEditorProps = {
  editorKey: string;
  startText: string;
  targetText?: string;
  showInlineTarget?: boolean;
  language: EditorLanguage;
  startCursor?: CursorPosition;
  historyCount: number;
  isCompleted: boolean;
  isReadOnly?: boolean;
  blockPaste?: boolean;
  multiline?: boolean;
  onChangeText: (text: string) => void;
  onKeyStroke: (key: string) => void;
  onReset: () => void;
  onPowerOff: () => void;
  onSelectLevelIndex?: (levelIndex: number) => void;
  className?: string;
};

export const BaseVimEditor = ({
  editorKey,
  startText,
  targetText,
  showInlineTarget = true,
  language,
  startCursor,
  historyCount,
  isCompleted,
  isReadOnly,
  blockPaste = false,
  multiline = false,
  onChangeText,
  onKeyStroke,
  onReset,
  onPowerOff,
  onSelectLevelIndex,
  className,
}: BaseVimEditorProps) => {
  const editorId = useId();
  const [vimMode, setVimMode] = useState("normal");
  const editorViewRef = useRef<EditorView | null>(null);

  const locked = isReadOnly ?? isCompleted;
  const lockedRef = useRef(locked);
  const onKeyStrokeRef = useRef(onKeyStroke);
  const startCursorRef = useRef(startCursor);
  const blockPasteRef = useRef(blockPaste);

  useEffect(() => {
    lockedRef.current = locked;
    onKeyStrokeRef.current = onKeyStroke;
    startCursorRef.current = startCursor;
    blockPasteRef.current = blockPaste;
  }, [locked, onKeyStroke, startCursor, blockPaste]);

  useEffect(() => {
    const target: ActiveVimKeyTarget = {
      isLocked: () => lockedRef.current,
      onKeyStroke: (key: string) => onKeyStrokeRef.current(key),
    };
    activeVimKeyTarget = target;
    return () => {
      if (activeVimKeyTarget === target) {
        activeVimKeyTarget = null;
      }
    };
  }, []);

  const { setupVim } = useVimSetup({
    onReset,
    onPowerOff,
    onSelectLevelIndex,
  });

  const onChange = useCallback(
    (val: string) => {
      onChangeText(val);
    },
    [onChangeText],
  );

  const onCreateEditor = useCallback(
    (editorView: EditorView) => {
      editorViewRef.current = editorView;
      const cm = getCM(editorView);
      if (!cm) return;

      setupVim(editorView);

      // Apply optional starting cursor position (0-based line & ch)
      const cursor = startCursorRef.current;
      if (cursor && (cursor.line > 0 || cursor.ch > 0)) {
        const clampedLine = Math.min(
          Math.max(cursor.line + 1, 1),
          editorView.state.doc.lines,
        );
        const lineObj = editorView.state.doc.line(clampedLine);
        const clampedCh = Math.min(Math.max(cursor.ch, 0), lineObj.length);
        const pos = lineObj.from + clampedCh;
        editorView.dispatch({ selection: { anchor: pos } });
      }

      // Listen for mode changes
      cm.on("vim-mode-change", (e: { mode: string }) => {
        setVimMode(e.mode);
      });

      // Desktop path: keydown fires with the actual key value.
      // On mobile, keydown fires "Unidentified" — skip and let
      // the module-level Vim.handleKey wrapper handle it instead.
      const handleEditorKeyDown = (event: KeyboardEvent) => {
        if (lockedRef.current) return;
        if (event.key === "Unidentified") return;

        const key = normalizeKeydownEvent(event);
        if (!key) return;
        onKeyStrokeRef.current(key);
        // Signal to the Vim.handleKey wrapper that we already logged this
        keydownHandledCurrentEvent = true;
      };

      editorView.dom.addEventListener("keydown", handleEditorKeyDown, true);

      // Prevent mouse selection but allow focus
      const handleMouseDown = (e: MouseEvent) => {
        if (!editorView.hasFocus) {
          editorView.focus();
        }
        e.preventDefault();
        e.stopPropagation();
      };

      editorView.dom.addEventListener("mousedown", handleMouseDown, true);

      // Anti-cheese: prevent clipboard paste & drag-drop without breaking Ctrl+v Visual Block mode
      const handlePasteOrDrop = (e: Event) => {
        if (!blockPasteRef.current) return;
        e.preventDefault();
        e.stopPropagation();
      };

      const handleBeforeInput = (e: InputEvent) => {
        if (!blockPasteRef.current) return;
        if (
          e.inputType === "insertFromPaste" ||
          e.inputType === "insertFromDrop"
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      editorView.dom.addEventListener("paste", handlePasteOrDrop, true);
      editorView.dom.addEventListener("drop", handlePasteOrDrop, true);
      editorView.dom.addEventListener(
        "beforeinput",
        handleBeforeInput as EventListener,
        true,
      );

      return () => {
        editorView.dom.removeEventListener(
          "keydown",
          handleEditorKeyDown,
          true,
        );
        editorView.dom.removeEventListener("mousedown", handleMouseDown, true);
        editorView.dom.removeEventListener("paste", handlePasteOrDrop, true);
        editorView.dom.removeEventListener("drop", handlePasteOrDrop, true);
        editorView.dom.removeEventListener(
          "beforeinput",
          handleBeforeInput as EventListener,
          true,
        );
      };
    },
    [setupVim],
  );

  const languageExtension = (() => {
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
  })();

  const extensions = [
    vim(),
    languageExtension,
    EditorView.contentAttributes.of({ "aria-labelledby": editorId }),
    ...(locked ? [EditorState.readOnly.of(true)] : []),
  ];

  return (
    <div
      className={cn(
        "border grow rounded-md font-roboto-mono overflow-hidden bg-tokyo-night-storm transition-colors flex flex-col",
        multiline
          ? "text-sm md:text-base leading-6 md:leading-7"
          : "text-xl md:text-3xl leading-8 md:leading-11",
        isCompleted ? "border-tokyo-night-turquoise" : "border-gray-800",
        className,
      )}
      data-testid="vim-editor"
    >
      <span className="sr-only" id={editorId}>
        Vim Editor
      </span>
      <div
        className={cn(
          "relative grow flex px-4 overflow-auto scrollbar-thin",
          multiline ? "items-start pt-12 pb-4" : "items-center",
        )}
      >
        <div>
          <NumberFlow
            className={cn(
              "absolute top-3 left-5 text-tokyo-night-pink z-10",
              multiline ? "text-xl md:text-2xl" : "",
            )}
            value={historyCount}
          />
        </div>
        <div className={cn(multiline && "w-full min-w-0")}>
          {showInlineTarget && targetText !== undefined && (
            <div
              className={cn(
                "pl-1.5 mb-2 whitespace-pre-wrap",
                isCompleted ? "text-tokyo-night-turquoise" : "text-gray-600",
              )}
            >
              {targetText}
            </div>
          )}
          <CodeMirror
            autoFocus
            basicSetup={{
              lineNumbers: multiline,
              highlightActiveLine: multiline,
              foldGutter: false,
              autocompletion: false,
              closeBrackets: false,
            }}
            extensions={extensions}
            key={editorKey}
            onChange={onChange}
            onCreateEditor={onCreateEditor}
            onMouseDownCapture={(e) => e.preventDefault()}
            theme={tokyoNightStorm}
            value={startText}
          />
        </div>
      </div>
      <VimStatusBar mode={vimMode} />
    </div>
  );
};
