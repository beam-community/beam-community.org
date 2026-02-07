---
title: Serialization
description: Serializing resources to JSON:API format
project: jsonapi
order: 2
section: guides
---

# Serialization

JSONAPI views control how your data is serialized into spec-compliant JSON:API documents. This guide covers defining fields, relationships, computed attributes, metadata, and customizing the output.

## View Basics

A view declares the resource type and which fields to expose:

```elixir
defmodule MyApp.PostView do
  use JSONAPI.View, type: "posts"

  def fields do
    [:title, :body, :inserted_at]
  end
end
```

The fields list determines which attributes appear in the serialized `attributes` object. Each field name should match a key on the data struct or map you pass to the serializer.

## Computed Fields

Add a field to your `fields/0` list and define a two-arity function with the same name. The function receives the data and the connection:

```elixir
defmodule MyApp.PostView do
  use JSONAPI.View, type: "posts"

  def fields do
    [:title, :body, :excerpt]
  end

  def excerpt(post, _conn) do
    String.slice(post.body, 0..100)
  end
end
```

The serializer calls your function instead of reading the field from the data directly.

## Hidden Fields

Use the `hidden/1` callback to dynamically exclude fields based on the data:

```elixir
def hidden(%{role: "admin"}), do: [:secret_field]
def hidden(_), do: []
```

Hidden fields are removed from the serialized attributes even if they appear in `fields/0`.

## Relationships

Define relationships in the `relationships/0` callback. Each entry maps a field name to a view module:

```elixir
defmodule MyApp.PostView do
  use JSONAPI.View, type: "posts"

  def fields, do: [:title, :body]

  def relationships do
    [
      author: MyApp.UserView,
      comments: MyApp.CommentView
    ]
  end
end
```

This adds relationship links to the serialized document. The data for each relationship is read from the corresponding field on your struct.

### Including Related Resources

To automatically include related resources in the `included` section of the response (creating a compound document), use the `:include` option:

```elixir
def relationships do
  [
    author: {MyApp.UserView, :include},
    comments: MyApp.CommentView
  ]
end
```

With `:include`, the author data is serialized and placed in the top-level `included` array whenever the association is loaded. Without it, only a relationship link is rendered.

### Renaming Relationships

If your internal field name differs from the JSON:API relationship name, use a three-element tuple:

```elixir
def relationships do
  [
    creator: {:author, MyApp.UserView, :include},
    critiques: {:comments, MyApp.CommentView}
  ]
end
```

Here, the `creator` field on your struct is exposed as `author` in the JSON:API document, and `critiques` becomes `comments`.

## Metadata

Add per-resource metadata with the `meta/2` callback:

```elixir
def meta(post, _conn) do
  %{
    word_count: post.body |> String.split() |> length(),
    is_published: post.published_at != nil
  }
end
```

Top-level document metadata can be passed when rendering:

```elixir
render(conn, MyApp.PostView, "index.json", %{
  data: posts,
  meta: %{total_count: length(posts)}
})
```

## Links

Customize resource links with the `links/2` callback:

```elixir
def links(post, _conn) do
  %{
    self: "/api/posts/#{post.id}",
    canonical: "https://blog.example.com/#{post.slug}"
  }
end
```

By default, JSONAPI generates `self` links based on the resource type, ID, and configured namespace/host.

## Namespace and URL Configuration

Set a namespace at the view level to override the global config:

```elixir
use JSONAPI.View, type: "posts", namespace: "/api/v2"
```

Or customize URLs entirely by overriding `url_for/2`:

```elixir
def url_for(post, _conn) do
  "https://api.example.com/v2/posts/#{post.id}"
end
```

## Polymorphic Resources

For resources that can be different types, enable polymorphic mode:

```elixir
use JSONAPI.View, polymorphic_resource?: true

def polymorphic_type(%MyApp.Image{}), do: "images"
def polymorphic_type(%MyApp.Video{}), do: "videos"

def polymorphic_fields(%MyApp.Image{}), do: [:url, :alt_text]
def polymorphic_fields(%MyApp.Video{}), do: [:url, :duration]
```

This allows a single view to serialize different struct types with the appropriate type name and fields.

## Field Transformation

Configure how Elixir atom field names are transformed in the JSON output:

```elixir
# config/config.exs
config :jsonapi,
  field_transformation: :camelize
```

| Option | Input | Output |
|--------|-------|--------|
| `:underscore` | `:inserted_at` | `"inserted_at"` |
| `:camelize` | `:inserted_at` | `"insertedAt"` |
| `:dasherize` | `:inserted_at` | `"inserted-at"` |
| `:camelize_shallow` | `:inserted_at` | `"insertedAt"` (top-level only) |
| `:dasherize_shallow` | `:inserted_at` | `"inserted-at"` (top-level only) |

## Removing Links

To strip all link objects from your responses:

```elixir
config :jsonapi,
  remove_links: true
```

This is useful for APIs where clients don't need navigation links.
