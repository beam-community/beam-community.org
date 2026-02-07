---
title: Cheatsheet
description: Quick reference for Scrivener Headers usage
project: scrivener_headers
order: 10
section: resources
---

# Scrivener Headers Cheatsheet

Quick reference for Scrivener Headers functions and configuration.

## Setup

```elixir
# mix.exs
{:scrivener_ecto, "~> 2.0"},
{:scrivener_headers, "~> 3.2"}

# Repo
defmodule MyApp.Repo do
  use Ecto.Repo, otp_app: :my_app, adapter: Ecto.Adapters.Postgres
  use Scrivener, page_size: 10
end
```

## Basic Usage

```elixir
def index(conn, params) do
  page = MyApp.Repo.paginate(MyApp.Person, params)

  conn
  |> Scrivener.Headers.paginate(page)
  |> render("index.json", people: page.entries)
end
```

## Function Signature

```elixir
Scrivener.Headers.paginate(conn, page, opts \\ [])
```

| Argument | Type | Description |
|----------|------|-------------|
| `conn` | `Plug.Conn.t` | The connection |
| `page` | `Scrivener.Page.t` | Paginated result |
| `opts` | keyword | Optional configuration |

Returns: `Plug.Conn.t` with pagination headers set.

## Response Headers

| Header | Default Name | Value |
|--------|-------------|-------|
| Link | `"link"` | RFC 5988 pagination URLs |
| Total | `"total"` | `page.total_entries` |
| Per-Page | `"per-page"` | `page.page_size` |
| Total-Pages | `"total-pages"` | `page.total_pages` |
| Page-Number | `"page-number"` | `page.page_number` |

## Link Header Format

```
<http://localhost:4000/people?page=1>; rel="first",
<http://localhost:4000/people?page=30>; rel="last",
<http://localhost:4000/people?page=6>; rel="next",
<http://localhost:4000/people?page=4>; rel="prev"
```

- `first` and `last` are always present
- `prev` is present when `1 < page_number <= total_pages`
- `next` is present when `1 <= page_number < total_pages`

## Options

### Custom Header Names

```elixir
Scrivener.Headers.paginate(page,
  header_keys: [
    total: "x-total",
    link: "x-link",
    per_page: "x-per-page",
    total_pages: "x-total-pages",
    page_number: "x-page-number"
  ]
)
```

### Reverse Proxy Support

```elixir
Scrivener.Headers.paginate(page, use_x_forwarded: true)
```

Reads from these request headers to build URLs:

| Request Header | Used For |
|---------------|----------|
| `x-forwarded-proto` | URL scheme |
| `x-forwarded-host` | Hostname |
| `x-forwarded-port` | Port number |

## Scrivener.Page Fields

| Field | Type | Description |
|-------|------|-------------|
| `page_number` | integer | Current page (1-indexed) |
| `page_size` | integer | Items per page |
| `total_entries` | integer | Total record count |
| `total_pages` | integer | Total number of pages |
| `entries` | list | Records for this page |

## Common Patterns

### With Ecto Query

```elixir
page =
  MyApp.Person
  |> where([p], p.age > 30)
  |> order_by([p], desc: p.age)
  |> preload(:friends)
  |> MyApp.Repo.paginate(params)

conn
|> Scrivener.Headers.paginate(page)
|> render("index.json", people: page.entries)
```

### With Custom Page Size

```elixir
page = MyApp.Repo.paginate(query, %{"page" => "2", "page_size" => "25"})
```

### Behind nginx

```elixir
# Ensure nginx sets:
# proxy_set_header X-Forwarded-Proto $scheme;
# proxy_set_header X-Forwarded-Host $host;
# proxy_set_header X-Forwarded-Port $server_port;

conn
|> Scrivener.Headers.paginate(page, use_x_forwarded: true)
|> render("index.json", data: page.entries)
```
