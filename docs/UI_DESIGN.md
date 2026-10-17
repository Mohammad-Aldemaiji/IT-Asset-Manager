# Visual Design

## Goals

- **Clear over clever:** a calm, professional look suitable for an internal company tool.
- **Readable:** large enough text (16 px base), strong contrast, plenty of space between items.
- **Consistent:** every page has the same frame — menu on top, page title with actions on the right, content in white cards.

## Page layout

```
┌──────────────────────────────────────────────────────────────┐
│ ▣ IT Asset Manager        Dashboard  Assets  Add Asset  About │  ← dark menu bar
├──────────────────────────────────────────────────────────────┤
│ Page title                                      [ Action ]   │  ← PageHeader
│ Short description                                            │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │  Card content (table, form, details…)                    │ │  ← white cards
│ └──────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│              footer: "Part 1 – data kept in memory"          │
└──────────────────────────────────────────────────────────────┘
```

Content is limited to 1280 px wide and centred, so lines never get too long on big screens.

## Screens

| Screen | Main elements |
|---|---|
| Dashboard | 4 summary tiles · "By status" list · "By category" bars · warranties ending soon |
| Assets | Search box, category/status filters, sort control · result count · table with View / Edit / Delete |
| Asset details | Back link · name + brand/model · Edit and Delete buttons · 3-column grid of fields · notes |
| Add / Edit asset | Form split into four groups: General, Assignment, Purchase, Notes · Cancel and Save buttons |
| About | Description of the app · team table (#, name, student ID) |
| Not found | Message and a button back to safety |

## Colours

| Role | Light theme | Dark theme | Used for |
|---|---|---|---|
| Background | `#f4f6f9` | `#0f141c` | Page |
| Surface | `#ffffff` | `#171e29` | Cards, table, dialog |
| Text | `#1a2230` | `#e7ebf1` | Body text |
| Muted text | `#5b6678` | `#9ba6b8` | Labels, hints |
| Primary | `#1f5fbf` | `#5b9bff` | Links, main buttons, bars |
| Danger | `#c0352b` | `#ef6b61` | Delete, errors |
| Header | `#14213d` | `#0a0f16` | Menu bar |
| Focus ring | `#f5a524` | `#f5a524` | Keyboard focus |

The dark theme turns on automatically when the operating system is in dark mode
(`prefers-color-scheme`). All colours are CSS variables in `src/index.css`.

### Status badges

| Status | Colour | Meaning |
|---|---|---|
| In Use | blue | Assigned to someone |
| Available | green | Ready to be assigned |
| Under Repair | amber | Temporarily out of service |
| Retired | grey | No longer used |

Each badge always shows its text, so colour is never the only way to tell statuses apart.

## Typography

- System font stack (`system-ui`, Segoe UI, Roboto…) — fast, familiar and readable on every OS.
- Monospace for IDs and serial numbers so characters such as `0`/`O` are easy to tell apart.
- Sizes: page title 1.6 rem · section title 1.1 rem · body 1 rem · labels 0.9 rem.

## Responsive behaviour

| Width | Change |
|---|---|
| ≤ 900 px | Dashboard tiles 2 per row · search toolbar on 2 rows |
| ≤ 820 px | Dashboard and details grids become 1–2 columns |
| ≤ 760 px | Asset table becomes a stack of cards (label on the left, value on the right) |
| ≤ 720 px | Menu collapses behind a **Menu** button |
| ≤ 640 px | Form becomes one column |

## Interaction and accessibility

- Visible orange focus ring on every interactive element.
- Delete always asks first; the dialog focuses **Cancel**, closes with **Escape** or by clicking outside.
- Form errors: red border + message under the field, a summary alert at the top, and focus jumps to the first problem.
- Success messages appear in a green bar (`role="status"`, announced by screen readers) and can be dismissed.
- The result count ("Showing 3 of 10 assets") is announced as the user types.
- Empty states explain what happened and offer the next step ("Add the first asset").

Screenshots of every screen are in [`docs/screenshots`](screenshots) and in [FEATURES.md](FEATURES.md).
