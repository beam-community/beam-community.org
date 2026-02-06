# BEAM Community Website

[![Build](https://github.com/beam-community/beam-community.org/actions/workflows/build.yml/badge.svg)](https://github.com/beam-community/beam-community.org/actions/workflows/build.yml)

The official website for [BEAM Community](https://beam-community.org), a collection of open source projects for the Elixir and Erlang ecosystem.

## Technology Stack

- [Astro](https://astro.build) - Static site generator
- [Tailwind CSS](https://tailwindcss.com) v4 - Utility-first CSS
- [TypeScript](https://www.typescriptlang.org) - Type-safe JavaScript
- [astro-icon](https://github.com/natemoo-re/astro-icon) - Inline SVG icons

## Development

```bash
mise install
pnpm install
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321) to see the site.

## Building

```bash
pnpm build
```

Static output is generated in the `dist/` directory.

## Data

Project data is fetched from the GitHub API at build time. Set a `GITHUB_TOKEN` environment variable for higher rate limits. If the API is unreachable, the build falls back to static data in `src/lib/constants.ts`.
