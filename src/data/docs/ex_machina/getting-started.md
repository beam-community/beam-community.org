---
title: Getting Started
description: Install ExMachina and create your first factory
project: ex_machina
order: 1
section: guides
---

# Getting Started with ExMachina

This guide walks you through installing ExMachina, defining your first factory, and using it in tests.

## Installation

Add `ex_machina` to your test dependencies in `mix.exs`:

```elixir
defp deps do
  [
    {:ex_machina, "~> 2.8.0", only: :test}
  ]
end
```

Then fetch dependencies:

```bash
mix deps.get
```

Start ExMachina in your `test/test_helper.exs`:

```elixir
{:ok, _} = Application.ensure_all_started(:ex_machina)
ExUnit.start()
```

## Project Setup

ExMachina factories are typically placed in `test/support/factory.ex`. For non-Phoenix projects, you need to tell the compiler to include that directory during tests:

```elixir
# mix.exs
def project do
  [
    app: :my_app,
    elixirc_paths: elixirc_paths(Mix.env()),
    # ...
  ]
end

defp elixirc_paths(:test), do: ["lib", "test/support"]
defp elixirc_paths(_), do: ["lib"]
```

Phoenix projects already have this configured.

## Define Your Factory Module

### With Ecto

If your project uses Ecto, use `ExMachina.Ecto` and pass your repo:

```elixir
# test/support/factory.ex
defmodule MyApp.Factory do
  use ExMachina.Ecto, repo: MyApp.Repo

  def user_factory do
    %MyApp.User{
      name: "Jane Smith",
      email: sequence(:email, &"user-#{&1}@example.com"),
      age: 30
    }
  end
end
```

### Without Ecto

For projects without Ecto, use the base `ExMachina` module:

```elixir
defmodule MyApp.Factory do
  use ExMachina

  def user_factory do
    %{
      name: "Jane Smith",
      email: sequence(:email, &"user-#{&1}@example.com"),
      age: 30
    }
  end
end
```

## Naming Convention

Factory functions follow the pattern `<name>_factory`. The name you pass to `build`, `insert`, and other helpers maps directly to these functions:

- `build(:user)` calls `user_factory/0`
- `build(:blog_post)` calls `blog_post_factory/0`
- `insert(:comment)` calls `comment_factory/0`

## Building Data

Import your factory in tests and use `build` to create in-memory data:

```elixir
defmodule MyApp.UserTest do
  use ExUnit.Case
  import MyApp.Factory

  test "build creates a user struct" do
    user = build(:user)

    assert user.name == "Jane Smith"
    assert user.email =~ "user-"
  end
end
```

### Override Attributes

Pass a keyword list or map to override defaults:

```elixir
user = build(:user, name: "Custom Name", age: 25)

assert user.name == "Custom Name"
assert user.age == 25
```

### Build Multiple Records

```elixir
# Build exactly two
[user1, user2] = build_pair(:user)

# Build a specific number
users = build_list(5, :user, role: "admin")
assert length(users) == 5
```

## Inserting into the Database

When using `ExMachina.Ecto`, the `insert` family of functions builds a record and saves it via `Repo.insert!`:

```elixir
# Insert one record
user = insert(:user)

# Insert with overrides
admin = insert(:user, role: "admin")

# Insert two
[user1, user2] = insert_pair(:user)

# Insert many
users = insert_list(10, :user)
```

You can pass Ecto repo options as a third argument:

```elixir
insert(:user, [name: "Jane"], prefix: "tenant_one")
insert(:user, [name: "Jane"], returning: true)
```

## Generating Params

For controller and API tests, use params functions to get plain maps:

```elixir
# Atom keys, no Ecto metadata
params = params_for(:user, name: "Test User")
# => %{name: "Test User", email: "user-0@example.com", age: 30}

# String keys (for Phoenix controller params)
params = string_params_for(:user, name: "Test User")
# => %{"name" => "Test User", "email" => "user-0@example.com", "age" => 30}
```

The `_with_assocs` variants insert any `belongs_to` associations and include the foreign keys:

```elixir
# Inserts the associated author and includes author_id
params = params_with_assocs(:article)
# => %{title: "...", author_id: 1}

string_params = string_params_with_assocs(:article)
# => %{"title" => "...", "author_id" => 1}
```

## Sequences

Use `sequence` to generate unique values that increment across calls:

```elixir
def user_factory do
  %MyApp.User{
    email: sequence(:email, &"user-#{&1}@example.com"),
    username: sequence(:username, &"user#{&1}")
  }
end
```

Sequences also support cycling through a list:

```elixir
def user_factory do
  %MyApp.User{
    role: sequence(:role, ["admin", "editor", "viewer"])
  }
end
```

And custom starting values:

```elixir
sequence(:id, &"id-#{&1}", start_at: 100)
# => "id-100", "id-101", "id-102", ...
```

## Derived Factories

Create variations of a factory by calling the original and modifying the result:

```elixir
def admin_factory do
  struct!(user_factory(), %{role: "admin", permissions: ["all"]})
end

# Usage
admin = build(:admin)
```

## Flexible Factory Patterns

Write helper functions that transform factory output — ExMachina works well with pipeline composition:

```elixir
def make_admin(user), do: %{user | role: "admin"}

def with_posts(user) do
  insert_list(3, :post, author: user)
  user
end

# Chain together
user = build(:user) |> make_admin() |> insert() |> with_posts()
```

## Next Steps

- [Working with Associations](/projects/ex_machina/guides/associations) — Handle belongs_to, has_many, and other Ecto relationships
- [Custom Strategies](/projects/ex_machina/guides/custom-strategies) — Build strategies for JSON encoding, API calls, and more
- [Cheatsheet](/projects/ex_machina/cheatsheet) — Quick reference for all functions
