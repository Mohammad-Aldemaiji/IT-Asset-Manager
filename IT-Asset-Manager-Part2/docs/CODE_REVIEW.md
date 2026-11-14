# Part 2 code review

## Correctness improvements

- Server IDs replace browser counters. Separate request/response records prevent client ID changes.
- Backend validation protects direct API calls. Unique serial constraints handle racing writes.
- Search, filters and sort run before database pagination. Stable ID tie-breakers avoid inconsistent ordering.
- Forms await writes and guard repeat submission. No success notice is emitted on failed writes.
- Detail and edit pages fetch their own asset, avoiding dependence on previously loaded pages.
- The query hook ignores obsolete replies. Pagination is corrected after deleting the last row on a final page.
- Dashboard statistics use the whole dataset and a testable business clock.
- Production route forwarding excludes dotted filenames, preventing JavaScript requests from receiving index.html.
- The default H2 file URL sets WRITE_DELAY=0 so an immediate process termination after a committed response does not discard the recent write during H2's usual delay.

## Security and practical limits

JPA binds query values, search wildcard characters are escaped, allowed sort fields are explicitly listed, and page sizes are capped at 100. React renders values as text. Errors avoid exposing SQL text in HTTP responses. H2's web console is disabled. Development uses a proxy instead of a permissive cross-origin policy. The prepared Windows launcher binds the server to localhost.

The app intentionally has no authentication, authorization, audit trail, rate limits or optimistic locking. It is suitable for the local course demo, not for exposing real company asset data publicly. Simultaneous edits use last-write-wins behavior. H2 schema updates use ddl-auto=update for convenience; a production system should use migrations, a managed database and backups. The statistics service reads all rows and should use aggregate SQL for large datasets. Very large requested offsets can still be expensive despite bounds. General search sends requests while typing without debounce, while obsolete replies are ignored.

The database uses file storage, but startup sample seeding runs whenever the table is empty if APP_SEED=true. Disable seeding for an intentionally empty database. A source build needs internet access once to retrieve dependencies; the prepared Windows runtime demo works offline.

Local npm dependency installation reported zero known audit findings at verification time. No claim is made that a comprehensive security audit or production penetration test was performed.
