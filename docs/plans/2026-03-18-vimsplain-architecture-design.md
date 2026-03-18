# Vimsplain Architecture & Testing Upgrade Design

## Overview
The `vimsplain` package currently relies on a monolithic `while` loop and a large array of regex patterns to parse Vim commands. While this has worked well and has excellent test coverage (98%+), it is becoming difficult to scale, particularly for complex mode interactions and advanced Ex command parsing.

This design outlines a strategy to upgrade the parsing architecture to a Mode-based Handler system and significantly level up the testing methodology.

## 1. Testing Strategy (Phase 1)
Before refactoring the architecture, we will establish an impenetrable testing shield around the current parser.

### Property-Based Testing (Fuzzing)
- Use a library like `fast-check` to generate random, valid, and pseudo-valid Vim command sequences.
- Ensure the parser never crashes or enters infinite loops.
- Verify basic invariants (e.g., input string length should roughly correlate to explanation count, no `undefined` explanations).

### Integration Testing
- Create tests that run commands against an actual headless CodeMirror instance (using `@replit/codemirror-vim`).
- Assert that the `vimsplain` explanation accurately describes the state changes that occurred in CodeMirror (e.g., if `vimsplain` says "delete word", assert that CodeMirror actually deleted a word).

### Extended Unit Tests
- Continue building the unit test suite, focusing on complex edge cases and mode transitions that the fuzzing uncovers.

## 2. Architecture Refactor: Mode-Based Handlers (Phase 2)
Once the testing shield is in place, we will refactor the core parsing loop.

### Core Concept
Separate the single monolithic `while` loop into discrete handler classes/functions representing Vim's modes:
- `NormalModeParser`
- `VisualModeParser`
- `InsertModeParser`
- `ExModeParser`
- `SearchModeParser`

### Data Flow
1. The main `explainSequence` function delegates to the active mode parser.
2. The active mode parser consumes as much of the input string as it can.
3. If a command triggers a mode change (e.g., `v` in normal mode, `:` in normal mode, `<Esc>` in insert mode), the parser returns a state transition signal along with the explained commands.
4. The main loop updates the active mode and passes the remaining string to the new mode parser.

### Advantages
- **Decoupled Complexity:** Handling backspaces in insert mode no longer lives next to regexes for normal mode motions.
- **Advanced Ex Commands:** The `ExModeParser` can implement a robust, AST-like parser for complex commands (e.g., `:%s/foo/bar/g`) without polluting the regex list used by `NormalModeParser`.
- **Maintainability:** Easier for multiple contributors to add features without merge conflicts in a single massive array.

## 3. Execution Plan
1.  **PR 1: Setup Testing Infrastructure.** Install `fast-check`, setup headless CodeMirror testing harness.
2.  **PR 2: Implement Property-Based & Integration Tests.** Write the test suites and run them against the *current* monolithic parser. Fix any edge cases uncovered.
3.  **PR 3: Core Architecture Refactor.** Implement the Mode-Based Handlers. Use the tests from PR 2 to guarantee zero regressions.
4.  **PR 4: Advanced Features.** Implement complex Ex command parsing leveraging the new `ExModeParser`.

## Next Steps
Transition to implementation plan using the `writing-plans` skill.
