# Use of AI

As required by the assignment, an AI tool was used to specify the requirements, design the interface,
write the frontend code, generate the documentation, generate and run the tests, and review the code.
The backend (Part 2) will be written manually.

**AI tool:** Claude, by Anthropic (agentic mode, able to create files and run commands).

## What the AI produced

| Task | Output |
|---|---|
| Specify requirements | [REQUIREMENTS.md](REQUIREMENTS.md): functional/non-functional requirements, data model, validation rules |
| Visual design | [UI_DESIGN.md](UI_DESIGN.md) and `src/index.css`: layout, colours, typography, responsive rules |
| Code the frontend | Everything in `src/` |
| Documentation | [ARCHITECTURE.md](ARCHITECTURE.md), [TECH_STACK.md](TECH_STACK.md), [FEATURES.md](FEATURES.md), `README.md` |
| Generate and run tests | `tests/` (70 tests) and the results in [TESTING.md](TESTING.md) |
| Code review | [CODE_REVIEW.md](CODE_REVIEW.md) — security, performance, quality, reuse |

## Process

1. **Requirements.** The assignment text (Part 1) was given to the AI. It chose *IT equipment* as the
   asset type, listed the features needed to satisfy the four requirements, and defined the data model
   and validation rules.
2. **Design.** The AI defined the page layout, colour palette (light and dark), status colours and
   responsive behaviour before writing code.
3. **Implementation.** The AI scaffolded the project with Vite, then wrote the data layer
   (seed data, reducer, provider), the business logic (validation, search, statistics), the shared
   components and finally the pages.
4. **Testing.** The AI wrote unit tests for the logic and integration tests that click through the
   app, ran them with `npm test`, and fixed one failing assertion (a non-breaking space produced by
   `Intl.NumberFormat`).
5. **Browser check.** The AI built the app, opened every page in a headless Chromium browser at desktop
   and phone sizes, read the screenshots and fixed layout problems it found (cramped table columns on
   desktop, a broken name cell in the phone layout).
6. **Code review.** The AI reviewed the code, ran `npm audit` and the linter, fixed 7 issues (listed in
   CODE_REVIEW.md) and re-ran all tests afterwards.

## Example prompts

> "Read the Part 1 project description. Build a React frontend that manages one kind of company asset,
> with a menu, add / remove / update / search / display, and an About page with our names and student IDs.
> Keep the data as a collection of objects, not a database. Make the code readable."

> "Generate documentation describing the architecture, the technology stack and the features."

> "Generate unit and integration tests, run them, and report the results with coverage."

> "Review the code for security, performance, code quality and code reuse. Fix what is worth fixing
> and document everything."

## Human responsibilities

- Choosing to accept the AI's choice of asset type and design.
- Filling in the team members' names and student IDs (`src/data/team.js`).
- Checking the running app and the documents before submission.
- Writing the backend manually in Part 2.
