---
title: Getting Started
description: Install JSONAPI and serialize your first resource
project: jsonapi
order: 1
section: guides
---

# Getting Started with JSONAPI

This guide walks you through installing the JSONAPI library, defining a view, and rendering your first spec-compliant JSON:API response.

## Installation

Add `jsonapi` to your dependencies in `mix.exs`:

```elixir
defp deps do
  [
    {:jsonapi, "~> 1.10.0"}
  ]
end
```

Then fetch dependencies:

```bash
mix deps.get
```

## Configuration

Add basic configuration in `config/config.exs`:

```elixir
config :jsonapi,
  namespace: "/api",
  field_transformation: :underscore,
  json_library: Jason
```

| Option | Description |
|--------|-------------|
| `namespace` | Path prefix for generated resource URLs (e.g., `/api`) |
| `field_transformation` | How field names are transformed: `:underscore`, `:camelize`, `:dasherize` |
| `json_library` | JSON encoder module (defaults to Jason) |
| `host` | Override the connection host for generated URLs |
| `scheme` | Override the connection scheme (`:http` or `:https`) |
| `remove_links` | Set to `true` to exclude `links` from output |

## Define a View

Create a view module for each resource type. The view declares the JSON:API type name, which fields to include, and any relationships:

```elixir
defmodule MyApp.UserView do
  use JSONAPI.View, type: "users"

  def fields do
    [:name, :email, :inserted_at]
  end
end
```

The `type` option sets the resource type string in the JSON:API document. The `fields/0` callback returns a list of atoms matching your schema's field names.

## Add Plugs to Your Pipeline

JSONAPI ships with several plugs for handling requests and responses. Add them to your Phoenix router pipeline:

```elixir
pipeline :api do
  plug :accepts, ["json"]
  plug JSONAPI.EnsureSpec
  plug JSONAPI.Deserializer
  plug JSONAPI.UnderscoreParameters
end
```

- `JSONAPI.EnsureSpec` validates that incoming requests have proper JSON:API content types and structure
- `JSONAPI.Deserializer` transforms the JSON:API request body into a flat params map your controllers can work with
- `JSONAPI.UnderscoreParameters` converts parameter keys from the configured format (e.g., camelCase) back to underscored keys

## Render a Response

In your Phoenix controller, render data through your view:

```elixir
defmodule MyAppWeb.UserController do
  use MyAppWeb, :controller

  def show(conn, %{"id" => id}) do
    user = Accounts.get_user!(id)
    render(conn, MyApp.UserView, "show.json", %{data: user})
  end

  def index(conn, _params) do
    users = Accounts.list_users()
    render(conn, MyApp.UserView, "index.json", %{data: users})
  end
end
```

This produces a JSON:API document like:

```json
{
  "data": {
    "type": "users",
    "id": "1",
    "attributes": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "inserted_at": "2024-01-15T10:30:00Z"
    },
    "links": {
      "self": "https://myapp.com/api/users/1"
    }
  },
  "jsonapi": {
    "version": "1.0"
  }
}
```

## Standalone Serialization

You can also serialize without Phoenix rendering:

```elixir
JSONAPI.Serializer.serialize(MyApp.UserView, user, conn)

# With metadata
JSONAPI.Serializer.serialize(MyApp.UserView, user, conn, %{total: 42})
```

## Add Query Parsing

To support JSON:API query parameters (sorting, filtering, includes), add the `JSONAPI.QueryParser` plug to specific routes or controllers:

```elixir
plug JSONAPI.QueryParser,
  filter: ~w(name email),
  sort: ~w(name inserted_at),
  view: MyApp.UserView
```

This parses query parameters into `conn.assigns.jsonapi_query`:

```elixir
# GET /api/users?sort=-name&filter[email]=jane@example.com

def index(conn, _params) do
  query = conn.assigns.jsonapi_query
  # query.sort => [desc: :name]
  # query.filter => %{"email" => "jane@example.com"}
end
```

## Next Steps

- [Serialization](/projects/jsonapi/guides/serialization) — Define relationships, computed fields, meta, and customize output
- [Pagination](/projects/jsonapi/guides/pagination) — Add pagination links to list responses
- [Cheatsheet](/projects/jsonapi/cheatsheet) — Quick reference for views and configuration
