---
title: Pagination
description: Paginating JSON:API responses
project: jsonapi
order: 3
section: guides
---

# Pagination

JSONAPI supports adding pagination links to your responses through a pluggable paginator system. You can use the built-in pagination link callbacks or implement a custom paginator module.

## How Pagination Works

When you serialize a list of resources, JSONAPI can include pagination links in the top-level `links` object of the response:

```json
{
  "data": [...],
  "links": {
    "first": "https://api.example.com/posts?page[number]=1&page[size]=10",
    "last": "https://api.example.com/posts?page[number]=5&page[size]=10",
    "next": "https://api.example.com/posts?page[number]=3&page[size]=10",
    "prev": "https://api.example.com/posts?page[number]=1&page[size]=10"
  }
}
```

The `page` query parameters are parsed by `JSONAPI.QueryParser` and made available for your paginator to generate the appropriate links.

## View-Level Pagination

Override the `pagination_links/4` callback in your view to return pagination links directly:

```elixir
defmodule MyApp.PostView do
  use JSONAPI.View, type: "posts"

  def fields, do: [:title, :body]

  def pagination_links(data, conn, page, _options) do
    %{
      first: url_for_pagination(data, conn, %{page | "number" => 1}),
      last: url_for_pagination(data, conn, %{page | "number" => total_pages(data)}),
      next: next_link(data, conn, page),
      prev: prev_link(data, conn, page)
    }
  end
end
```

Return `nil` for any link that shouldn't appear (e.g., no `prev` on the first page, no `next` on the last page).

## Custom Paginator Module

For reusable pagination logic, implement the `JSONAPI.Paginator` behaviour:

```elixir
defmodule MyApp.PageBasedPaginator do
  @behaviour JSONAPI.Paginator

  @impl true
  def paginate(data, view, conn, page, options) do
    total = Keyword.get(options, :total_pages, 1)
    number = page_number(page)

    %{
      first: view.url_for_pagination(data, conn, %{"number" => 1, "size" => page_size(page)}),
      last: view.url_for_pagination(data, conn, %{"number" => total, "size" => page_size(page)}),
      next: next_link(data, view, conn, page, number, total),
      prev: prev_link(data, view, conn, page, number)
    }
  end

  defp next_link(data, view, conn, page, number, total) when number < total do
    view.url_for_pagination(data, conn, %{"number" => number + 1, "size" => page_size(page)})
  end
  defp next_link(_, _, _, _, _, _), do: nil

  defp prev_link(data, view, conn, page, number) when number > 1 do
    view.url_for_pagination(data, conn, %{"number" => number - 1, "size" => page_size(page)})
  end
  defp prev_link(_, _, _, _, _), do: nil

  defp page_number(%{"number" => number}), do: String.to_integer(number)
  defp page_number(_), do: 1

  defp page_size(%{"size" => size}), do: size
  defp page_size(_), do: "10"
end
```

### The paginate/5 Callback

The `JSONAPI.Paginator` behaviour requires a single callback:

```elixir
@callback paginate(data, view, conn, page, options) :: links
```

| Argument | Type | Description |
|----------|------|-------------|
| `data` | list | The dataset being serialized |
| `view` | atom | The view module |
| `conn` | `Plug.Conn` | The current connection |
| `page` | map | Parsed page parameters (string keys) |
| `options` | keyword | Additional options passed during rendering |

It must return a map with `first`, `last`, `next`, and `prev` keys. Each value is either a URL string or `nil`.

## Configuring a Paginator

Set a paginator globally in your config:

```elixir
config :jsonapi,
  paginator: MyApp.PageBasedPaginator
```

Or per-view:

```elixir
defmodule MyApp.PostView do
  use JSONAPI.View, type: "posts", paginator: MyApp.PageBasedPaginator

  def fields, do: [:title, :body]
end
```

Per-view configuration takes precedence over the global setting.

## Passing Pagination Options

Pass extra options when rendering to make them available to your paginator:

```elixir
def index(conn, params) do
  page = Posts.list_posts(params)

  render(conn, MyApp.PostView, "index.json", %{
    data: page.entries,
    options: [total_pages: page.total_pages, page_size: page.page_size]
  })
end
```

The `options` keyword list is forwarded as the last argument to `paginate/5`.

## Query Parameter Parsing

`JSONAPI.QueryParser` automatically parses `page` parameters from the request:

```
GET /api/posts?page[number]=2&page[size]=10
```

These are available in `conn.assigns.jsonapi_query.page` as a map with string keys:

```elixir
%{"number" => "2", "size" => "10"}
```

Use these parsed values in your controller to drive your database query pagination and pass them through to the serializer.
