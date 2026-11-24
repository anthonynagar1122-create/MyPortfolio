# Graphify Repository Workflow

This repository is the corporate portfolio and product-discovery surface for the RouteMaster project family.

## Code intelligence
When this repository is enabled and indexed in Graphify, use its code graph to understand routes, page composition, shared components, data flows, and dependencies. Check the indexed commit against the current checkout HEAD. Inspect source directly when graph coverage is partial or stale.

## Engineering workflow
1. Ask a focused natural-language question about the page, component, route, or user journey.
2. Trace callers, dependencies, imports/exports, and linked tests.
3. Assess impact before editing shared layout, navigation, tokens, or animation systems.
4. Run relevant tests, lint, type checks, and production build; report only observed results.
5. Review the diff and document durable design decisions.
6. Keep credentials, private configuration, and personal data out of commits.

## Project-specific focus
Preserve the established corporate identity and hybrid product URL architecture. The portfolio is the shared presentation layer; individual products may use independent infrastructure and release cycles. Avoid changing live URL conventions or replacing the existing live landing page without an explicit project decision.
