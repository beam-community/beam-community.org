---
title: Custom Strategies
description: Build custom insert strategies for ExMachina
project: ex_machina
order: 3
section: guides
---

# Custom Strategies

ExMachina comes with two built-in strategies: the base `ExMachina` strategy (which supports `build`) and `ExMachina.Ecto` (which adds `insert` via the Ecto repo). Custom strategies let you define your own functions that process factory output in any way you need.

## How Strategies Work

A strategy defines a new function name (like `json_encode` or `api_create`) that becomes available on your factory module. When called, the strategy:

1. Calls `build` to create the record from your factory
2. Passes the built record to your handler function
3. Returns whatever your handler returns

## Defining a Strategy

Create a module that uses `ExMachina.Strategy` with a `function_name` option, then implement the `handle_<function_name>/2` callback:

```elixir
defmodule MyApp.JsonStrategy do
  use ExMachina.Strategy, function_name: :json_encode

  def handle_json_encode(record, _opts) do
    Jason.encode!(record)
  end
end
```

The `function_name` determines both the function added to your factory and the callback you implement.

## Using a Strategy

Add the strategy to your factory with `use`:

```elixir
defmodule MyApp.Factory do
  use ExMachina
  use MyApp.JsonStrategy

  def user_factory do
    %{name: "Jane", email: "jane@example.com"}
  end
end
```

This gives your factory `json_encode`, `json_encode_pair`, and `json_encode_list` functions:

```elixir
# Encode a single record
json = MyApp.Factory.json_encode(:user)
# => "{\"name\":\"Jane\",\"email\":\"jane@example.com\"}"

# Encode with overrides
json = MyApp.Factory.json_encode(:user, name: "Custom")

# Encode two records
[json1, json2] = MyApp.Factory.json_encode_pair(:user)

# Encode many records
jsons = MyApp.Factory.json_encode_list(5, :user)
```

## Generated Functions

When you define a strategy with `function_name: :my_func`, ExMachina generates:

| Function | Calls |
|----------|-------|
| `my_func(:name)` | Build one, pass to handler |
| `my_func(:name, attrs)` | Build one with overrides, pass to handler |
| `my_func_pair(:name)` | Build two, pass each to handler |
| `my_func_pair(:name, attrs)` | Build two with overrides, pass each to handler |
| `my_func_list(n, :name)` | Build n, pass each to handler |
| `my_func_list(n, :name, attrs)` | Build n with overrides, pass each to handler |

## Handler Arguments

The handler receives two arguments:

1. **record** — The built factory output (struct or map)
2. **opts** — A map containing `%{factory_module: YourFactory}` plus any options passed to the strategy via `use`

```elixir
defmodule MyApp.ApiStrategy do
  use ExMachina.Strategy, function_name: :api_create

  def handle_api_create(record, opts) do
    factory_module = opts.factory_module
    # Use factory_module or other opts as needed
    MyApp.ApiClient.create(record)
  end
end
```

### Three-Argument Handler

For strategies that need per-call options, define a three-argument handler. The third argument receives options passed when calling the function:

```elixir
defmodule MyApp.ApiStrategy do
  use ExMachina.Strategy, function_name: :api_create

  def handle_api_create(record, _strategy_opts, call_opts) do
    endpoint = Keyword.get(call_opts, :endpoint, "/users")
    MyApp.ApiClient.post(endpoint, record)
  end
end

# Usage
MyApp.Factory.api_create(:user, [name: "Jane"], endpoint: "/admin/users")
```

## Practical Examples

### JSON Encoding Strategy

Useful for testing JSON APIs where you need factory data as encoded JSON:

```elixir
defmodule MyApp.JsonStrategy do
  use ExMachina.Strategy, function_name: :json_encode

  def handle_json_encode(record, _opts) do
    record
    |> Map.from_struct()
    |> Map.drop([:__meta__, :id])
    |> Jason.encode!()
  end
end
```

### API Client Strategy

Create records through an HTTP API instead of the database:

```elixir
defmodule MyApp.ApiStrategy do
  use ExMachina.Strategy, function_name: :api_insert

  def handle_api_insert(record, _opts) do
    {:ok, response} = MyApp.ApiClient.create(record)
    response.body
  end
end
```

### File Persistence Strategy

Write records to files for integration testing:

```elixir
defmodule MyApp.FileStrategy do
  use ExMachina.Strategy, function_name: :write_to_file

  def handle_write_to_file(record, _opts, call_opts) do
    path = Keyword.fetch!(call_opts, :path)
    content = Jason.encode!(record, pretty: true)
    File.write!(path, content)
    record
  end
end
```

## Using Multiple Strategies

A factory can use multiple strategies simultaneously:

```elixir
defmodule MyApp.Factory do
  use ExMachina.Ecto, repo: MyApp.Repo
  use MyApp.JsonStrategy
  use MyApp.ApiStrategy

  def user_factory do
    %MyApp.User{
      name: "Jane",
      email: sequence(:email, &"user-#{&1}@example.com")
    }
  end
end

# All of these work:
MyApp.Factory.build(:user)        # In-memory struct
MyApp.Factory.insert(:user)       # Database insert via Ecto
MyApp.Factory.json_encode(:user)  # JSON string
MyApp.Factory.api_insert(:user)   # API call
```

## The name_from_struct Helper

`ExMachina.Strategy.name_from_struct/1` derives a factory name from a struct module. This is useful inside handlers when you need to know what type of record you're working with:

```elixir
ExMachina.Strategy.name_from_struct(%MyApp.User{})
# => :user

ExMachina.Strategy.name_from_struct(%MyApp.BlogPost{})
# => :blog_post
```
