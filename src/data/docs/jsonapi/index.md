---
title: JSONAPI
description: "JSON:API Serializer and Query Handler for Elixir"
project: jsonapi
order: 0
section: overview
---

# JSONAPI

JSONAPI is an Elixir library for building APIs that conform to the [JSON:API specification](https://jsonapi.org). It handles serializing your data into spec-compliant JSON documents and parsing incoming query parameters for sorting, filtering, pagination, sparse fieldsets, and includes.

## Why JSONAPI?

**Spec-compliant output** — Serialized responses follow the JSON:API v1.1 document structure automatically, including proper `data`, `attributes`, `relationships`, `links`, and `included` sections.

**View-based serialization** — Define views that declare which fields and relationships to expose. The serializer handles the rest, including compound documents with included resources.

**Query parameter parsing** — The `JSONAPI.QueryParser` plug parses `sort`, `filter`, `include`, `fields`, and `page` parameters into Ecto-friendly formats you can pass directly to your queries.

**Plug integration** — Ships with plugs for content-type negotiation, request deserialization, parameter transformation, and spec enforcement. Drop them into your Phoenix pipeline.

## Core Concepts

- **View** — A module that declares the `type`, `fields`, and `relationships` for a resource. You define one per resource type using `use JSONAPI.View`.
- **Serializer** — Takes a view, data, and connection and produces a spec-compliant JSON:API document. Called automatically when you render a view or manually via `JSONAPI.Serializer.serialize/4`.
- **QueryParser** — A plug that parses JSON:API query parameters (`sort`, `filter`, `include`, `fields`, `page`) into a `JSONAPI.Config` struct on `conn.assigns.jsonapi_query`.
- **Plugs** — Middleware for content-type validation, request deserialization, and field name transformation.

## Quick Look

```elixir
defmodule MyApp.PostView do
  use JSONAPI.View, type: "posts"

  def fields, do: [:title, :body]

  def relationships do
    [author: {MyApp.UserView, :include},
     comments: MyApp.CommentView]
  end
end

# In a Phoenix controller
def show(conn, %{"id" => id}) do
  post = Posts.get_post!(id)
  render(conn, MyApp.PostView, "show.json", %{data: post})
end
```

## Next Steps

- [Getting Started](/projects/jsonapi/getting-started) — Install JSONAPI and serialize your first resource
- [Serialization](/projects/jsonapi/guides/serialization) — Define views, relationships, and customize output
- [Pagination](/projects/jsonapi/guides/pagination) — Add pagination links to your responses
- [Cheatsheet](/projects/jsonapi/cheatsheet) — Quick reference for views and configuration
