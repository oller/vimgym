import { toggleLineComment } from "@codemirror/commands";
import type { EditorView } from "@codemirror/view";
import { Vim } from "@replit/codemirror-vim";
import { useCallback, useEffect, useRef } from "react";

type UseVimSetupOptions = {
  onReset: () => void;
  onPowerOff: () => void;
  onSelectLevelIndex?: (levelIndex: number) => void;
};

export function useVimSetup({
  onReset,
  onPowerOff,
  onSelectLevelIndex,
}: UseVimSetupOptions) {
  const onResetRef = useRef(onReset);
  const onPowerOffRef = useRef(onPowerOff);
  const onSelectLevelIndexRef = useRef(onSelectLevelIndex);

  useEffect(() => {
    onResetRef.current = onReset;
    onPowerOffRef.current = onPowerOff;
    onSelectLevelIndexRef.current = onSelectLevelIndex;
  }, [onReset, onPowerOff, onSelectLevelIndex]);

  const setupVim = useCallback((editorView: EditorView) => {
    // Define Ex commands
    ["q", "wq", "qa"].forEach((cmd) => {
      Vim.defineEx(cmd, "", () => onPowerOffRef.current());
    });

    // Add comment operator (gcc, gcaw, etc)
    Vim.defineOperator(
      "comment",
      (
        _cm: unknown,
        _args: unknown,
        ranges: {
          anchor: { line: number; ch: number };
          head: { line: number; ch: number };
        }[],
      ) => {
        // In @replit/codemirror-vim, the cm object is a CM5 wrapper
        // We trigger toggleLineComment on the provided EditorView
        const selections = ranges.map((r) => {
          const docLines = editorView.state.doc.lines;
          const line = (n: number) =>
            editorView.state.doc.line(Math.min(Math.max(n, 1), docLines));

          const anchorLine = line(r.anchor.line + 1);
          const from =
            anchorLine.from + Math.min(r.anchor.ch, anchorLine.length);

          let to: number;
          if (r.head.line >= docLines) {
            // If the head is at or beyond the last line, include the entire last line
            const lastLine = editorView.state.doc.line(docLines);
            to = lastLine.to;
          } else {
            const headLine = line(r.head.line + 1);
            to = headLine.from + Math.min(r.head.ch, headLine.length);
          }

          return { anchor: from, head: to };
        });

        editorView.dispatch({
          selection: { anchor: selections[0].anchor, head: selections[0].head },
        });

        // Execute the toggle command
        toggleLineComment(editorView);

        // We don't restore selection because Vim motions usually place the cursor at the start of the range
        const newCursorPos = Math.min(selections[0].anchor, selections[0].head);
        editorView.dispatch({
          selection: { anchor: newCursorPos, head: newCursorPos },
        });
      },
    );

    // Map gc to the comment operator
    Vim.mapCommand("gc", "operator", "comment", {}, {});

    // Level navigation / reset command :e [n]
    Vim.defineEx("e", "", (_cm, params) => {
      const arg = params.argString?.trim();

      if (!arg) {
        onResetRef.current();
        return;
      }

      const levelIndex = Number.parseInt(arg, 10);
      if (Number.isNaN(levelIndex)) {
        return;
      }

      onSelectLevelIndexRef.current?.(levelIndex);
    });
  }, []);

  return { setupVim };
}
