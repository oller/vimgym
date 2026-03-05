import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import NumberFlow from "@number-flow/react";
import { getCM, Vim, vim } from "@replit/codemirror-vim";
import { tokyoNightStorm } from "@uiw/codemirror-theme-tokyo-night-storm";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";
import { getLevel, LEVELS } from "../../data/levels";
import { useLevelId } from "../../hooks/useLevelId";
import { useGameStore } from "../../store/useGameStore";
import { cn } from "../../utils/cn";
import { normalizeKeydownEvent, normalizeVimKey } from "../../utils/keyboard";
import { useVimSetup } from "./useVimSetup";
import { VimStatusBar } from "./VimStatusBar";

/**
 * Module-level Vim.handleKey wrapper.
 *
 * Intercepts every key that vim processes — regardless of input method
 * (keydown on desktop, composition/mutation on mobile). Installed once
 * at module load, reads state directly from the store each call, so
 * there are no stale closures or test-isolation issues.
 *
 * A synchronous flag (`keydownHandledCurrentEvent`) coordinates with the
 * per-instance keydown listener: if keydown already logged the key
 * (desktop), the wrapper skips it. On mobile where keydown fires
 * "Unidentified", the flag stays false and the wrapper logs the key.
 */
let keydownHandledCurrentEvent = false;
let handleKeyDepth = 0;

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
      if (!keydownHandledCurrentEvent && !useGameStore.getState().isCompleted) {
        const normalized = normalizeVimKey(key);
        if (normalized) {
          useGameStore.getState().addKeyStroke(normalized);
        }
      }
      keydownHandledCurrentEvent = false;
    }
    return originalHandleKey(cm, key, origin);
  } finally {
    handleKeyDepth--;
  }
};

export const VimEditor = () => {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const startText = useGameStore((state) => state.startText);
  const targetText = useGameStore((state) => state.targetText);
  const updateText = useGameStore((state) => state.updateText);
  const isCompleted = useGameStore((state) => state.isCompleted);
  const history = useGameStore((state) => state.history);
  const [, setLevelId] = useLevelId();
  const [vimMode, setVimMode] = useState("normal");
  const editorViewRef = useRef<EditorView | null>(null);

  const { setupVim } = useVimSetup(setLevelId);

  const addKeyStroke = useGameStore((state) => state.addKeyStroke);
  const addKeyStrokeCallback = useCallback(
    (key: string) => addKeyStroke(key),
    [addKeyStroke],
  );

  const onChange = useCallback(
    (val: string) => {
      updateText(val);
    },
    [updateText],
  );

  const onCreateEditor = useCallback(
    (editorView: EditorView) => {
      editorViewRef.current = editorView;
      const cm = getCM(editorView);
      if (!cm) return;

      setupVim(editorView);

      // Listen for mode changes
      cm.on("vim-mode-change", (e: { mode: string }) => {
        setVimMode(e.mode);
      });

      // Desktop path: keydown fires with the actual key value.
      // On mobile, keydown fires "Unidentified" — skip and let
      // the module-level Vim.handleKey wrapper handle it instead.
      const handleEditorKeyDown = (event: KeyboardEvent) => {
        if (useGameStore.getState().isCompleted) return;
        if (event.key === "Unidentified") return;

        const key = normalizeKeydownEvent(event);
        if (!key) return;
        addKeyStrokeCallback(key);
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

      return () => {
        editorView.dom.removeEventListener(
          "keydown",
          handleEditorKeyDown,
          true,
        );
        editorView.dom.removeEventListener("mousedown", handleMouseDown, true);
      };
    },
    [setupVim, addKeyStrokeCallback],
  );

  // Global keydown listener to intercept Enter when completed
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && isCompleted) {
        event.preventDefault();
        event.stopPropagation();

        const currentIndex = LEVELS.findIndex((l) => l.id === currentLevel);
        if (currentIndex !== -1 && currentIndex < LEVELS.length - 1) {
          setLevelId(LEVELS[currentIndex + 1].id);
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [setLevelId, isCompleted, currentLevel]);

  const levelObj = getLevel(currentLevel);
  const lang = levelObj?.language || "markdown";

  const languageExtension = (() => {
    switch (lang) {
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
    ...(isCompleted ? [EditorState.readOnly.of(true)] : []),
  ];

  return (
    <div
      className={cn(
        "border text-xl md:text-3xl leading-8 md:leading-11 grow rounded-md font-roboto-mono overflow-hidden bg-tokyo-night-storm transition-colors flex flex-col",
        isCompleted ? "border-tokyo-night-turquoise" : "border-gray-800",
      )}
      data-testid="vim-editor"
    >
      <div className="relative grow flex items-center px-4 overflow-x-auto scrollbar-thin">
        <div>
          <NumberFlow
            className="absolute top-4 left-6 text-tokyo-night-pink"
            value={history.length}
          />
        </div>
        <div>
          <div
            className={cn(
              "pl-1.5 mb-2 whitespace-pre-wrap",
              isCompleted ? "text-tokyo-night-turquoise" : "text-gray-600",
            )}
          >
            {targetText}
          </div>
          <CodeMirror
            autoFocus
            basicSetup={{
              lineNumbers: false,
              highlightActiveLine: false,
              foldGutter: false,
              autocompletion: false,
              closeBrackets: false,
            }}
            extensions={extensions}
            key={currentLevel}
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
