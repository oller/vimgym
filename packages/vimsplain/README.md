# vimsplain

Parse and explain Vim keystroke sequences.

```ts
import { explainSequence, summarizeSequence } from "vimsplain";

explainSequence("ggdG");
// {
//   commands: [
//     { matched: "gg", explanation: "go to start of file" },
//     { matched: "dG", explanation: "delete to end of file" },
//   ],
//   remaining: ""
// }

summarizeSequence("ddp");
// "delete line, then paste after cursor"
```

## Install

```bash
npm install vimsplain
# or
pnpm add vimsplain
```

## API

### `explainSequence(input: string): ExplainResult`

Parses a Vim keystroke sequence and returns structured explanations for each command.

Handles four parsing modes:

- **Normal mode** — motions, operators, text objects
- **Insert mode** — after `i`, `a`, `cw`, etc., accumulates typed text until `[Esc]`
- **Search mode** — after `/` or `?`, accumulates pattern until `[Enter]`
- **Ex mode** — after `:`, accumulates command until `[Enter]`

**Special key notation:** Encode special keys as bracketed strings: `[Esc]`, `[Enter]`, `[Backspace]`, `[Delete]`, `[Up]`, `[Down]`, `[Left]`, `[Right]`, `[C-r]`, `[C-w]`, `[C-o]`, `[C-i]`.

Use the exported `SPECIAL_KEYS` constants to avoid typos:

```ts
import { SPECIAL_KEYS, explainSequence } from "vimsplain";

explainSequence(`ihello${SPECIAL_KEYS.ESCAPE}`);
// commands: [
//   { matched: "i",     explanation: "insert before cursor" },
//   { matched: "hello", explanation: 'type "hello"' },
//   { matched: "[Esc]", explanation: "exit insert mode" }
// ]
```

### `formatExplanation(result: ExplainResult): string`

Formats an `ExplainResult` as a human-readable multi-line string.

```ts
import { explainSequence, formatExplanation } from "vimsplain";

const result = explainSequence("ggdG");
console.log(formatExplanation(result));
// gg: go to start of file
// dG: delete to end of file
```

### `summarizeSequence(input: string): string`

Parses a sequence and returns a plain English summary joined by `", then "`.

```ts
import { summarizeSequence } from "vimsplain";

summarizeSequence("yyp");
// "yank line, then paste after cursor"
```

## Types

```ts
type ExplainedCommand = {
  matched: string;      // The matched keystroke(s)
  explanation: string;  // Human-readable explanation
};

type ExplainResult = {
  commands: ExplainedCommand[];
  remaining: string;    // Any unmatched trailing input
};

type CommandDefinition = {
  pattern: RegExp;
  description: string;
  isMotion: boolean;
};
```

## Constants

```ts
import { SPECIAL_KEYS, MODIFIER_KEY_MAP } from "vimsplain";

SPECIAL_KEYS.ESCAPE     // "[Esc]"
SPECIAL_KEYS.ENTER      // "[Enter]"
SPECIAL_KEYS.BACKSPACE  // "[Backspace]"
SPECIAL_KEYS.CTRL_R     // "[C-r]"
SPECIAL_KEYS.CTRL_W     // "[C-w]"
SPECIAL_KEYS.CTRL_O     // "[C-o]"
SPECIAL_KEYS.CTRL_I     // "[C-i]"
// ... etc
```

## Supported Commands

<!-- COMMANDS_TABLE_START -->

| Keystroke | Description |
|-----------|-------------|
| `N` | move $1 chars right |
| `` | move char right |
| `"_dd` | delete line (discard) |
| `"_dNw` | delete $1 word(s) (discard) |
| `"\+yy` | yank line to system clipboard |
| `"\+p` | paste from system clipboard after cursor |
| `"\+P` | paste from system clipboard before cursor |
| `"(a)yy` | yank line into register '$1' |
| `"(a)dd` | delete line into register '$1' |
| `"(a)p` | paste from register '$1' after cursor |
| `"(a)P` | paste from register '$1' before cursor |
| `d$` | delete to end of line |
| `d0` | delete to start of line |
| `d^` | delete to first non-blank |
| `dgg` | delete to start of file |
| `dG` | delete to end of file |
| `dNw` | delete $1 word(s) forward |
| `dNb` | delete $1 word(s) backward |
| `dNe` | delete to end of $1 word(s) |
| `dNj` | delete $1 line(s) down |
| `dNk` | delete $1 line(s) up |
| `df(.)` | delete through '$1' |
| `dF(.)` | delete back through '$1' |
| `dt(.)` | delete till '$1' |
| `dT(.)` | delete back till '$1' |
| `dd` | delete line |
| `Ndd` | delete $1 lines |
| `D` | delete to end of line |
| `c$` | change to end of line |
| `c0` | change to start of line |
| `c^` | change to first non-blank |
| `cNw` | change $1 word(s) forward |
| `cNb` | change $1 word(s) backward |
| `cNe` | change to end of $1 word(s) |
| `cf(.)` | change through '$1' |
| `cF(.)` | change back through '$1' |
| `ct(.)` | change till '$1' |
| `cT(.)` | change back till '$1' |
| `cc` | change entire line |
| `C` | change to end of line |
| `S` | substitute entire line |
| `s` | substitute character and enter insert mode |
| `y$` | yank to end of line |
| `y0` | yank to start of line |
| `y^` | yank to first non-blank |
| `yNw` | yank $1 word(s) forward |
| `yf(.)` | yank through '$1' |
| `yF(.)` | yank back through '$1' |
| `yt(.)` | yank till '$1' |
| `yT(.)` | yank back till '$1' |
| `yy` | yank line |
| `Y` | yank line |
| `Nyy` | yank $1 lines |
| `ciw` | change inner word |
| `caw` | change a word (with space) |
| `ci'` | change inside '' |
| `ca'` | change around '' |
| `ci(` | change inside () |
| `ci)` | change inside () |
| `ca(` | change around () |
| `ca)` | change around () |
| `ci[` | change inside [] |
| `ci]` | change inside [] |
| `ca[` | change around [] |
| `ca]` | change around [] |
| `ci{` | change inside {} |
| `ci}` | change inside {} |
| `ca{` | change around {} |
| `ca}` | change around {} |
| `cit` | change inside tag |
| `cat` | change around tag |
| `diw` | delete inner word |
| `daw` | delete a word (with space) |
| `di'` | delete inside '' |
| `da'` | delete around '' |
| `di(` | delete inside () |
| `di)` | delete inside () |
| `da(` | delete around () |
| `da)` | delete around () |
| `di[` | delete inside [] |
| `di]` | delete inside [] |
| `da[` | delete around [] |
| `da]` | delete around [] |
| `di{` | delete inside {} |
| `di}` | delete inside {} |
| `da{` | delete around {} |
| `da}` | delete around {} |
| `dit` | delete inside tag |
| `dat` | delete around tag |
| `yiw` | yank inner word |
| `yaw` | yank a word (with space) |
| `yi'` | yank inside '' |
| `ya'` | yank around '' |
| `yi(` | yank inside () |
| `yi)` | yank inside () |
| `ya(` | yank around () |
| `ya)` | yank around () |
| `viw` | select inner word |
| `vaw` | select a word (with space) |
| `vi'` | select inside '' |
| `va'` | select around '' |
| `vi(` | select inside () |
| `va(` | select around () |
| `vi)` | select inside () |
| `va)` | select around () |
| `vi[` | select inside [] |
| `va[` | select around [] |
| `vi]` | select inside [] |
| `va]` | select around [] |
| `vi{` | select inside {} |
| `va{` | select around {} |
| `vi}` | select inside {} |
| `va}` | select around {} |
| `vit` | select inside tag |
| `vat` | select around tag |
| `ci<` | change inside <> |
| `ci>` | change inside <> |
| `ca<` | change around <> |
| `ca>` | change around <> |
| `di<` | delete inside <> |
| `di>` | delete inside <> |
| `da<` | delete around <> |
| `da>` | delete around <> |
| `yi<` | yank inside <> |
| `yi>` | yank inside <> |
| `ya<` | yank around <> |
| `ya>` | yank around <> |
| `vi<` | select inside <> |
| `vi>` | select inside <> |
| `va<` | select around <> |
| `va>` | select around <> |
| `ci`` | change inside `` |
| `ca`` | change around `` |
| `di`` | delete inside `` |
| `da`` | delete around `` |
| `yi`` | yank inside `` |
| `ya`` | yank around `` |
| `vi`` | select inside `` |
| `va`` | select around `` |
| `f(.)` | find '$1' forward |
| `F(.)` | find '$1' backward |
| `t(.)` | till '$1' forward |
| `T(.)` | till '$1' backward |
| `;` | repeat last f/t/F/T |
| `,` | repeat last f/t/F/T reverse |
| `Nw` | move $1 words forward |
| `w` | move word forward |
| `NW` | move $1 WORDS forward |
| `W` | move WORD forward |
| `Nb` | move $1 words backward |
| `b` | move word backward |
| `NB` | move $1 WORDS backward |
| `B` | move WORD backward |
| `Ne` | move to end of $1 words |
| `e` | move to end of word |
| `NE` | move to end of $1 WORDS |
| `E` | move to end of WORD |
| `ge` | move to end of previous word |
| `gE` | move to end of previous WORD |
| `0` | move to start of line |
| `$` | move to end of line |
| `^` | move to first non-blank |
| `_` | move to first non-blank |
| `Nj` | move $1 lines down |
| `j` | move line down |
| `Nk` | move $1 lines up |
| `k` | move line up |
| `Nh` | move $1 chars left |
| `h` | move char left |
| `Nl` | move $1 chars right |
| `l` | move char right |
| `gg` | go to start of file |
| `Ngg` | go to line $1 |
| `G` | go to end of file |
| `NG` | go to line $1 |
| `{` | move paragraph backward |
| `}` | move paragraph forward |
| `(` | move sentence backward |
| `)` | move sentence forward |
| `i` | insert before cursor |
| `I` | insert at start of line |
| `a` | append after cursor |
| `A` | append at end of line |
| `o` | open line below |
| `O` | open line above |
| `Nx` | delete $1 chars |
| `x` | delete char under cursor |
| `X` | delete char before cursor |
| `r(.)` | replace with '$1' |
| `R` | enter replace mode |
| `~` | toggle case |
| `J` | join lines |
| `gJ` | join lines (no space) |
| `u` | undo |
| `U` | undo line |
| `[C-r]` | redo |
| `p` | paste after cursor |
| `P` | paste before cursor |
| `\.` | repeat last change |
| `v` | enter visual mode |
| `V` | enter visual line mode |
| `m(.)` | set mark '$1' |
| `'(.)` | go to mark '$1' (line) |
| ``(.)` | go to mark '$1' (exact) |
| `q(a)` | start recording macro '$1' |
| `q` | stop recording macro |
| `@@` | replay last macro |
| `@(a)` | play macro '$1' |
| `n` | next search match |
| `N` | previous search match |
| `\*` | search word under cursor forward |
| `#` | search word under cursor backward |
| `%` | go to matching bracket |
| `zO` | open all folds recursively |
| `zR` | open all folds |
| `zM` | close all folds |
| `zo` | open fold |
| `zc` | close fold |
| `za` | toggle fold |
| `z=` | suggest spelling corrections |
| `zg` | add word to dictionary |
| `zw` | mark word as incorrect |
| `]s` | next misspelling |
| `[s` | previous misspelling |
| `zz` | center cursor line |
| `zt` | scroll cursor to top |
| `zb` | scroll cursor to bottom |
| `guNw` | lowercase $1 word(s) |
| `gUNw` | uppercase $1 word(s) |
| `guw` | lowercase word |
| `gUw` | uppercase word |
| `guu` | lowercase line |
| `gUU` | uppercase line |
| `g~~` | toggle case line |
| `gcc` | toggle comment line |
| `gcNw` | toggle comment $1 word(s) forward |
| `gcNj` | toggle comment $1 line(s) down |
| `gcNk` | toggle comment $1 line(s) up |
| `gciw` | toggle comment inner word |
| `gcaw` | toggle comment a word |
| `gci(` | toggle comment inside () |
| `gca(` | toggle comment around () |
| `gc` | toggle comment selection |
| `=ap` | auto-indent paragraph |
| `=G` | auto-indent to end of file |
| `=%` | auto-indent to matching bracket |
| `=Nj` | auto-indent $1 lines down |
| `>>` | indent line |
| `<<` | dedent line |
| `>Nj` | indent $1 lines down |
| `<Nj` | dedent $1 lines down |
| `[C-w]s` | split window horizontally |
| `[C-w]v` | split window vertically |
| `[C-w]h` | move to window left |
| `[C-w]j` | move to window below |
| `[C-w]k` | move to window above |
| `[C-w]l` | move to window right |
| `[C-w]q` | close window |
| `[C-o]` | jump back |
| `[C-i]` | jump forward |
| `[Esc]` | return to normal mode |
| `[Enter]` | execute/confirm |
| `[Backspace]` | delete char left |
| `[Delete]` | delete char under cursor |
| `[Up]` | move up |
| `[Down]` | move down |
| `[Left]` | move left |
| `[Right]` | move right |

<!-- COMMANDS_TABLE_END -->

## Contributing

Issues and PRs welcome. The command definitions live in `src/vimsplain.ts` as a `NORMAL_COMMANDS` array — adding new commands is a one-liner:

```ts
{ pattern: /^gf/, description: "go to file under cursor", isMotion: false }
```

## License

MIT
