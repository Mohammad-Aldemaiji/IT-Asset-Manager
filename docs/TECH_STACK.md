# Technology Stack

Versions are the exact ones installed (see `package-lock.json`).

## Runtime (shipped to the browser)

| Technology | Version | Role | Why it was chosen |
|---|---|---|---|
| [React](https://react.dev/) | 19.3 | UI library | Required by the assignment; component model fits a multi-page CRUD app |
| [React DOM](https://react.dev/reference/react-dom) | 19.3 | Renders React into the page | Standard companion of React |
| [React Router](https://reactrouter.com/) (`react-router-dom`) | 7.18 | Page navigation (menu, URLs, back button) | The standard router for React; URL search params keep filters shareable |

No other runtime libraries are used. Styling is plain CSS and state uses React's own Context and
`useReducer`, which keeps the bundle small (≈ 91 KB gzipped JavaScript) and the code easy to follow.

## Built-in browser features used

| Feature | Used for |
|---|---|
| `Intl.NumberFormat` | Prices in Saudi riyals (`SAR 8,499.00`) |
| `Date.toLocaleDateString` | Readable dates (`12 Feb 2024`) |
| CSS custom properties | Light and dark colour themes |
| CSS Grid / Flexbox + media queries | Responsive layout |
| `prefers-color-scheme` | Automatic dark mode |

## Development tools

| Tool | Version | Role |
|---|---|---|
| [Vite](https://vite.dev/) | 8.3 | Dev server with hot reload, production build |
| [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | 6.1 | JSX and Fast Refresh for Vite |
| [Vitest](https://vitest.dev/) | 5.0 | Test runner (same config as Vite) |
| [@vitest/coverage-v8](https://vitest.dev/guide/coverage) | 5.0 | Code coverage report |
| [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | 16.3 | Render components and query them like a user would |
| [user-event](https://testing-library.com/docs/user-event/intro) | 14.6 | Realistic typing and clicking in tests |
| [jest-dom](https://github.com/testing-library/jest-dom) | 7.0 | Readable assertions such as `toBeInTheDocument()` |
| [jsdom](https://github.com/jsdom/jsdom) | 29.1 | Browser-like environment for tests in Node |
| [oxlint](https://oxc.rs/docs/guide/usage/linter) | 1.x | Fast linter (catches bugs and React mistakes) |
| [Node.js](https://nodejs.org/) | ≥ 22.13 | Runs the tools above |
| Git + GitHub | — | Version control and public repository |

## AI tool

| Tool | Used for |
|---|---|
| Claude (Anthropic) | Requirements, visual design, code, documentation, tests and code review — see [AI_USAGE.md](AI_USAGE.md) |

## Language and conventions

- JavaScript (ES2022+) with JSX, ES modules.
- Function components and hooks only (no class components).
- File names: `PascalCase.jsx` for components, `camelCase.js` for plain modules.
- Each file starts with a short comment explaining its purpose.
