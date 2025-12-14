import { EditorState } from "@codemirror/state";
import { getCM, vim } from "@replit/codemirror-vim";
import { tokyoNightStorm } from "@uiw/codemirror-theme-tokyo-night-storm";
import CodeMirror, { type EditorView } from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { VimStatusBar } from "./VimStatusBar";

export const VimEditor = () => {
  const {
    startText,
    targetText,
    updateText,
    addKeyStroke,
    isCompleted,
    nextLevel,
    checkAndUpdateHighScore,
  } = useGameStore();
  const [vimMode, setVimMode] = useState("normal");
  const isUpdatingRef = useRef(false);
  const isCompletedRef = useRef(isCompleted);
  const nextLevelRef = useRef(nextLevel);

  // Keep refs in sync with latest values
  useEffect(() => {
    isCompletedRef.current = isCompleted;
    nextLevelRef.current = nextLevel;
  }, [isCompleted, nextLevel]);

  // Check and update high score when level is completed
  useEffect(() => {
    if (isCompleted) {
      checkAndUpdateHighScore();
    }
  }, [isCompleted, checkAndUpdateHighScore]);

  const onChange = useCallback(
    (val: string) => {
      // Skip onChange during programmatic updates
      if (isUpdatingRef.current) return;
      updateText(val);
    },
    [updateText],
  );

  const onCreateEditor = useCallback(
    (editorView: EditorView) => {
      const cm = getCM(editorView);
      if (!cm) return;

      // Listen for mode changes
      cm.on("vim-mode-change", (e: { mode: string }) => {
        setVimMode(e.mode);
      });

      // Listen for Vim command keys (normal mode, visual mode, etc.)
      cm.on("vim-keypress", (key: string) => {
        addKeyStroke(key);
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

        // Log the key
        let key = event.key;
        if (key === "Escape") key = "Esc";
        if (key === "Enter") key = "Enter";
        if (key === " ") key = "Space";

        addKeyStroke(key);
      };

      editorView.dom.addEventListener("keydown", handleKeyDown);

      // Cleanup on unmount
      return () => {
        editorView.dom.removeEventListener("keydown", handleKeyDown);
      };
    },
    [addKeyStroke],
  );

  // Global keydown listener to intercept Enter when completed
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && isCompletedRef.current) {
        event.preventDefault();
        event.stopPropagation();
        nextLevelRef.current();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown, true); // Use capture phase

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, []);

  // Make editor read-only when completed
  const extensions = [
    vim(), // vim bindings
    ...(isCompleted ? [EditorState.readOnly.of(true)] : []),
  ];

  return (
    <div
      data-testid="vim-editor"
      className={`border text-3xl grow rounded-md font-roboto-mono overflow-hidden bg-tokyo-night-storm transition-colors flex flex-col ${isCompleted ? "border-green-500" : "border-gray-700"}`}
    >
      <div className="grow flex items-center px-4 overflow-x-auto scrollbar-thin">
        <div>
          <div
            className={`pl-1.5 mb-2 ${isCompleted ? "text-green-500" : "text-gray-600"}`}
          >
            {targetText}
          </div>
          <CodeMirror
            value={startText}
            extensions={extensions}
            onChange={onChange}
            onCreateEditor={onCreateEditor}
            theme={tokyoNightStorm}
            autoFocus
            basicSetup={{
              lineNumbers: false,
              highlightActiveLine: false,
              foldGutter: false,
              autocompletion: false,
              closeBrackets: false,
            }}
          />
        </div>
      </div>
      <VimStatusBar mode={vimMode} />
    </div>
  );
};
