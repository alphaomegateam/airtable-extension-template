This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a custom Airtable Interface Extension for **{CLIENT_NAME}**. It's built using the Airtable Blocks SDK (Interface Extensions) with React and TypeScript. You have access to an AirTable MCP server which will let you investigate this client's AirTable structure.

**IMPORTANT**: You MUST follow the rules in `.claude/rules/` when working on this project. These rules contain critical information about the Airtable Interface Extensions API, custom properties, and best practices.

## Rules Location

The following rule files MUST be consulted when developing:

- `.claude/rules/interface-extensions.md` - Core API documentation and patterns
- `.claude/rules/interface-extensions-custom-properties.md` - Custom properties API guide
- `.claude/rules/alphaomega-team.md` - Alpha Omega Team specific rules (select pill rendering, linked record labels)

## Airtable Blocks CLI

This project uses the [Airtable Blocks CLI](https://www.npmjs.com/package/@airtable/blocks-cli) for development and deployment.

### Common Commands

| Command | Description |
|---------|-------------|
| `block run` | Start local dev server (HTTPS on port 9000) |
| `block release` | Deploy the extension to Airtable |
| `block set-api-key` | Set personal access token |

### Development Workflow

1. Run `block run` to start the local dev server
2. In Airtable, open the Interface containing the extension
3. Click "Edit block locally" and paste the bundle URL
4. The extension reloads on file changes

## Development Commands

```bash
# Install dependencies
npm install

# Start local development server
block run

# Lint code
npm run lint

# Type checking
npm run typecheck

# Deploy to Airtable
block release
```

## Architecture Notes

- Entry point: `frontend/index.tsx`
- Uses `initializeBlock()` from `@airtable/blocks/interface/ui`
- Custom properties configured via `useCustomProperties()` hook
- Styling: Tailwind CSS with Airtable's color palette

## Alpha Omega Team Footer

**IMPORTANT: Do not remove the `AlphaOmegaFooter` component from `frontend/index.tsx`.**

Every extension built by Alpha Omega Team must include the footer component which displays "Custom component by Alpha Omega Team, LLC" with our logo. This is located at `frontend/components/AlphaOmegaFooter.tsx`.