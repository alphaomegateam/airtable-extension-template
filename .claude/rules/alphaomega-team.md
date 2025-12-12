# Alpha Omega Team Development Rules

These rules are specific to Alpha Omega Team's Airtable Interface Extension development practices.

## Select Field Rendering

When rendering single select or multi-select field values, **always** display them as colored pills using the color configured in Airtable.

### Implementation Pattern

```tsx
import {colorUtils} from '@airtable/blocks/interface/ui';

// For a single select value
function SelectPill({value}: {value: {name: string; color: string}}) {
    const bgColor = colorUtils.getHexForColor(value.color);
    return (
        <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{
                backgroundColor: bgColor,
                color: colorUtils.shouldUseLightTextOnColor(value.color) ? '#fff' : '#000',
            }}
        >
            {value.name}
        </span>
    );
}

// For multiple select values
function MultiSelectPills({values}: {values: Array<{name: string; color: string}>}) {
    return (
        <div className="flex flex-wrap gap-1">
            {values.map((value) => (
                <SelectPill key={value.name} value={value} />
            ))}
        </div>
    );
}
```

### Key Points

- Use `colorUtils.getHexForColor(color)` to convert Airtable color names to hex codes
- Use `colorUtils.shouldUseLightTextOnColor(color)` to determine text color for contrast
- Always render the `name` property, never the raw object
- Style as pills with rounded corners and appropriate padding

## Custom Property Descriptions for Linked Records

When creating a custom property that expects a **linked record field** (not a lookup or the primary "Name" field), include `(Link)` in the property label to guide users.

### Example

```tsx
function getCustomProperties(base: Base) {
    const table = base.tables[0];

    return [
        {
            key: 'relatedProjectField',
            label: 'Related Project Field (Link)',  // <-- Include (Link) suffix
            type: 'field',
            table,
            shouldFieldBeAllowed: (field) =>
                field.config.type === FieldType.MULTIPLE_RECORD_LINKS,
            defaultValue: table.fields.find(
                (f) => f.type === FieldType.MULTIPLE_RECORD_LINKS
            ),
        },
    ];
}
```

### Why This Matters

Users often confuse:
- The **linked record field** (type: `MULTIPLE_RECORD_LINKS`) - what we usually want
- The **Name/primary field** - a text field showing the record's display name
- **Lookup fields** - derived fields that pull data from linked records

Adding `(Link)` makes it clear which field type to select.

## Footer Component

Every extension must include the Alpha Omega Team footer component. See `frontend/components/AlphaOmegaFooter.tsx`.

**Do not remove the footer component from any extension.**
