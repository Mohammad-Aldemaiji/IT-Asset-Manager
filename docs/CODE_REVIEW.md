# AI Code Review

**Reviewer:** Claude (Anthropic), AI code review
**Scope:** all files in `src/` and `tests/` (≈ 1,600 lines of application code)
**Areas:** security · performance · code quality · code reuse · accessibility
**Tools run during the review:** `npm audit`, `oxlint`, `vitest --coverage`, production build checked in Chromium

## Summary

| Area | Verdict |
|---|---|
| Security | ✅ Good — 0 known vulnerabilities after the fix below; no unsafe HTML; strict input validation |
| Performance | ✅ Good for the expected size (hundreds of assets); notes for very large lists |
| Code quality | ✅ Good — lint clean, 70 passing tests, ≈ 95 % statement coverage, clear structure |
| Code reuse | ✅ Good — shared form, dialog, table, header; one source of truth for rules and options |
| Accessibility | ✅ Good — labelled fields, keyboard support, ARIA roles, visible focus |

**Issues found:** 9 — **fixed:** 7 — **accepted for Part 1 (with reason):** 2. Further suggestions are listed at the end.

## Findings

Severity: 🔴 High · 🟠 Medium · 🟡 Low

### Fixed during the review

| # | Area | Severity | Finding | Fix |
|---|---|---|---|---|
| 1 | Security | 🟠 | `npm audit` reported 2 moderate advisories in `react-router-dom` 6.30 ([GHSA-wrjc-x8rr-h8h6](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) open redirect via backslash in `<Link>`/`useNavigate`; [GHSA-337j-9hxr-rhxg](https://github.com/advisories/GHSA-337j-9hxr-rhxg), SSR-only). | Upgraded to `react-router-dom` 7.18.4. `npm audit` now reports **0 vulnerabilities**; all 70 tests still pass. |
| 2 | Quality / data integrity | 🟠 | New IDs were computed as "highest ID + 1", so deleting the newest asset and adding another re-used its ID — dangerous once a backend or history exists. | The reducer keeps a `nextId` counter that only increases. Covered by the test *never re-uses the ID of a deleted asset*. |
| 3 | Quality / a11y | 🟡 | `ConfirmDialog` moved focus back to *Cancel* on every parent re-render (the effect depended on `onCancel`, a new function each render). | Split into two effects: focus once on open; Escape listener re-binds separately. |
| 4 | Quality / a11y | 🟡 | On the details page the *Notes* `<dt>/<dd>` pair was outside the `<dl>` — invalid HTML that confuses screen readers. | Moved inside the `<dl>`. |
| 5 | Quality / a11y | 🟡 | After a failed submit, focus went to the first error in *validation* order (e.g. *Brand* before *Category*), not screen order. | `FIELD_ORDER` list in `AssetForm` matches the on-screen order. |
| 6 | Code reuse | 🟡 | The asset list used its own local success message after delete, while other pages used the shared `Notice` — two ways to do the same thing. | The list now uses `Notice` too (navigation state with `replace`), keeping the current filters. |
| 7 | Quality | 🟡 | `resetAssets` / `RESET` action was exported but never used by the UI (dead code). | Removed. |

### Accepted for Part 1

| # | Area | Severity | Finding | Reason |
|---|---|---|---|---|
| 8 | Data | 🟡 | All changes are lost on page reload. | Required by the assignment: Part 1 data is "a collection of objects (not stored in a database)". Part 2 adds the backend. |
| 9 | Security | 🟡 | No authentication or authorisation; anyone who opens the app can edit data. | There is no server in Part 1, so there is nothing to protect yet. Must be handled on the backend in Part 2 — client-side checks alone are never enough. |

## 1. Security review

| Check | Result |
|---|---|
| Cross-site scripting (XSS) | ✅ No `dangerouslySetInnerHTML`, `innerHTML`, `eval` or `new Function`. All user text is rendered through JSX, which escapes it. A test confirms `<script>` is rejected as a serial number. |
| Input validation | ✅ One central `validateAsset()` runs inside the provider for every add/update, so the UI cannot bypass it. Whitelists for category/status/department; regex whitelist for serials; numeric range for price; real-date checks. |
| Length limits | ✅ `maxLength` on inputs **and** checked again in validation (inputs can be bypassed with dev tools). |
| URL parameters | ✅ `sort` is checked against a whitelist; `dir` only accepts `asc`/`desc`; unknown filter values simply match nothing. Values in links are encoded with `encodeURIComponent`. |
| Route parameters | ✅ `:id` is only used to look up an asset; unknown IDs show "Asset not found". |
| Dependencies | ✅ `npm audit`: 0 vulnerabilities (after fix #1). Only 3 runtime dependencies (React, React DOM, React Router). |
| Secrets | ✅ No API keys, tokens or passwords in the code. |
| External resources | ✅ No third-party scripts, fonts or trackers are loaded. |

**For Part 2:** repeat every validation rule on the server (reuse `validation.js`), use parameterised
queries, add authentication, and send a Content-Security-Policy header.

## 2. Performance review

| Check | Result |
|---|---|
| Re-computing the filtered list | ✅ `filterAssets` runs inside `useMemo` and only re-runs when the data or a filter changes. |
| Dashboard statistics | ✅ `computeStats` in `useMemo`; a single pass over the assets. |
| Context re-renders | ✅ Provider functions wrapped in `useCallback` and the value in `useMemo`, so consumers only re-render when assets actually change. |
| Bundle size | ✅ ≈ 290 KB raw / **≈ 91 KB gzipped** JS, 11 KB CSS. No UI framework or utility library. |
| List keys | ✅ Stable keys (`asset.id`) everywhere — no array indexes for dynamic lists. |
| Algorithmic cost | ✅ Search is O(n × fields) per keystroke — instant for hundreds of items. |

**Suggestions if the data grows to thousands of assets (Part 2):** move search, sort and paging to the
server; debounce the search box (~250 ms); paginate or virtualise the table; split pages with
`React.lazy`.

## 3. Code quality review

| Check | Result |
|---|---|
| Linting | ✅ `oxlint src tests` — 0 warnings, 0 errors. |
| Tests | ✅ 70 tests, all passing; ≈ 95 % statements / 98 % lines covered. |
| Structure | ✅ Clear layers: pages → components → context → utils → data. Business logic has no React imports. |
| Pure functions | ✅ Reducer, validation, filtering and statistics are pure and never mutate inputs (tested). |
| Naming | ✅ Descriptive names (`validateAsset`, `filterAssets`, `computeStats`, `AssetNotFound`). |
| Comments | ✅ Each file starts with its purpose; comments explain *why* (e.g. why IDs are never reused). |
| Error handling | ✅ Operations return `{ ok, errors }` instead of throwing; `useAssets()` throws a clear message if used outside its provider; the reducer throws on unknown actions. |
| Magic values | ✅ Lists, limits and the 90-day warning window are named constants. |
| Dates | ✅ Stored as `YYYY-MM-DD` and compared as strings; day counts use UTC to avoid daylight-saving errors. |

## 4. Code reuse review

| Reused piece | Used by |
|---|---|
| `AssetForm` | Add **and** Edit pages (one form, two uses) |
| `ConfirmDialog` | Asset list **and** details page |
| `Notice` | Asset list **and** details page (after add, edit, delete) |
| `PageHeader`, `StatusBadge` | Every page / table / dashboard |
| `AssetNotFound` | Details **and** Edit pages |
| `validateAsset` | Single source of truth for all rules (and ready to reuse on the server) |
| `assetOptions.js` | Same lists feed the form, filters, validation and dashboard |
| `format.js` | All currency and date display |

**Remaining duplication (minor):** the "confirm then delete" flow appears in both the list and the
details page (~10 lines each). It could become a `useDeleteAsset()` hook if a third place needs it.

## 5. Accessibility review

✅ Every input has a `<label>`; errors are linked with `aria-describedby` and fields get
`aria-invalid` · ✅ dialog uses `role="dialog"`, `aria-modal`, labelled title, Escape to close ·
✅ success messages use `role="status"`, form summary uses `role="alert"`, result count is
`aria-live` · ✅ the menu toggle has `aria-expanded`/`aria-controls` · ✅ visible focus ring ·
✅ status badges always include text, not only colour · ✅ tables use `<th scope="col">`.

## Further suggestions (not defects)

1. Add a "Restore sample data" button for demos (data resets on reload anyway).
2. Show the number of days a warranty has been expired on the details page.
3. Add a CSV export of the filtered list.
4. When Part 2 adds a server, show loading and error states for each request.
