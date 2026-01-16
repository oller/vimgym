import { EditorState } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import NumberFlow from "@number-flow/react";
import { getCM, Vim, vim } from "@replit/codemirror-vim";
import { useNavigate } from "@tanstack/react-router";
import { tokyoNightStorm } from "@uiw/codemirror-theme-tokyo-night-storm";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import { cn } from "../../utils/cn";
import { MODIFIER_KEY_MAP, SPECIAL_KEYS } from "../../utils/vimsplain.types";
import { VimStatusBar } from "./VimStatusBar";

export const VimEditor = () => {
  const {
    currentLevel,
    startText,
    targetText,
    updateText,
    addKeyStroke,
    isCompleted,
    history,
    resetLevel,
    setPoweredOff,
  } = useGameStore();
  const navigate = useNavigate({ from: "/" });
  const [vimMode, setVimMode] = useState("normal");
  const editorViewRef = useRef<EditorView | null>(null);

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

      ["q", "wq", "qa"].forEach((cmd) => {
        Vim.defineEx(cmd, "", () => setPoweredOff(true));
      });

      // At Phil's request. Shout out to Phil
      Vim.defineEx("e", "", () => resetLevel());

      // Listen for mode changes
      cm.on("vim-mode-change", (e: { mode: string }) => {
        setVimMode(e.mode);
      });

      // Handle keydown events in editor
      const handleEditorKeyDown = (event: KeyboardEvent) => {
        // Get current completion state from store
        const currentIsCompleted = useGameStore.getState().isCompleted;
        if (currentIsCompleted) return;

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

        // Check for modifier combinations first
        if (event.ctrlKey) {
          const modifierKey = `ctrl+${key.toLowerCase()}`;
          if (modifierKey in MODIFIER_KEY_MAP) {
            key =
              MODIFIER_KEY_MAP[modifierKey as keyof typeof MODIFIER_KEY_MAP];
          }
        }
        // Then check for standalone special keys (only if not already handled by modifier)
        else if (key === "Escape") key = SPECIAL_KEYS.ESCAPE;
        else if (key === "Enter") key = SPECIAL_KEYS.ENTER;
        else if (key === "Backspace") key = SPECIAL_KEYS.BACKSPACE;
        else if (key === "ArrowUp") key = SPECIAL_KEYS.ARROW_UP;
        else if (key === "ArrowDown") key = SPECIAL_KEYS.ARROW_DOWN;
        else if (key === "ArrowLeft") key = SPECIAL_KEYS.ARROW_LEFT;
        else if (key === "ArrowRight") key = SPECIAL_KEYS.ARROW_RIGHT;

        addKeyStrokeCallback(key);
      };

      // Use capture phase to ensure we get keys before CodeMirror consumes them
      editorView.dom.addEventListener("keydown", handleEditorKeyDown, true);

      // Cleanup on unmount
      return () => {
        editorView.dom.removeEventListener(
          "keydown",
          handleEditorKeyDown,
          true,
        );
      };
    },
    [addKeyStrokeCallback, setPoweredOff, resetLevel],
  );

  // Global keydown listener to intercept Enter when completed
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && isCompleted) {
        event.preventDefault();
        event.stopPropagation();

        // Navigate to next level
        navigate({ search: { levelId: currentLevel + 1 } });
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown, true); // Use capture phase

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [navigate, isCompleted, currentLevel]);

  // Make editor read-only when completed
  const extensions = useMemo(
    () => [
      vim(), // vim bindings
      ...(isCompleted ? [EditorState.readOnly.of(true)] : []),
    ],
    [isCompleted],
  );

  return (
    <div
      className={cn(
        "border text-xl md:text-3xl leading-8 md:leading-11 grow rounded-md font-roboto-mono overflow-hidden bg-tokyo-night-storm transition-colors flex flex-col",
        isCompleted ? "border-green-500" : "border-gray-800",
      )}
      data-testid="vim-editor"
    >
      <div className="relative grow flex items-center px-4 overflow-x-auto scrollbar-thin">
        <div className="absolute top-4 right-4 text-tokyo-night-pink">
          <NumberFlow value={history.length} />
        </div>
        <div>
          <div
            className={cn(
              "pl-1.5 mb-2 whitespace-pre-wrap",
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
