# October Golf

A small, installable web app that shows which Maricopa County golf courses are open on any day in October 2026, based on the Arizona Golf Association overseed schedule.

## How availability is calculated

- A course with no planned overseed closure is shown as open.
- A course is unavailable beginning on its closure date.
- A course is shown as open again on its published reopening date.
- Records with non-date instructions such as “Contact Course” are not treated as confirmed open.

## Updating the annual schedule

1. Put the source workbook at `source/AZ-GOLF-2026-Overseed-Schedule.xlsx`.
2. Run `python scripts/build-data.py`.
3. Update the displayed year if needed, then commit the regenerated `data/courses.js`.

The deployed app is static and stores no personal data.
