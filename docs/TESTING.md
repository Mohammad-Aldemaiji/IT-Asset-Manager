# Testing

## How to run

```bash
npm test            # run all tests once
npm run test:watch  # re-run on every change
npm run coverage    # run tests + coverage report (HTML report in coverage/)
```

## Strategy

| Level | What is tested | Tools | Files |
|---|---|---|---|
| **Unit** | Plain functions: validation rules, search/filter/sort, reducer, IDs, dates, formatting, dashboard statistics | Vitest | `tests/unit/*.test.js` |
| **Integration** | The whole app rendered in a simulated browser; a "user" clicks the menu, types in forms, confirms dialogs | Vitest + React Testing Library + user-event + jsdom | `tests/integration/*.test.jsx` |

Principles:

- **Test what the user sees.** Integration tests find elements by their role and label
  (`getByRole('button', { name: 'Delete' })`), not by CSS classes — which also checks accessibility.
- **Every test starts clean.** `renderApp()` in `tests/testUtils.jsx` creates a fresh `AssetProvider`
  with its own copy of the data, so tests never affect each other.
- **No dependence on today's date.** Date-based rules receive a fixed "today" (`2026-10-17`), and the
  dashboard test freezes the clock.
- **Edge cases included:** empty list, leap years, impossible dates, whitespace-only input, duplicate
  serials in different letter case, deleting the highest ID, unknown routes.

## Latest results

```
 Test Files  6 passed (6)
      Tests  70 passed (70)
```

| File | Tests | Result |
|---|---:|---|
| `tests/unit/validation.test.js` | 16 | ✅ all passed |
| `tests/unit/filterAssets.test.js` | 7 | ✅ all passed |
| `tests/unit/assetReducer.test.js` | 9 | ✅ all passed |
| `tests/unit/helpers.test.js` | 10 | ✅ all passed |
| `tests/integration/assets.test.jsx` | 22 | ✅ all passed |
| `tests/integration/navigation.test.jsx` | 6 | ✅ all passed |
| **Total** | **70** | **✅ 70 passed, 0 failed** |

### Coverage

```
File               | % Stmts | % Branch | % Funcs | % Lines
All files          |   94.76 |    89.12 |   95.23 |   97.59
 src/components    |   95.31 |    91.83 |   93.33 |   98.14
 src/context       |   95.12 |    86.66 |     100 |   97.22
 src/pages         |   93.61 |    82.22 |   94.44 |   97.67
 src/utils         |   95.58 |    90.76 |     100 |   98.11
```

The only file below 85 % lines is `App.jsx`, whose uncovered line is the `<BrowserRouter>` wrapper
(tests use `<MemoryRouter>` instead, around the same `AppRoutes`).

## Requirement → test mapping

| Requirement | Tests that prove it |
|---|---|
| Menu navigates between features | *shows a menu with every feature*, *opens each page from the menu and highlights the current item*, *opens and closes the mobile menu* |
| Display assets | *lists every asset in a table*, *shows all details of one asset*, *shows a message and a button when there are no assets at all* |
| Search | *filters the table while typing*, *combines search with the category and status filters*, *reads filters from the URL*, *says when nothing matches and can clear the filters*, *sorts by the chosen column and direction*, plus 7 unit tests of `filterAssets` |
| Add | *adds a valid asset and opens its details page*, *shows errors and does not save when required fields are empty*, *refuses a serial number that is already used*, *asks who uses the asset only when the status is In Use*, *goes back to the list when Cancel is clicked* |
| Update | *edits an asset and shows the new values*, *does not save invalid changes*, *opens the edit form from the list* |
| Remove | *asks for confirmation, and Cancel keeps the asset*, *closes the confirmation with the Escape key*, *removes the asset from the list after confirming*, *deletes from the details page and returns to the list* |
| About page with team | *About page lists every team member with name and student ID* |
| Validation rules | 16 unit tests in `validation.test.js` |

## Full list of tests

### Integration — `assets.test.jsx`

**Display assets**
- ✅ lists every asset in a table
- ✅ shows all details of one asset
- ✅ shows a message and a button when there are no assets at all

**Search assets**
- ✅ filters the table while typing
- ✅ combines search with the category and status filters
- ✅ reads filters from the URL (links from the dashboard)
- ✅ says when nothing matches and can clear the filters
- ✅ sorts by the chosen column and direction

**Add assets**
- ✅ adds a valid asset and opens its details page
- ✅ shows errors and does not save when required fields are empty
- ✅ refuses a serial number that is already used
- ✅ asks who uses the asset only when the status is In Use
- ✅ goes back to the list when Cancel is clicked

**Update assets**
- ✅ edits an asset and shows the new values
- ✅ does not save invalid changes
- ✅ opens the edit form from the list

**Delete assets**
- ✅ asks for confirmation, and Cancel keeps the asset
- ✅ closes the confirmation with the Escape key
- ✅ removes the asset from the list after confirming
- ✅ deletes from the details page and returns to the list

**Dashboard**
- ✅ shows totals and warranties that end soon
- ✅ updates its numbers after an asset is deleted

### Integration — `navigation.test.jsx`

- ✅ shows a menu with every feature
- ✅ opens each page from the menu and highlights the current item
- ✅ About page lists every team member with name and student ID
- ✅ opens and closes the mobile menu
- ✅ shows a "page not found" message for unknown URLs
- ✅ shows "asset not found" for an ID that does not exist

### Unit — `validation.test.js`

- ✅ accepts a complete, valid asset
- ✅ requires name, brand, serial number, purchase date and price
- ✅ treats text made only of spaces as empty
- ✅ rejects a name shorter than 2 or longer than 80 characters
- ✅ only allows categories, statuses and departments from the lists
- ✅ rejects serial numbers with unsafe characters
- ✅ rejects a serial number that another asset already uses (any letter case)
- ✅ lets an asset keep its own serial number when it is edited
- ✅ requires "Assigned to" only when the status is In Use
- ✅ rejects purchase dates in the future and impossible dates
- ✅ rejects negative, non-numeric and huge prices but allows 0
- ✅ makes warranty optional but not earlier than the purchase date
- ✅ limits the length of notes
- ✅ does not crash when fields are missing
- ✅ normalizeAsset: trims text, upper-cases the serial number and converts the price to a number
- ✅ normalizeAsset: clears "Assigned to" when the asset is not In Use

### Unit — `filterAssets.test.js`

- ✅ returns every asset, sorted by ID, when no options are given
- ✅ does not modify the original array
- ✅ searches several fields, ignoring letter case and extra spaces
- ✅ filters by category and by status, together with search
- ✅ returns an empty list when nothing matches
- ✅ sorts numbers numerically in both directions
- ✅ sorts dates and text alphabetically

### Unit — `assetReducer.test.js`

- ✅ formats numbers as AST-0000
- ✅ starts after the highest existing number
- ✅ adds an asset and moves the ID counter forward
- ✅ updates only the asset with the matching ID
- ✅ deletes the asset with the matching ID
- ✅ never re-uses the ID of a deleted asset
- ✅ does not change the previous state object
- ✅ starts the ID counter at 1 for an empty list
- ✅ throws on an unknown action so mistakes are caught early

### Unit — `helpers.test.js`

- ✅ formats today as YYYY-MM-DD in local time
- ✅ checks for real calendar dates
- ✅ counts days between two dates
- ✅ formats prices in Saudi riyals
- ✅ formats dates in a readable way
- ✅ shows a dash for empty text
- ✅ computeStats: counts assets by status and category
- ✅ computeStats: adds up total value and value excluding retired assets
- ✅ computeStats: lists warranties ending within 90 days, soonest first
- ✅ computeStats: handles an empty list

## Manual checks in a real browser

In addition to the automated tests, the production build (`npm run build && npm run preview`) was
checked in Chromium at desktop (1280 px) and phone (390 px) widths, in light and dark mode:
add → edit → search → delete → reload, with **no console errors**. Screenshots are in
[`docs/screenshots`](screenshots).
