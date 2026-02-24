---
description: Performance optimization rules for Airtable Interface Extensions
trigger: always_on
---

# Performance Rules for Airtable Interface Extensions

Extensions are often embedded **multiple times** on a single Airtable Interface page. Each instance
runs its own React tree. These rules prevent the N-instance multiplier from causing slow renders.

## Critical Constraint: `useRecords()` Has No Field Filtering

The Interface Extensions SDK `useRecords(table)` accepts only a `Table` argument — no `fields`
option. Every widget instance subscribes to **all** record changes across **all** columns in each
table it reads. This means:

- Any cell edit in the table triggers a re-render in every instance
- You cannot reduce the subscription surface at the data layer
- **All performance gains must come from minimizing what happens during re-renders**

## Required Patterns

### 1. Wrap all leaf/child components with `React.memo`

Every component that receives props from a parent must be wrapped in `memo()`. This prevents
cascade re-renders when Airtable pushes a record update.

```tsx
import {memo} from 'react';

export const MyComponent = memo(function MyComponent({data, label}: Props) {
    return <div>{label}: {data.count}</div>;
});
```

### 2. Memoize all derived arrays and objects

Arrays and objects created during render get new references every time, which invalidates
`useMemo` dependency arrays in child hooks and causes full recomputation.

```tsx
// BAD: new array reference every render — invalidates any downstream useMemo
const selectedTypes = [type1, type2, type3].filter(Boolean);

// GOOD: stable reference when underlying values haven't changed
const selectedTypes = useMemo(
    () => [type1, type2, type3].filter(Boolean),
    [type1, type2, type3]
);
```

This is especially critical for arrays/objects passed to `useActivityData` or similar data hooks,
where an unstable reference forces the entire data processing pipeline to re-run.

### 3. Extract sub-components outside the render function

Components defined inside a parent's render body get new identities every render, defeating
React's reconciliation (the entire subtree unmounts and remounts).

```tsx
// BAD: new component identity every render
function ParentComponent() {
    const StatusBadge = ({status}: {status: string}) => (
        <span>{status}</span>
    );
    return <StatusBadge status="active" />;
}

// GOOD: stable component identity
function StatusBadge({status}: {status: string}) {
    return <span>{status}</span>;
}

function ParentComponent() {
    return <StatusBadge status="active" />;
}
```

### 4. Memoize expensive computations (sorting, filtering, aggregation)

Any operation that processes the full record set must be inside `useMemo` with a precise
dependency array.

```tsx
const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.name.localeCompare(b.name));
}, [users, sortField, sortDirection]);
```

### 5. Stabilize callbacks with `useCallback`

Event handlers passed as props should use `useCallback` to maintain stable references. This works
in tandem with `React.memo` on child components.

```tsx
const handleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
        if (prev === field) {
            setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
            return prev;
        }
        setSortDirection('asc');
        return field;
    });
}, []);
```

### 6. Call all hooks before any early returns

React hooks must be called in the same order every render. Extract values from hooks before
conditional returns — even if those values are only used after the condition.

```tsx
function MyWidget() {
    const base = useBase();
    const {customPropertyValueByKey, errorState} = useCustomProperties(getCustomProperties);

    // Extract values and call useMemo BEFORE any early returns
    const derivedValue = useMemo(() => /* ... */, [dep1, dep2]);

    if (errorState) {
        return <div>Error: {errorState.error.message}</div>;
    }

    // Now safe to use derivedValue, do table lookups, etc.
}
```

## Data Processing Optimizations

When iterating over large record sets inside `useMemo`:

- **Use `Set` for lookups** — `set.has(value)` is O(1) vs `array.includes(value)` O(n)
- **Pre-compute loop-invariant values** — e.g., `const startTime = start.getTime()` once, not
  inside every iteration
- **Combine passes** — build maps and compute totals in a single loop instead of separate
  filter/map/reduce chains
- **Use `for...of` with `continue`** — clearer early-exit semantics than `.forEach` with `return`

```tsx
const data = useMemo(() => {
    const typesSet = new Set(selectedTypes);          // O(1) lookups
    const startTime = periodStart.getTime();          // computed once
    const endTime = periodEnd.getTime();
    const counts = new Map<string, number>();
    let total = 0;

    for (const record of records) {
        const type = extractValue(record.getCellValue(typeField));
        if (!typesSet.has(type)) continue;            // early exit

        const ts = new Date(record.getCellValue(dateField) as string).getTime();
        if (ts < startTime || ts > endTime) continue; // inline comparison

        const id = record.id;
        const count = (counts.get(id) ?? 0) + 1;
        counts.set(id, count);
        total += 1;                                   // accumulate in same pass
    }

    return {counts, total};
}, [records, selectedTypes, periodStart, periodEnd, typeField, dateField]);
```

## Utility Functions

Place pure helper functions (those that don't use hooks or component state) at module scope, not
inside components. This avoids recreating function objects on every render and makes them
automatically available for reuse.

```tsx
// Module scope — created once
function getStatusColor(percentage: number): string {
    if (percentage >= 100) return 'bg-green-green';
    if (percentage >= 50) return 'bg-yellow-yellow';
    return 'bg-red-red';
}

// Inside component — only use hooks and JSX
export const ProgressBar = memo(function ProgressBar({percentage}: {percentage: number}) {
    return <div className={getStatusColor(percentage)} />;
});
```
