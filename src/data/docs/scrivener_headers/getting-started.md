---
title: Getting Started
description: Install Scrivener Headers and add pagination headers to your API
project: scrivener_headers
order: 1
section: guides
---

# Getting Started with Scrivener Headers

This guide walks you through installing Scrivener Headers and adding pagination headers to your Phoenix API responses.

## Prerequisites

Scrivener Headers works with `Scrivener.Page` structs, which are produced by `scrivener_ecto` when you call `Repo.paginate/2`. Make sure you have Scrivener set up first:

```elixir
defp deps do
  [
    {:scrivener_ecto, "~> 2.0"},
    {:scrivener_headers, "~> 3.2"}
  ]
end
```

Fetch dependencies:

```bash
mix deps.get
```

Configure Scrivener on your repo:

```elixir
defmodule MyApp.Repo do
  use Ecto.Repo,
    otp_app: :my_app,
    adapter: Ecto.Adapters.Postgres

  use Scrivener, page_size: 10
end
```

## Basic Usage

In your controller, paginate a query with `Repo.paginate/2`, then pipe the connection through `Scrivener.Headers.paginate/2`:

```elixir
defmodule MyAppWeb.PersonController do
  use MyAppWeb, :controller

  def index(conn, params) do
    page =
      MyApp.Person
      |> order_by([p], desc: p.inserted_at)
      |> MyApp.Repo.paginate(params)

    conn
    |> Scrivener.Headers.paginate(page)
    |> render("index.json", people: page.entries)
  end
end
```

This sets the following response headers (assuming 300 total records, page 5 of 30, 10 per page):

```
Link: <http://localhost:4000/people?page=1>; rel="first",
      <http://localhost:4000/people?page=30>; rel="last",
      <http://localhost:4000/people?page=6>; rel="next",
      <http://localhost:4000/people?page=4>; rel="prev"
Total: 300
Per-Page: 10
Total-Pages: 30
Page-Number: 5
```

## How the Link Header Works

The `Link` header follows RFC 5988 and always includes `first` and `last` links. The `next` and `prev` links are conditional:

- `prev` is included when the current page is between 2 and `total_pages` (inclusive)
- `next` is included when the current page is between 1 and `total_pages - 1` (inclusive)

On the first page, there's no `prev`. On the last page, there's no `next`.

## Filtering and Sorting

The Link header URLs preserve existing query parameters from the request. If your request includes filters or sorting, those parameters carry through to the pagination links:

```
GET /people?filter=active&sort=name&page=2
```

The Link header URLs will include `filter=active` and `sort=name` alongside the `page` parameter.

## Custom Header Names

Override the default header names with the `header_keys` option:

```elixir
conn
|> Scrivener.Headers.paginate(page,
  header_keys: [
    total: "x-total",
    link: "x-link",
    per_page: "x-per-page",
    total_pages: "x-total-pages",
    page_number: "x-page-number"
  ]
)
|> render("index.json", people: page.entries)
```

This is useful when you need to match a specific API convention or avoid conflicts with other middleware.

## Behind a Reverse Proxy

When your application runs behind a reverse proxy (like nginx or a load balancer), the URLs in the `Link` header need to reflect the external-facing scheme, host, and port rather than the internal ones. Enable `use_x_forwarded` to read from `X-Forwarded-*` headers:

```elixir
conn
|> Scrivener.Headers.paginate(page, use_x_forwarded: true)
|> render("index.json", people: page.entries)
```

This checks for:

- `x-forwarded-proto` — Used for the URL scheme (`http` or `https`)
- `x-forwarded-host` — Used for the hostname
- `x-forwarded-port` — Used for the port number

Make sure your reverse proxy sets these headers and that you trust the source, as these values are used directly in the generated URLs.

## The Scrivener.Page Struct

`Scrivener.Headers.paginate/2` reads these fields from the page struct:

| Field | Type | Description |
|-------|------|-------------|
| `page_number` | integer | Current page (1-indexed) |
| `page_size` | integer | Items per page |
| `total_entries` | integer | Total record count |
| `total_pages` | integer | Total number of pages |
| `entries` | list | The records for this page |

These are set automatically by `Repo.paginate/2`.

## Next Steps

- [Cheatsheet](/projects/scrivener_headers/cheatsheet) — Quick reference for all options and header formats
