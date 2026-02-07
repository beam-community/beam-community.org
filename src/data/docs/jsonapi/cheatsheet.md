---
title: Cheatsheet
description: Quick reference for JSONAPI views and configuration
project: jsonapi
order: 10
section: resources
---

# JSONAPI Cheatsheet

Quick reference for the most common JSONAPI functions, view callbacks, and configuration.

## Setup

```elixir
# mix.exs
{:jsonapi, "~> 1.10.0"}

# config/config.exs
config :jsonapi,
  namespace: "/api",
  field_transformation: :underscore,
  json_library: Jason,
  remove_links: false,
  paginator: nil
```

## Defining a View

```elixir
defmodule MyApp.PostView do
  use JSONAPI.View, type: "posts"

  def fields, do: [:title, :body, :inserted_at]

  def relationships do
    [
      author: {MyApp.UserView, :include},
      comments: MyApp.CommentView
    ]
  end
end
```

## View Callbacks

| Callback | Signature | Purpose |
|----------|-----------|---------|
| `fields/0` | `() -> [atom]` | Fields to serialize |
| `relationships/0` | `() -> keyword` | Relationship definitions |
| `meta/2` | `(data, conn) -> map` | Per-resource metadata |
| `links/2` | `(data, conn) -> map` | Custom link objects |
| `hidden/1` | `(data) -> [atom]` | Fields to exclude |
| `id/1` | `(data) -> String.t` | Custom ID extraction |
| `namespace/0` | `() -> String.t` | URL path prefix |
| `url_for/2` | `(data, conn) -> String.t` | Custom resource URL |

## Computed Fields

```elixir
def fields, do: [:title, :excerpt]

def excerpt(post, _conn) do
  String.slice(post.body, 0..100)
end
```

## Relationships

```elixir
# Basic — link only
[comments: MyApp.CommentView]

# Always include when loaded
[author: {MyApp.UserView, :include}]

# Rename (internal_field: {:api_name, View, :include})
[creator: {:author, MyApp.UserView, :include}]
```

## Rendering

```elixir
# Phoenix controller
render(conn, MyApp.PostView, "show.json", %{data: post})
render(conn, MyApp.PostView, "index.json", %{data: posts})

# With metadata
render(conn, MyApp.PostView, "index.json", %{
  data: posts,
  meta: %{total: 42}
})

# Standalone
JSONAPI.Serializer.serialize(MyApp.PostView, data, conn)
JSONAPI.Serializer.serialize(MyApp.PostView, data, conn, meta)
```

## Phoenix Pipeline Plugs

```elixir
pipeline :api do
  plug :accepts, ["json"]
  plug JSONAPI.EnsureSpec
  plug JSONAPI.Deserializer
  plug JSONAPI.UnderscoreParameters
end
```

| Plug | Purpose |
|------|---------|
| `JSONAPI.EnsureSpec` | Validate content types and request structure |
| `JSONAPI.Deserializer` | Flatten JSON:API body into params map |
| `JSONAPI.UnderscoreParameters` | Convert param keys to underscore |
| `JSONAPI.ContentTypeNegotiation` | Check Content-Type and Accept headers |
| `JSONAPI.FormatRequired` | Verify request body format |
| `JSONAPI.IdRequired` | Confirm ID matches URI |
| `JSONAPI.ResponseContentType` | Set response content type |

## Query Parser

```elixir
plug JSONAPI.QueryParser,
  filter: ~w(name email),
  sort: ~w(name inserted_at),
  view: MyApp.UserView
```

### Parsed Output (`conn.assigns.jsonapi_query`)

```elixir
# GET /api/users?sort=-name&filter[email]=jane@example.com&include=posts

%JSONAPI.Config{
  sort: [desc: :name],
  filter: %{"email" => "jane@example.com"},
  include: [:posts],
  page: %{},
  fields: %{}
}
```

### Query Parameter Formats

| Parameter | Example | Parsed |
|-----------|---------|--------|
| Sort ascending | `?sort=name` | `[asc: :name]` |
| Sort descending | `?sort=-name` | `[desc: :name]` |
| Filter | `?filter[name]=Jane` | `%{"name" => "Jane"}` |
| Include | `?include=author,comments` | `[:author, :comments]` |
| Sparse fields | `?fields[posts]=title,body` | `%{"posts" => [:title, :body]}` |
| Pagination | `?page[number]=2&page[size]=10` | `%{"number" => "2", "size" => "10"}` |

## Pagination

```elixir
# Global config
config :jsonapi, paginator: MyApp.PagePaginator

# Per-view
use JSONAPI.View, type: "posts", paginator: MyApp.PagePaginator

# Paginator behaviour
defmodule MyApp.PagePaginator do
  @behaviour JSONAPI.Paginator

  @impl true
  def paginate(data, view, conn, page, options) do
    %{first: "...", last: "...", next: "...", prev: nil}
  end
end
```

## Field Transformation

```elixir
config :jsonapi, field_transformation: :camelize
```

| Option | `:inserted_at` becomes |
|--------|----------------------|
| `:underscore` | `"inserted_at"` |
| `:camelize` | `"insertedAt"` |
| `:dasherize` | `"inserted-at"` |

## Polymorphic Resources

```elixir
use JSONAPI.View, polymorphic_resource?: true

def polymorphic_type(%Image{}), do: "images"
def polymorphic_type(%Video{}), do: "videos"

def polymorphic_fields(%Image{}), do: [:url, :alt_text]
def polymorphic_fields(%Video{}), do: [:url, :duration]
```

## Configuration Reference

| Option | Default | Description |
|--------|---------|-------------|
| `namespace` | `nil` | URL path prefix |
| `field_transformation` | `:underscore` | Field name format |
| `json_library` | `Jason` | JSON encoder |
| `host` | from conn | Override host |
| `scheme` | from conn | Override scheme |
| `remove_links` | `false` | Strip link objects |
| `paginator` | `nil` | Default paginator module |
