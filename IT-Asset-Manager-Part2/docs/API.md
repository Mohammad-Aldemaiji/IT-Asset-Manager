# REST API contract

All routes return JSON except a successful DELETE. IDs are public strings such as AST-0001. Write requests must omit id. Dates use YYYY-MM-DD, prices are JSON numbers in SAR, and an omitted warranty uses null. PUT requires all required editable fields.

| Method | Route | Input | Success response |
|---|---|---|---|
| POST | /api/assets | Asset write JSON | 201, saved asset, Location header |
| GET | /api/assets/{id} | Exact public ID | 200, one full asset |
| GET | /api/assets | Query parameters below | 200, paginated response |
| PUT | /api/assets/{id} | Exact ID and asset write JSON | 200, updated full asset |
| DELETE | /api/assets/{id} | Exact public ID | 204, empty body |
| GET | /api/assets/stats | None | 200, complete dashboard statistics |

## Pagination and search

GET /api/assets?page=0&size=5&sort=id,asc&q=dell

| Parameter | Default | Accepted values |
|---|---|---|
| page | 0 | Zero-based integer 0 to 1000000 |
| size | 5 | Integer 1 to 100 |
| sort | id,asc | id, name, category, status, purchaseDate or purchasePrice followed by asc or desc |
| q | empty | Up to 200 characters, trimmed, case-insensitive |
| category | empty | One of the fixed category values |
| status | empty | One of the fixed status values |

Search covers name, brand, model, serialNumber, assignedTo, department and location. A complete AST ID is also matched. Percent signs and underscores are literal search characters, not wildcard controls. Category and status filters are combined with search. Filtering and sorting run in the database before the requested page is selected. Non-ID sorting adds the internal numeric ID as a deterministic tie-breaker.

~~~json
{
  "content": [],
  "page": 0,
  "size": 5,
  "totalElements": 0,
  "totalPages": 0
}
~~~

For non-empty results, content contains full asset objects. A page beyond the last page has empty content. The React list adjusts back to the last existing page after deletions. Empty lists have totalPages=0 and show Page 0 of 0.

## Create or update example

~~~json
{
  "name": "Demo Laptop",
  "category": "Laptop",
  "brand": "Dell",
  "model": "Latitude",
  "serialNumber": "DEMO-001",
  "status": "Available",
  "assignedTo": "",
  "department": "IT",
  "location": "Lab",
  "purchaseDate": "2025-01-15",
  "purchasePrice": 3500,
  "warrantyExpiry": null,
  "notes": "Presentation device"
}
~~~

The successful response contains these fields plus a server-generated id. Optional text is normalized to empty strings. Serial numbers are uppercase. assignedTo is cleared unless status is In Use. Invalid choice values are rejected.

## Errors

| Status | Meaning |
|---|---|
| 400 | Invalid JSON, unknown JSON field, invalid date/price, missing required field, bad filter or pagination |
| 404 | Missing asset or malformed public asset ID |
| 409 | Duplicate serial or conflicting database write |

~~~json
{
  "message": "Duplicate serial number.",
  "errors": {
    "serialNumber": "Another asset already has this serial number."
  }
}
~~~

The errors map associates server errors with form controls. Network errors are created by the HTTP client and use status 0. The frontend never treats a failed request as a successful mutation.

## Statistics

GET /api/assets/stats returns total, byStatus, byCategory, activeValue and expiringSoon. activeValue excludes Retired assets. expiringSoon includes non-retired assets with a warranty ending today through 90 days ahead, sorted by expiry then ID. Each item contains id, name, warrantyExpiry and daysLeft. Business dates for this calculation use Asia/Riyadh through an injectable Clock.
