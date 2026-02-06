# Contributing

PRs are welcome!

## Getting Started

1. Fork the repository
2. Clone your fork and install dependencies:
   ```bash
   pnpm install
   ```
3. Start the dev server:
   ```bash
   pnpm dev
   ```
4. Make your changes and verify the build:
   ```bash
   pnpm build
   ```
5. Open a pull request

## Project Structure

```
src/
  components/   # Astro components (.astro files)
  layouts/      # Page layouts
  lib/          # TypeScript utilities, types, and constants
  pages/        # Route pages
  styles/       # Global CSS with Tailwind
public/         # Static assets (favicon, etc.)
```
