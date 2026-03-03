import { toggleLineComment } from "@codemirror/commands";
import type { EditorView } from "@codemirror/view";
import { Vim } from "@replit/codemirror-vim";
import { LEVELS } from "../../data/levels";
import { useGameStore } from "../../store/useGameStore";

export function useVimSetup(setLevelId: (id: string) => void) {
  const resetLevel = useGameStore((state) => state.resetLevel);
  const setPoweredOff = useGameStore((state) => state.setPoweredOff);

  const setupVim = (editorView: EditorView) => {
    // Define Ex commands
    ["q", "wq", "qa"].forEach((cmd) => {
      Vim.defineEx(cmd, "", () => setPoweredOff(true));
    });

    // Add comment operator (gcc, gcaw, etc)
    Vim.defineOperator("comment", (_cm: any, _args: any, ranges: any[]) => {
      // In @replit/codemirror-vim, the cm object is a CM5 wrapper
      // We trigger toggleLineComment on the provided EditorView
      const selections = ranges.map((r) => {
        const docLines = editorView.state.doc.lines;
        const line = (n: number) =>
          editorView.state.doc.line(Math.min(Math.max(n, 1), docLines));

        const anchorLine = line(r.anchor.line + 1);
        const from = anchorLine.from + Math.min(r.anchor.ch, anchorLine.length);

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
    });

    // Map gc to the comment operator
    Vim.mapCommand("gc", "operator", "comment", {}, {});

    // Level navigation command :e <n>
    Vim.defineEx("e", "", (_cm, params) => {
      const arg = params.argString?.trim();

      if (!arg) {
        resetLevel();
        return;
      }

      const levelIndex = Number.parseInt(arg, 10);

      if (
        Number.isNaN(levelIndex) ||
        levelIndex < 1 ||
        levelIndex > LEVELS.length
      ) {
        return;
      }

      const level = LEVELS[levelIndex - 1];
      if (level) {
        setLevelId(level.id);
      }
    });
  };

  return { setupVim };
}
