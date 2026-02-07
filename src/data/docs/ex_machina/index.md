---
title: ExMachina
description: Create test data for Elixir applications
project: ex_machina
order: 0
section: overview
---

# ExMachina

ExMachina is a factory library for Elixir that makes it easy to create test data. You define factories as plain functions that return structs or maps, then use helpers like `build`, `insert`, and `params_for` to generate data in your tests.

## Why ExMachina?

**Factories are just functions** — Each factory is a function in your factory module that returns a struct or map. No DSL to learn, no magic — you use standard Elixir to define your test data.

**Works with Ecto** — The `ExMachina.Ecto` module adds functions to insert records into your database, handle associations automatically, and generate param maps for controller tests.

**Works without Ecto too** — ExMachina doesn't require Ecto. Use it with plain maps, structs, or any data structure. Custom strategies let you plug in any persistence layer.

**Composable** — Override attributes on the fly, chain helper functions together, and build derived factories from existing ones using standard Elixir patterns.

## Core Concepts

ExMachina is built around a few key ideas:

- **Factory** — A function named `<name>_factory` that returns a struct or map with default attributes. You define these in a factory module.
- **Build** — Create data in memory without touching the database. Use `build/2`, `build_pair/2`, or `build_list/3`.
- **Insert** — Build and save to the database via Ecto. Use `insert/2`, `insert_pair/2`, or `insert_list/3`.
- **Params** — Generate plain maps for controller tests. Use `params_for/2`, `string_params_for/2`, or their `_with_assocs` variants.
- **Sequence** — Generate unique values across factory calls with `sequence/2`.

## Quick Look

```elixir
# Define a factory
defmodule MyApp.Factory do
  use ExMachina.Ecto, repo: MyApp.Repo

  def user_factory do
    %MyApp.User{
      name: "Jane",
      email: sequence(:email, &"user-#{&1}@example.com")
    }
  end
end

# Use it in tests
import MyApp.Factory

user = insert(:user)
users = insert_list(3, :user, role: "admin")
params = string_params_for(:user, name: "Custom Name")
```

## Next Steps

- [Getting Started](/projects/ex_machina/getting-started) — Install ExMachina and create your first factory
- [Working with Associations](/projects/ex_machina/guides/associations) — Handle Ecto associations in factories
- [Custom Strategies](/projects/ex_machina/guides/custom-strategies) — Build custom insert strategies
- [Cheatsheet](/projects/ex_machina/cheatsheet) — Quick reference for all functions and patterns
