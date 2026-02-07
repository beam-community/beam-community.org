---
title: Cheatsheet
description: Quick reference for ExMachina functions and patterns
project: ex_machina
order: 10
section: resources
---

# ExMachina Cheatsheet

Quick reference for the most common ExMachina functions and patterns.

## Setup

```elixir
# mix.exs
{:ex_machina, "~> 2.8.0", only: :test}

# test/test_helper.exs
{:ok, _} = Application.ensure_all_started(:ex_machina)

# test/support/factory.ex — with Ecto
defmodule MyApp.Factory do
  use ExMachina.Ecto, repo: MyApp.Repo
end

# test/support/factory.ex — without Ecto
defmodule MyApp.Factory do
  use ExMachina
end
```

## Defining Factories

```elixir
# Basic factory
def user_factory do
  %MyApp.User{
    name: "Jane",
    email: sequence(:email, &"user-#{&1}@example.com")
  }
end

# Derived factory
def admin_factory do
  struct!(user_factory(), %{role: "admin"})
end

# Factory with associations
def article_factory do
  %MyApp.Article{
    title: sequence(:title, &"Article #{&1}"),
    author: build(:user)
  }
end

# Factory with full control (single argument)
def custom_user_factory(attrs) do
  user = %MyApp.User{
    name: "Default",
    email: "default@example.com"
  }

  user
  |> merge_attributes(attrs)
  |> evaluate_lazy_attributes()
end
```

## Building (In-Memory)

```elixir
import MyApp.Factory

# Single record
user = build(:user)

# With overrides
user = build(:user, name: "Custom", role: "admin")

# Two records
[u1, u2] = build_pair(:user)

# N records
users = build_list(5, :user, role: "editor")
```

## Inserting (Database)

```elixir
# Single record
user = insert(:user)

# With overrides
admin = insert(:user, role: "admin")

# Two records
[u1, u2] = insert_pair(:user)

# N records
users = insert_list(10, :user)

# With Ecto repo options
insert(:user, [name: "Jane"], prefix: "tenant_one")
insert(:user, [name: "Jane"], returning: true)
```

## Generating Params

```elixir
# Atom keys, no Ecto metadata or belongs_to
params_for(:user)
params_for(:user, name: "Custom")

# String keys
string_params_for(:user)

# With belongs_to associations inserted and foreign keys included
params_with_assocs(:article)
# => %{title: "...", author_id: 1}

string_params_with_assocs(:article)
# => %{"title" => "...", "author_id" => 1}
```

## Sequences

```elixir
# Formatted string
sequence(:email, &"user-#{&1}@example.com")
# => "user-0@example.com", "user-1@example.com", ...

# Plain string prefix
sequence("username")
# => "username0", "username1", ...

# Cycle through a list
sequence(:role, ["admin", "editor", "viewer"])
# => "admin", "editor", "viewer", "admin", ...

# Custom start
sequence(:id, &"id-#{&1}", start_at: 100)
# => "id-100", "id-101", ...

# Reset all sequences (useful in setup blocks)
ExMachina.Sequence.reset()
```

## Associations

```elixir
# belongs_to — use build in factory definition
def article_factory do
  %MyApp.Article{author: build(:user)}
end

# Override association at call site
author = insert(:user, name: "Specific Author")
article = insert(:article, author: author)

# has_many — create children separately
article = insert(:article)
comments = insert_list(3, :comment, article: article)

# Lazy evaluation
def account_factory do
  %MyApp.Account{
    owner: fn -> build(:user) end
  }
end

# Lazy with parent access
def account_factory do
  %MyApp.Account{
    plan: "premium",
    owner: fn acct -> build(:user, vip: acct.plan == "premium") end
  }
end
```

## Helper Patterns

```elixir
# Transform functions
def make_admin(user), do: %{user | role: "admin"}

# Composition helpers
def with_posts(user, count \\ 3) do
  insert_list(count, :post, author: user)
  user
end

# Pipeline usage
user = build(:user) |> make_admin() |> insert() |> with_posts(5)
```

## Splitting Factories

```elixir
# test/support/factory.ex
defmodule MyApp.Factory do
  use ExMachina.Ecto, repo: MyApp.Repo
  use MyApp.UserFactory
  use MyApp.ArticleFactory
end

# test/factories/user_factory.ex
defmodule MyApp.UserFactory do
  defmacro __using__(_opts) do
    quote do
      def user_factory do
        %MyApp.User{name: "Jane"}
      end
    end
  end
end
```

## Custom Strategies

```elixir
# Define a strategy
defmodule MyApp.JsonStrategy do
  use ExMachina.Strategy, function_name: :json_encode

  def handle_json_encode(record, _opts) do
    Jason.encode!(record)
  end
end

# Use in factory
defmodule MyApp.Factory do
  use ExMachina
  use MyApp.JsonStrategy
end

# Call it
MyApp.Factory.json_encode(:user)
MyApp.Factory.json_encode_pair(:user)
MyApp.Factory.json_encode_list(3, :user)
```

## Key Modules

| Module | Purpose |
|--------|---------|
| `ExMachina` | Core build functions, no persistence |
| `ExMachina.Ecto` | Adds insert, params_for, and Ecto integration |
| `ExMachina.Strategy` | Define custom strategies |
| `ExMachina.Sequence` | Sequence generation and reset |

## Key Functions

| Function | Returns |
|----------|---------|
| `build(:name)` | Struct/map |
| `build_pair(:name)` | List of 2 |
| `build_list(n, :name)` | List of n |
| `insert(:name)` | Persisted struct |
| `insert_pair(:name)` | List of 2 persisted |
| `insert_list(n, :name)` | List of n persisted |
| `params_for(:name)` | Map (atom keys) |
| `params_with_assocs(:name)` | Map with foreign keys |
| `string_params_for(:name)` | Map (string keys) |
| `string_params_with_assocs(:name)` | Map (string keys) with foreign keys |
| `sequence(:name, formatter)` | Unique value |
| `merge_attributes(record, attrs)` | Merged record |
| `evaluate_lazy_attributes(record)` | Evaluated record |
