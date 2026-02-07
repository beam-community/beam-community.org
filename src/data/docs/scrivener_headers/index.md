---
title: Scrivener Headers
description: Scrivener pagination with HTTP headers and web linking
project: scrivener_headers
order: 0
section: overview
---

# Scrivener Headers

Scrivener Headers adds pagination metadata to your API responses as HTTP headers. It takes a `Scrivener.Page` struct and sets `Link`, `Total`, `Per-Page`, `Total-Pages`, and `Page-Number` headers on the connection, following RFC 5988 for web linking.

## Why Scrivener Headers?

**Standard pagination headers** — Clients get pagination information from response headers rather than the response body. The `Link` header follows RFC 5988 with `first`, `last`, `next`, and `prev` relations.

**Works with Scrivener** — Plug it directly into your existing Scrivener pagination workflow. Pass the page struct from `Repo.paginate/2` and the headers are set automatically.

**Simple API** — A single function call, `Scrivener.Headers.paginate/2`, is all you need. No configuration required for basic usage.

## What It Does

Given a paginated query result, Scrivener Headers adds these response headers:

| Header | Example | Description |
|--------|---------|-------------|
| `Link` | `<http://localhost/people?page=1>; rel="first", ...` | RFC 5988 pagination links |
| `Total` | `300` | Total number of records |
| `Per-Page` | `10` | Records per page |
| `Total-Pages` | `30` | Total number of pages |
| `Page-Number` | `5` | Current page number |

The `Link` header includes `first`, `last`, and conditionally `next` and `prev` URLs based on the current page position.

## Quick Look

```elixir
def index(conn, params) do
  page =
    MyApp.Person
    |> where([p], p.age > 30)
    |> order_by([p], desc: p.age)
    |> MyApp.Repo.paginate(params)

  conn
  |> Scrivener.Headers.paginate(page)
  |> render("index.json", people: page.entries)
end
```

## Next Steps

- [Getting Started](/projects/scrivener_headers/getting-started) — Install and add pagination headers to your API
- [Cheatsheet](/projects/scrivener_headers/cheatsheet) — Quick reference for functions and options
