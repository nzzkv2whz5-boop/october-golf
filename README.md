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

## Course phone numbers

`data/facilities.json` is the persistent contact directory. Keys normally match the
schedule's facility name; a key in the form `Facility — Course` overrides the
facility number for a particular course. Each entry includes the number and a
source URL for future review. An optional `extension` field supports clubs with
separate golf shops on one main number. The initial pass used club/operator websites where
available and the February/March 2026 *Desert Golf & Tennis* Phoenix directory
for many other facilities. Numbers may change, so review them periodically.

The build script joins these contacts to the annual schedule and writes them into
`data/courses.js`. The app reads the generated file locally and does no live phone
lookup. A missing number leaves the contact link out of the listing. Paradise
Peak West uses its community office number because the private course does not
publish a separate golf shop number.
