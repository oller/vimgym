import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import NumberFlow from "@number-flow/react";
import { getCM, vim } from "@replit/codemirror-vim";
import { tokyoNightStorm } from "@uiw/codemirror-theme-tokyo-night-storm";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";
import { getLevel, LEVELS } from "../../data/levels";
import { useLevelId } from "../../hooks/useLevelId";
import { useGameStore } from "../../store/useGameStore";
import { cn } from "../../utils/cn";
import {
  normalizeKeydownEvent,
  normalizeVimKeypress,
} from "../../utils/keyboard";
import { SPECIAL_KEYS } from "../../utils/vimsplain.types";
import { useVimSetup } from "./useVimSetup";
import { VimStatusBar } from "./VimStatusBar";

export const VimEditor = () => {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const startText = useGameStore((state) => state.startText);
  const targetText = useGameStore((state) => state.targetText);
  const updateText = useGameStore((state) => state.updateText);
  const addKeyStroke = useGameStore((state) => state.addKeyStroke);
  const isCompleted = useGameStore((state) => state.isCompleted);
  const history = useGameStore((state) => state.history);
  const [, setLevelId] = useLevelId();
  const [vimMode, setVimMode] = useState("normal");
  const editorViewRef = useRef<EditorView | null>(null);

  const { setupVim } = useVimSetup(setLevelId);

  const onChange = useCallback(
    (val: string) => {
      updateText(val);
    },
    [updateText],
  );

  const addKeyStrokeCallback = useCallback(
    (key: string) => addKeyStroke(key),
    [addKeyStroke],
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

      const dedupeWindowMs = 10;
      let lastLoggedKey: string | null = null;
      let lastLoggedAt = 0;
      let lastLoggedSource:
        | "input-keyboard"
        | "input-handleKey"
        | "input-text"
        | "dom-keydown"
        | null = null;

      const logKeyStroke = (
        key: string,
        source:
          | "input-keyboard"
          | "input-handleKey"
          | "input-text"
          | "dom-keydown",
      ) => {
        const now = performance.now();
        if (
          lastLoggedKey === key &&
          lastLoggedSource !== source &&
          now - lastLoggedAt < dedupeWindowMs
        ) {
          return;
        }

        addKeyStrokeCallback(key);
        lastLoggedKey = key;
        lastLoggedAt = now;
        lastLoggedSource = source;
      };

      const handleInputEvent = (event: unknown) => {
        const currentIsCompleted = useGameStore.getState().isCompleted;
        if (currentIsCompleted) return;

        if (event instanceof KeyboardEvent) {
          const key = normalizeKeydownEvent(event);
          if (!key) return;
          if (key.length === 1) return;
          logKeyStroke(key, "input-keyboard");
          return;
        }

        if (event && typeof event === "object" && "type" in event) {
          const typedEvent = event as {
            type?: string;
            key?: string;
            text?: string;
          };

          if (typedEvent.type === "handleKey") {
            const normalized = normalizeVimKeypress(typedEvent.key);
            if (!normalized) return;

            logKeyStroke(normalized, "input-handleKey");
            return;
          }

          if (typedEvent.type === "text") {
            if (typeof typedEvent.text !== "string") return;
            if (typedEvent.text.length !== 1) return;
            const text =
              typedEvent.text === "\n" ? SPECIAL_KEYS.ENTER : typedEvent.text;
            logKeyStroke(text, "input-text");
          }
        }
      };

      const handleEditorKeyDown = (event: KeyboardEvent) => {
        const currentIsCompleted = useGameStore.getState().isCompleted;
        if (currentIsCompleted) return;

        const key = normalizeKeydownEvent(event);
        if (!key) return;
        if (key.length === 1) return;
        logKeyStroke(key, "dom-keydown");
      };

      cm.on("inputEvent", handleInputEvent);
      editorView.dom.addEventListener("keydown", handleEditorKeyDown, true);

      // Prevent mouse selection but allow focus
      const handleMouseDown = (e: MouseEvent) => {
        // Allow focus but prevent selection
        if (!editorView.hasFocus) {
          editorView.focus();
        }
        // Prevent text selection and cursor movement
        e.preventDefault();
        e.stopPropagation();
      };

      editorView.dom.addEventListener("mousedown", handleMouseDown, true);

      // Cleanup on unmount
      return () => {
        cm.off("inputEvent", handleInputEvent);
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

        // Navigate to next level
        const currentIndex = LEVELS.findIndex((l) => l.id === currentLevel);
        if (currentIndex !== -1 && currentIndex < LEVELS.length - 1) {
          setLevelId(LEVELS[currentIndex + 1].id);
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown, true); // Use capture phase

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [setLevelId, isCompleted, currentLevel]);

  // Make editor read-only when completed
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
    vim(), // vim bindings
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
            // Block users from cheating with the mouse! 󰍾
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
