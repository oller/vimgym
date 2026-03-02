# GCC (Comment Toggling) Implementation Design

## Overview
The user requested the addition of the `gcc` vim command (and by extension `gc` in visual mode and `gc{motion}`) to toggle comments within the `vimgym` application's editor.

## Approach
We will use native CodeMirror 6 integration to ensure that comments are correctly formatted according to the active language (HTML, JS, Markdown, etc.). 

## Architecture & Components
1. **Dependencies**: 
   - Add `@codemirror/commands` to `package.json` to access the `toggleLineComment` command.
2. **Vim Operator Definition**:
   - In `src/components/VimEditor/VimEditor.tsx`, define a custom operator using `Vim.defineOperator("comment", ...)`.
3. **Execution Logic**:
   - The operator callback will receive ranges from the Vim layer.
   - It will map these `{line, ch}` coordinates to CodeMirror 6 absolute offsets.
   - It will execute the `toggleLineComment(editorView)` command after setting the correct selection.
   - The cursor will be restored to match expected Vim behavior.
4. **Key Mappings**:
   - Map `gc` operator in normal and visual modes to trigger the new operator using `Vim.mapCommand()`.

## Data Flow
User presses `gcc` -> `codemirror-vim` catches the `gc` operator and `c` line motion -> triggers our custom `comment` operator -> translates Vim range to CM6 selection -> calls CM6 `toggleLineComment` -> CM6 updates the AST and modifies text.

## Error Handling
If the selection conversion fails or the command is unsupported in a specific state, it will gracefully fallback or do nothing.
