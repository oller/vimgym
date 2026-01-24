import { EditorState } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import NumberFlow from "@number-flow/react";
import { getCM, Vim, vim } from "@replit/codemirror-vim";
import { useNavigate } from "@tanstack/react-router";
import { tokyoNightStorm } from "@uiw/codemirror-theme-tokyo-night-storm";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useRef, useState } from "react";
import { getLevel } from "../../data/levels";
import { useGameStore } from "../../store/useGameStore";
import { cn } from "../../utils/cn";
import { MODIFIER_KEY_MAP, SPECIAL_KEYS } from "../../utils/vimsplain.types";
import { VimStatusBar } from "./VimStatusBar";

export const VimEditor = () => {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const startText = useGameStore((state) => state.startText);
  const targetText = useGameStore((state) => state.targetText);
  const updateText = useGameStore((state) => state.updateText);
  const addKeyStroke = useGameStore((state) => state.addKeyStroke);
  const isCompleted = useGameStore((state) => state.isCompleted);
  const history = useGameStore((state) => state.history);
  const resetLevel = useGameStore((state) => state.resetLevel);
  const setPoweredOff = useGameStore((state) => state.setPoweredOff);
  const navigate = useNavigate({ from: "/" });
  const [vimMode, setVimMode] = useState("normal");
  const editorViewRef = useRef<EditorView | null>(null);

  const onChange = (val: string) => {
    updateText(val);
  };

  const addKeyStrokeCallback = (key: string) => addKeyStroke(key);

  const onCreateEditor = (editorView: EditorView) => {
    editorViewRef.current = editorView;
    const cm = getCM(editorView);
    if (!cm) return;

    ["q", "wq", "qa"].forEach((cmd) => {
      Vim.defineEx(cmd, "", () => setPoweredOff(true));
    });

    // At Phil's request. Shout out to Phil
    Vim.defineEx("e", "", (_cm, params) => {
      const arg = params.argString?.trim();

      if (!arg) {
        resetLevel();
        return;
      }

      const levelId = Number.parseInt(arg, 10);

      if (Number.isNaN(levelId)) {
        return;
      }

      const level = getLevel(levelId);
      if (!level) {
        return;
      }

      navigate({ search: { levelId }, replace: true });
    });

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
          key = MODIFIER_KEY_MAP[modifierKey as keyof typeof MODIFIER_KEY_MAP];
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
      editorView.dom.removeEventListener("keydown", handleEditorKeyDown, true);
      editorView.dom.removeEventListener("mousedown", handleMouseDown, true);
    };
  };

  // Global keydown listener to intercept Enter when completed
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && isCompleted) {
        event.preventDefault();
        event.stopPropagation();

        // Navigate to next level
        navigate({ search: { levelId: currentLevel + 1 }, replace: true });
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown, true); // Use capture phase

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [navigate, isCompleted, currentLevel]);

  // Make editor read-only when completed
  // Make editor read-only when completed
  const extensions = [
    vim(), // vim bindings
    ...(isCompleted ? [EditorState.readOnly.of(true)] : []),
  ];

  return (
    <div
      className={cn(
        "border text-xl md:text-3xl leading-8 md:leading-11 grow rounded-md font-roboto-mono overflow-hidden bg-tokyo-night-storm transition-colors flex flex-col",
        isCompleted ? "border-green-500" : "border-gray-800",
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
