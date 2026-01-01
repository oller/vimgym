import { EditorState } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { getCM, vim } from "@replit/codemirror-vim";
import { useNavigate } from "@tanstack/react-router";
import { tokyoNightStorm } from "@uiw/codemirror-theme-tokyo-night-storm";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";

import { useGameStore } from "../store/useGameStore";
import { cn } from "../utils/cn";
import { SPECIAL_KEYS } from "../utils/vimsplain.types";
import { VimStatusBar } from "./VimStatusBar";

export const VimEditor = () => {
  const {
    currentLevel,
    startText,
    targetText,
    updateText,
    addKeyStroke,
    isCompleted,
  } = useGameStore();
  const navigate = useNavigate({ from: "/" });
  const [vimMode, setVimMode] = useState("normal");
  const isCompletedRef = useRef(isCompleted);
  const currentLevelRef = useRef(currentLevel);
  const editorViewRef = useRef<EditorView | null>(null);

  // Keep refs in sync with latest values
  useEffect(() => {
    isCompletedRef.current = isCompleted;
    currentLevelRef.current = currentLevel;
  }, [isCompleted, currentLevel]);

  const onChange = useCallback(
    (val: string) => {
      updateText(val);
    },
    [updateText],
  );

  const addKeyStrokeRef = useRef(addKeyStroke);
  useEffect(() => {
    addKeyStrokeRef.current = addKeyStroke;
  }, [addKeyStroke]);

  const onCreateEditor = useCallback((editorView: EditorView) => {
    editorViewRef.current = editorView;
    const cm = getCM(editorView);
    if (!cm) return;

    // editorView.contentAttributes.of({ "aria-label": "Vim editor" });

    // Listen for mode changes
    cm.on("vim-mode-change", (e: { mode: string }) => {
      setVimMode(e.mode);
    });

    // Listen for ALL keypresses (including insert mode typing)
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip modifier keys
      if (
        ["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab"].includes(
          event.key,
        )
      ) {
        return;
      }

      // Log the key with special key normalization
      let key = event.key;
      if (key === "Escape") key = SPECIAL_KEYS.ESCAPE;
      else if (key === "Enter") key = SPECIAL_KEYS.ENTER;
      else if (key === "Backspace") key = SPECIAL_KEYS.BACKSPACE;
      else if (key === "ArrowUp") key = SPECIAL_KEYS.ARROW_UP;
      else if (key === "ArrowDown") key = SPECIAL_KEYS.ARROW_DOWN;
      else if (key === "ArrowLeft") key = SPECIAL_KEYS.ARROW_LEFT;
      else if (key === "ArrowRight") key = SPECIAL_KEYS.ARROW_RIGHT;

      addKeyStrokeRef.current(key);
    };

    // Use capture phase to ensure we get keys before CodeMirror consumes them
    editorView.dom.addEventListener("keydown", handleKeyDown, true);

    // Cleanup on unmount
    return () => {
      editorView.dom.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  // Global keydown listener to intercept Enter when completed
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && isCompletedRef.current) {
        event.preventDefault();
        event.stopPropagation();

        // Navigate to next level
        navigate({ search: { levelId: currentLevelRef.current + 1 } });
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown, true); // Use capture phase

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [navigate]);

  // Make editor read-only when completed
  const extensions = [
    vim(), // vim bindings
    ...(isCompleted ? [EditorState.readOnly.of(true)] : []),
  ];

  return (
    <div
      className={cn(
        "border text-xl md:text-3xl grow rounded-md font-roboto-mono overflow-hidden bg-tokyo-night-storm transition-colors flex flex-col",
        isCompleted ? "border-green-500" : "border-gray-800",
      )}
      data-testid="vim-editor"
    >
      <div className="grow flex items-center px-4 overflow-x-auto scrollbar-thin">
        <div>
          <div
            className={cn(
              "pl-1.5 leading-11 mb-2 whitespace-pre-wrap",
              isCompleted ? "text-green-500" : "text-gray-600",
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
            theme={tokyoNightStorm}
            value={startText}
          />
        </div>
      </div>
      <VimStatusBar mode={vimMode} />
    </div>
  );
};
