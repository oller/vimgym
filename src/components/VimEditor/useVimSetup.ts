import { toggleLineComment } from "@codemirror/commands";
import type { EditorView } from "@codemirror/view";
import { Vim } from "@replit/codemirror-vim";
import { LEVELS } from "../../data/levels";
import { useGameStore } from "../../store/useGameStore";

export function useVimSetup(
  editorViewRef: React.MutableRefObject<EditorView | null>,
  setLevelId: (id: string) => void,
) {
  const resetLevel = useGameStore((state) => state.resetLevel);
  const setPoweredOff = useGameStore((state) => state.setPoweredOff);

  const setupVim = (_editorView: EditorView) => {
    // Define Ex commands
    ["q", "wq", "qa"].forEach((cmd) => {
      Vim.defineEx(cmd, "", () => setPoweredOff(true));
    });

    // Add comment operator (gcc, gcaw, etc)
    Vim.defineOperator("comment", (_cm: any, _args: any, ranges: any[]) => {
      if (!editorViewRef.current) return;
      const view = editorViewRef.current;

      const selections = ranges.map((r) => {
        const line = (n: number) =>
          view.state.doc.line(Math.min(Math.max(n, 1), view.state.doc.lines));
        const anchorLine = line(r.anchor.line + 1);
        const headLine = line(r.head.line + 1);
        const from = anchorLine.from + Math.min(r.anchor.ch, anchorLine.length);
        const to = headLine.from + Math.min(r.head.ch, headLine.length);
        return { anchor: from, head: to };
      });

      view.dispatch({
        selection: { anchor: selections[0].anchor, head: selections[0].head },
      });

      // Execute the toggle command
      toggleLineComment(view);

      // We don't restore selection because Vim motions usually place the cursor at the start of the range
      const newCursorPos = Math.min(selections[0].anchor, selections[0].head);
      view.dispatch({
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
