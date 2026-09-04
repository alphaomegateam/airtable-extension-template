# Date Handling Rules

Every date bug found in these extensions so far has been the same bug: a value
parsed in one timezone and compared in another. It has shipped three separate
times. Read this before writing any date comparison.

## The trap

A date-only ISO string is parsed as **UTC midnight**, per the ECMAScript spec:

```ts
new Date('2026-09-01')   // 2026-09-01T00:00:00Z
```

For a viewer at a negative UTC offset (all of the US), that instant is
**August 31** in local time. So this silently misfiles every date on the 1st of
a month:

```ts
const date = new Date(dateStr);        // UTC midnight
date.getMonth();                        // LOCAL month — off by one
```

Nothing throws. Totals stay plausible; they are attributed to the wrong month.
Viewers at positive UTC offsets see the opposite skew, so two people can
disagree about the same number.

## Which accessor produced the string decides everything

| Accessor | Field type | Returns | Parses as |
|---|---|---|---|
| `getCellValue` | `date` | `"2026-09-01"` | **UTC** midnight |
| `getCellValue` | `dateTime` | `"2026-09-01T14:30:00.000Z"` | a real instant — unambiguous |
| `getCellValueAsString` | either | `"9/1/2026"` (per the field's display format) | **local** midnight |

`getCellValueAsString` returns the field's *display* format. It is local **only
because** the field is configured that way — someone switching a field to ISO
format in the Airtable UI silently converts it into the UTC case, with no code
change and no error. Do not rely on it.

## The rule

**Parse with `parseLocalDate` from `frontend/utils/weekUtils.ts` and compare
with local getters.** Read date fields with `getCellValue` (a stable ISO string),
never `getCellValueAsString` (a display format that can change under you).

```ts
import {parseLocalDate} from './utils/weekUtils';

const raw = record.getCellValue(dateField) as string | null;
const date = raw ? parseLocalDate(raw) : null;   // local midnight
if (date && date.getMonth() === selectedMonth) { /* ... */ }
```

`parseLocalDate` handles both date-only strings and full ISO timestamps.

Comparing entirely in UTC (`getUTCMonth`, `setUTCHours`) is also correct, and two
extensions do it that way. It is only correct as long as *every* value reaching
the comparison is date-only — one `dateTime` field reintroduces the skew. Prefer
local; if you do go all-UTC, make it consistent across the whole module.

## Never mix

The failure is always a mix. Check both sides of every comparison:

- a UTC-parsed record value against a local-built boundary
  (`new Date(y, m, 1)`), or
- a local-parsed value against a UTC-built boundary (`setUTCHours(0,0,0,0)`)

Boundaries built from `new Date(y, m, d)` or `.setHours()` are **local**.
Boundaries built from `.setUTCDate()` / `.setUTCHours()` are **UTC**.

## Verifying

Set `TZ` and check the month boundary in both directions — a positive-offset
timezone will not reveal the bug:

```bash
TZ=America/Chicago node -e 'console.log(new Date("2026-09-01").getMonth())'  # 7 = August, wrong
TZ=Asia/Kuwait     node -e 'console.log(new Date("2026-09-01").getMonth())'  # 8 = September, right
```

Always test the **1st of a month** and **January 1** (which misfiles the year,
and can drop a row out of a year dropdown entirely).
