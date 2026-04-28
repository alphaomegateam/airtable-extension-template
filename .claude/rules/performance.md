---
description: Performance optimization rules for Airtable Interface Extensions
trigger: always_on
---

# Performance Rules for Airtable Interface Extensions

Extensions are often embedded **multiple times** on a single Interface page, and each
`useRecords(table)` subscription fires on **any** cell edit in the table — there is no field-level
filter. Every record update re-renders every instance. All performance work happens inside the
render path.

## The `React.memo` + Airtable `Record` Footgun

**Never wrap a component in `React.memo` if it accepts an Airtable `Record` (or
`readonly Record[]`) as a prop and reads cell values from it.**

`Record` instances are mutated in place — their reference stays the same when cell values change.
`memo`'s shallow compare returns `true`, the child skips its re-render, and the UI shows stale
values forever (remounting the parent does not help — the stale cache lives on the `Record`).

### The rule

- **Components that read cell values from a `Record` prop:** plain function components, no `memo`.
- **Leaf components with primitive props** (string, number, boolean, …): wrap in `memo`. Primitive
  equality lines up with React's reference model.
- If a `Record`-reading component is genuinely expensive and needs `memo`, extract its cell values
  in the parent via `useMemo` — include the parent's `useRecords()` array in the deps so the memo
  recomputes on every Airtable tick — and pass primitives down.

```tsx
// ❌ BUG — memo bails when `record` is reference-stable but its cells changed
export const POHeader = memo(function POHeader({record}: {record: AirtableRecord}) {
    return <div>{record.getCellValueAsString(statusField)}</div>;
});

// ✅ Drop memo on the Record-reading container
export function POHeader({record}: {record: AirtableRecord}) {
    return <StatusBadge status={record.getCellValueAsString(statusField)} />;
}

// ✅ Or extract primitives upstream and memo the leaf
const status = useMemo(
    () => selectedPO?.getCellValueAsString(statusField),
    [selectedPO, statusField, allPOs], // allPOs ref changes on every Airtable tick
);
return <POHeader status={status} />; // POHeader is memo'd, takes a string
```

## Other Required Patterns

### Memoize derived arrays and objects passed as props or hook deps

New array/object literals get a fresh reference every render and invalidate downstream `useMemo`
and `memo` checks.

```tsx
// BAD: new reference every render
const selectedTypes = [type1, type2, type3].filter(Boolean);

// GOOD
const selectedTypes = useMemo(
    () => [type1, type2, type3].filter(Boolean),
    [type1, type2, type3],
);
```

### Define components at module scope, never inside another render

A component defined inside a parent's render body has a new identity each render — React
unmounts and remounts the entire subtree.

### Memoize expensive computations over the record set

```tsx
const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.name.localeCompare(b.name)),
    [users, sortField, sortDirection],
);
```

When the loop is hot: use `Set` for O(1) lookups, hoist loop-invariant values out of the loop,
and combine passes instead of chaining `filter`/`map`/`reduce`.

### Stabilize callbacks passed to memo'd children

```tsx
const handleSort = useCallback((field: SortField) => { /* … */ }, []);
```

### Pure helpers belong at module scope

If a function doesn't use hooks or component state, move it outside the component so it isn't
recreated each render.
