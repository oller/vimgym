# vimsplain

## 0.2.0

### Minor Changes

- [#17](https://github.com/oller/vimgym/pull/17) [`f4b2e73`](https://github.com/oller/vimgym/commit/f4b2e73640a13571df74e07a2466b397ed50f5e9) Thanks [@oller](https://github.com/oller)! - **Internal Architecture Refactor:** The core parser has been completely rewritten from a monolithic loop into a highly performant, isolated Mode-based Handler architecture (Normal, Visual, Insert, Search, Command).
  **New Exports:** Added `VimMode` and `ParsingContext` types to the public API for developers who want to inspect or hook into the parser's internal state machine.
  **Bulletproof Reliability:** The parser is now backed by extensive property-based fuzzing and headless CodeMirror integration testing to guarantee 100% accurate, regression-free explanations.

## 0.1.7

### Patch Changes

- [#15](https://github.com/oller/vimgym/pull/15) [`553c90d`](https://github.com/oller/vimgym/commit/553c90d3ec490d34e169a56e871881d838468d9a) Thanks [@oller](https://github.com/oller)! - docs: remove unused MODIFIER_KEY_MAP import from README

## 0.1.6

### Patch Changes

- [#13](https://github.com/oller/vimgym/pull/13) [`3c3792d`](https://github.com/oller/vimgym/commit/3c3792d19b09431454251cf4ce5010bbf0ac2dff) Thanks [@oller](https://github.com/oller)! - fix: handle nested quotes in command descriptions for README generation

## 0.1.5

### Patch Changes

- [#11](https://github.com/oller/vimgym/pull/11) [`49727f8`](https://github.com/oller/vimgym/commit/49727f857ca80a60c40ffa19425433088ca74cd0) Thanks [@oller](https://github.com/oller)! - optimize contents of bundled package, now minified

## 0.1.4

### Patch Changes

- [#9](https://github.com/oller/vimgym/pull/9) [`7bafa31`](https://github.com/oller/vimgym/commit/7bafa3110e3ba7cb158f45418984be8ac85f6b62) Thanks [@oller](https://github.com/oller)! - docs(vimsplain): optimize README intro and add richer examples

## 0.1.3

### Patch Changes

- [#6](https://github.com/oller/vimgym/pull/6) [`804282a`](https://github.com/oller/vimgym/commit/804282a2a60dde7ab0863e177253b29acd1e5440) Thanks [@oller](https://github.com/oller)! - Fix visual mode operators (d, D, c, C, y, Y, x, X, s, S, ~, >, <, =, J, p, P, gc, gu, gU, g~, gq) now correctly explained as acting on the selection rather than with their normal-mode meanings. Also adds support for block visual mode ([C-v]).

## 0.1.2

### Patch Changes

- [#2](https://github.com/oller/vimgym/pull/2) [`160404f`](https://github.com/oller/vimgym/commit/160404f9c0218265672f17af6b41ed94e0ca3b96) Thanks [@oller](https://github.com/oller)! - Add npm version, downloads, CI status, and license badges to README.

## 0.1.1

### Patch Changes

- Add comprehensive test coverage for all command patterns and CI coverage thresholds.

## 0.1.0

### Minor Changes

- Initial release — parse and explain Vim keystroke sequences.
