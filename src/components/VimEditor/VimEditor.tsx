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
  resolveBeforeInputEvent,
  resolveCompositionEndEvent,
} from "../../utils/keyboard";
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

      // Dedup state: tracks the last key logged by keydown so that
      // beforeinput/compositionend don't double-count the same physical press.
      // Only cross-handler dedup — repeated keys from the same handler
      // (e.g. typing "ll") are never suppressed.
      const dedupeWindowMs = 80;
      let lastKeydownKey: string | null = null;
      let lastKeydownAt = 0;

      // Desktop path: keydown fires with the actual key value.
      // Mobile: keydown fires with "Unidentified" — skip and rely on
      // beforeinput/compositionend instead.
      const handleEditorKeyDown = (event: KeyboardEvent) => {
        if (useGameStore.getState().isCompleted) return;
        if (event.key === "Unidentified") return;

        const key = normalizeKeydownEvent(event);
        if (!key) return;
        addKeyStrokeCallback(key);
        lastKeydownKey = key;
        lastKeydownAt = performance.now();
      };

      // Handles direct text insertion (desktop) and composition-based
      // insertion (Android soft keyboards that fire insertCompositionText).
      // Deduped against keydown to avoid double-counting on desktop.
      const handleBeforeInput = (event: InputEvent) => {
        if (useGameStore.getState().isCompleted) return;

        const key = resolveBeforeInputEvent(event);
        if (!key) return;
        const now = performance.now();
        if (lastKeydownKey === key && now - lastKeydownAt < dedupeWindowMs) {
          return;
        }
        addKeyStrokeCallback(key);
      };

      // Android soft keyboards route all input through IME composition.
      // compositionend fires once per completed keypress with the final
      // character, providing reliable capture even when beforeinput uses
      // an unhandled inputType or doesn't fire at all.
      // Deduped against keydown to avoid double-counting on desktop.
      const handleCompositionEnd = (event: CompositionEvent) => {
        if (useGameStore.getState().isCompleted) return;

        const key = resolveCompositionEndEvent(event);
        if (!key) return;
        const now = performance.now();
        if (lastKeydownKey === key && now - lastKeydownAt < dedupeWindowMs) {
          return;
        }
        addKeyStrokeCallback(key);
      };

      // ──── TEMPORARY DIAGNOSTIC: remove after debugging mobile ────
      // Logs ALL input-related events to console so we can see what
      // actually fires on Android Chrome's soft keyboard.
      const diagEvents = [
        "keydown",
        "keyup",
        "keypress",
        "beforeinput",
        "input",
        "compositionstart",
        "compositionupdate",
        "compositionend",
      ] as const;
      const diagHandlers: Array<[string, EventListener]> = [];
      for (const evtName of diagEvents) {
        const handler = ((e: Event) => {
          const info: Record<string, unknown> = { type: evtName };
          if ("key" in e) info.key = (e as KeyboardEvent).key;
          if ("keyCode" in e) info.keyCode = (e as KeyboardEvent).keyCode;
          if ("inputType" in e) info.inputType = (e as InputEvent).inputType;
          if ("data" in e) info.data = (e as InputEvent).data;
          console.log("[VimGym diag]", JSON.stringify(info));
        }) as EventListener;
        editorView.contentDOM.addEventListener(evtName, handler, true);
        diagHandlers.push([evtName, handler]);
      }
      // ──── END DIAGNOSTIC ────

      editorView.dom.addEventListener("keydown", handleEditorKeyDown, true);
      editorView.contentDOM.addEventListener(
        "beforeinput",
        handleBeforeInput as EventListener,
        true,
      );
      editorView.contentDOM.addEventListener(
        "compositionend",
        handleCompositionEnd as EventListener,
        true,
      );

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

      return () => {
        editorView.dom.removeEventListener(
          "keydown",
          handleEditorKeyDown,
          true,
        );
        editorView.contentDOM.removeEventListener(
          "beforeinput",
          handleBeforeInput as EventListener,
          true,
        );
        editorView.contentDOM.removeEventListener(
          "compositionend",
          handleCompositionEnd as EventListener,
          true,
        );
        editorView.dom.removeEventListener("mousedown", handleMouseDown, true);
        // Diagnostic cleanup
        for (const [evtName, handler] of diagHandlers) {
          editorView.contentDOM.removeEventListener(evtName, handler, true);
        }
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
