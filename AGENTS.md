# General

- The `README.md` contains the full spec of the application. Read it end-to-end to understand the full context. It should be kept up to date whenever the code is ready for a PR
- You must follow the instructions in the `AGENTS.md` file while working on your task and regularly review if you are still aligned with these instructions and the spec.
- Do not stop until every acceptance criterion is implemented, verified locally and prepared for review.
- **Co-locate docs**: every code file must have a matching `*.md` sidecar next to it, that explains the component in detail. The goal of the sidecar is to make purpose, API, invariants, examples and test strategy of the component obvious to agents and humans.
- This is a minimal local first web app (static HTML + modular JS). Prefer tailwind over custom CSS.
- Entrypoint: `index.html` (+ static pages in `pages/` if any needed)
- The code is composed of small, focused modules in `src/` (`components/`, `utils/`, ..) with colocated tests
- Do exactly one prioritized task per iteration and work in a TDD approach where possible.
- Before and after any change, run `npm test`
- Run `npm outdated` weekly at minimum; keep dependencies healthy. Prefer bumping to the `Wanted` version unless blocked by incompatibilities (document any exceptions). Also run `npm audit` to catch security issues even when versions are current.
- Only change code directly related to the current task; keep diffs small!
- Preserve existing comments & docs; add concise, long-lived comments where useful and avoid narrating changes via comments
- When external documentation could be consulted, do so to validate your plan makes sense. If you lack a browsing/online search tool, ask the user to run an online search for you (e.g., "Please search for \"x\" and paste back the findings")
- Before adding functionality, search the codebase (e.g., ripgrep) to confirm it's truly absent. If present, prefer refactor over re-implementation.
- After each iteration add a concise update at the end of docs/implementation-progress.md to use it as the memory between iterations for learnings, decisions, planning etc.

## Dependencies & no-build approach to use

This project follows a no-build, static workflow:

- Use native ES modules and `<script type="importmap">` to map bare specifiers when needed.
- Then load your entry/module scripts with `<script type="module">` and import using the mapped specifiers.
- Prefer CDN URLs from unpkg.com for third-party modules compatible with ESM.
- Do not add bundlers/build chains unless explicitly requested/approved.

## When communicating with the developer

Do requirements gathering before implementation

- Ask one question at a time and iterate until requirements are clear
- Build questions on previous responses
- Provide numbered response options for the user to select from

# Validating Assumptions via Tests

- Never submit code whose hypothesis is not captured by a test.
- Reduce risks from assumptions (no matter how sure you are) by **proving these assumptions with tests**.
  Do not throw away the produced tests after you did the validation, because they often serve as useful documentation of a behavior. Make sure their comments explain their purpose.
- **TDD by default.** Interfaces emerge from tests.
- When adding/updating tests, keep a brief "why this test matters" comment in the test so future iterations can better decide to modify/keep/remove.

## TDD Loop

1. **State a hypothesis** (behavior/API).
2. **Write a failing test** for it.
3. **Run tests** and **observe the failure** is for the expected reason.
4. **Implement the minimum** to pass (green).
5. **Refactor** with tests still green.
6. **Update the sidecar** with any changed assumptions, invariants, or examples.

## Test layout

- Unit specs: `*.test.js`
- Property-based specs: `*.property.test.js`
- Property-based tests are important, don't omit them for any components
- Keep tests deterministic and fast; avoid E2E unless asked
