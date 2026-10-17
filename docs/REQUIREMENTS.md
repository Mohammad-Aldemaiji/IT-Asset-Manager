# Requirements Specification

**Project:** IT Asset Manager — Part 1 (frontend)
**Asset type chosen:** IT equipment (computers and related devices)

## 1. Purpose

Companies own many IT devices and need to know what they have, who uses each device, where it is,
what it cost and when its warranty ends. This application gives IT staff a single place to record and
look up that information.

## 2. Scope of Part 1

- A React frontend only. The backend is written manually in Part 2.
- Data is a **collection of JavaScript objects held in memory** (no database, no browser storage).
  The app starts with 10 sample assets; changes last until the page is reloaded.
- One user at a time; no login (authentication arrives with the backend).

## 3. Users

| User | Goal |
|---|---|
| IT administrator | Register new equipment, update assignments and status, remove disposed items |
| Manager | See totals, value in service and warranties that need attention |

## 4. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | The app shows a menu on every page with links to Dashboard, Assets, Add Asset and About. The current page is highlighted. | Must |
| FR-2 | The user can **display** all assets in a table showing ID, name, brand/model, category, status, assigned person, department, purchase date and price. | Must |
| FR-3 | The user can open a **details** page that shows every field of one asset. | Must |
| FR-4 | The user can **add** an asset through a form. The app gives it a unique ID (`AST-0001` format). | Must |
| FR-5 | The user can **update** any field of an existing asset (except its ID). | Must |
| FR-6 | The user can **delete** an asset. The app asks for confirmation first. | Must |
| FR-7 | The user can **search** assets by ID, name, brand, model, serial number, assigned person, department or location. Search ignores letter case and leading/trailing spaces. | Must |
| FR-8 | The user can filter the list by category and by status, and combine filters with search. | Should |
| FR-9 | The user can sort the list by ID, name, category, status, purchase date or price, ascending or descending. | Should |
| FR-10 | The app validates input and shows a clear message next to each invalid field (rules in §6). Invalid data is never saved. | Must |
| FR-11 | After adding, editing or deleting, the app shows a success message. | Should |
| FR-12 | The **About** page lists each team member's name and student ID, and has its own menu item. | Must |
| FR-13 | The dashboard shows total assets, number in use, number available, value in service (excluding retired assets), counts by status and by category, and warranties ending within 90 days. | Should |
| FR-14 | Search and filter settings are kept in the URL, so Back returns to the same results and dashboard links open a pre-filtered list. | Could |
| FR-15 | Unknown pages and unknown asset IDs show a friendly "not found" message. | Should |

## 5. Data model — `Asset`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | auto | `AST-` + 4 digits. Created by the app, never reused, cannot be edited |
| `name` | string | yes | 2–80 characters |
| `category` | enum | yes | Laptop, Desktop, Monitor, Server, Printer, Phone, Tablet, Networking |
| `brand` | string | yes | up to 40 characters |
| `model` | string | no | up to 60 characters |
| `serialNumber` | string | yes | letters, numbers, dashes; stored in upper case; **unique** |
| `status` | enum | yes | In Use, Available, Under Repair, Retired |
| `assignedTo` | string | if *In Use* | person or team using it; cleared for other statuses |
| `department` | enum | yes | Engineering, Finance, Human Resources, IT, Marketing, Operations, Sales |
| `location` | string | no | up to 60 characters |
| `purchaseDate` | date (`YYYY-MM-DD`) | yes | real date, not in the future |
| `purchasePrice` | number (SAR) | yes | 0 to 10,000,000 |
| `warrantyExpiry` | date (`YYYY-MM-DD`) | no | not before the purchase date |
| `notes` | string | no | up to 500 characters |

## 6. Validation rules

All rules live in one file, `src/utils/validation.js`, and run before every add and update.

1. Text is trimmed before checking; text made only of spaces counts as empty.
2. Required fields must not be empty (see the table above).
3. Category, status and department must be one of the fixed values.
4. Serial number: only `A–Z`, `0–9` and `-`; must not match another asset's serial (case-insensitive).
5. *Assigned to* is required only when status is *In Use*.
6. Purchase date must be a real calendar date (e.g. 30 Feb is rejected) and not after today.
7. Price must be a number, not negative and not above 10,000,000.
8. Warranty expiry, if given, must be a real date on or after the purchase date.
9. Length limits are enforced both by the input (`maxLength`) and by validation.

## 7. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-1 **Usability** | Every form field has a visible label; errors appear next to the field; focus moves to the first error. |
| NFR-2 **Responsive** | Works from 360 px phone width to desktop. The menu collapses and the table becomes cards on small screens. |
| NFR-3 **Accessibility** | Semantic HTML, keyboard-operable, visible focus ring, ARIA for dialog/alerts/live results, colour is never the only signal. |
| NFR-4 **Performance** | Search updates as the user types with no noticeable delay for hundreds of assets. |
| NFR-5 **Security** | No raw HTML rendering; input is validated and length-limited; dependencies have no known vulnerabilities (`npm audit`). |
| NFR-6 **Maintainability** | Logic in plain, tested functions; one reusable form for add and edit; consistent naming; comments explain *why*. |
| NFR-7 **Testability** | Automated unit and integration tests run with one command (`npm test`). |
| NFR-8 **Readiness for Part 2** | Pages talk to data only through `useAssets()`, so a backend can replace the in-memory store without changing the pages. |

## 8. Out of scope for Part 1

Persistent storage, user accounts and roles, file attachments, import/export, audit history.
