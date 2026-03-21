---
"vimsplain": minor
---

**Internal Architecture Refactor:** The core parser has been completely rewritten from a monolithic loop into a highly performant, isolated Mode-based Handler architecture (Normal, Visual, Insert, Search, Command). 
**New Exports:** Added `VimMode` and `ParsingContext` types to the public API for developers who want to inspect or hook into the parser's internal state machine.
**Bulletproof Reliability:** The parser is now backed by extensive property-based fuzzing and headless CodeMirror integration testing to guarantee 100% accurate, regression-free explanations.
