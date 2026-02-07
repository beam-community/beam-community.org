---
title: Upgrading to 2.0
description: Migration guide from Bamboo 1.x to 2.0
project: bamboo
order: 4
section: guides
---

# Upgrading to Bamboo 2.0

Bamboo 2.0 introduced several breaking changes to improve error handling and separate the Phoenix integration into its own package. This guide covers what changed and how to update your code.

## Overview of Changes

- Delivery functions now return `{:ok, email}` / `{:error, error}` tuples instead of raising on failure
- New bang variants (`deliver_now!` / `deliver_later!`) for the old raise-on-failure behavior
- Phoenix view and layout support moved to the separate `bamboo_phoenix` package
- Previously deprecated functions and modules were removed
- Adapter responses standardized to ok/error tuples

## Update Your Dependency

Bump the version in `mix.exs`:

```elixir
defp deps do
  [
    {:bamboo, "~> 2.0"}
  ]
end
```

## Install bamboo_phoenix (if using Phoenix views)

Phoenix integration was extracted to its own package. If you use `Bamboo.Phoenix`, `put_html_layout/2`, `put_text_layout/2`, or render emails with Phoenix views, add the new dependency:

```elixir
defp deps do
  [
    {:bamboo, "~> 2.0"},
    {:bamboo_phoenix, "~> 1.0"}
  ]
end
```

Update your imports — `Bamboo.Phoenix` functions are now in the `bamboo_phoenix` package but the module name stays the same, so your existing `import Bamboo.Phoenix` calls should continue to work once the dependency is added.

## Update Delivery Calls

The biggest change in 2.0 is how delivery functions return results.

### Before (1.x)

In Bamboo 1.x, `deliver_now/1` and `deliver_later/1` returned the email directly and raised on failure:

```elixir
# 1.x — returns email or raises
email = MyApp.Email.welcome_email(user)
MyApp.Mailer.deliver_now(email)
```

### After (2.0)

In 2.0, `deliver_now/1` and `deliver_later/1` return ok/error tuples:

```elixir
# 2.0 — returns {:ok, email} or {:error, error}
case MyApp.Mailer.deliver_now(email) do
  {:ok, _email} -> :ok
  {:error, error} -> handle_error(error)
end
```

If you want the old behavior of raising on failure, use the new bang variants:

```elixir
# 2.0 — raises on failure (same behavior as 1.x deliver_now)
MyApp.Mailer.deliver_now!(email)
MyApp.Mailer.deliver_later!(email)
```

### Migration Strategy

The quickest migration path is to replace all `deliver_now` calls with `deliver_now!` and `deliver_later` with `deliver_later!`. This preserves existing behavior:

```elixir
# Find and replace across your codebase:
# deliver_now(  →  deliver_now!(
# deliver_later(  →  deliver_later!(
```

Then, where you want more granular error handling, switch back to the non-bang versions and handle the tuple:

```elixir
case MyApp.Mailer.deliver_now(email) do
  {:ok, email} ->
    Logger.info("Email sent to #{inspect(email.to)}")
    {:ok, email}

  {:error, error} ->
    Logger.error("Failed to send email: #{inspect(error)}")
    {:error, error}
end
```

## Adapter Response Changes

Built-in adapters (SendGrid, Mailgun, Mandrill) were updated to return standardized ok/error tuples. If you wrote code that relied on specific adapter response formats in 1.x, review those call sites.

If you maintain a custom adapter, update your `deliver/2` function to return `{:ok, response}` on success and `{:error, reason}` on failure.

## Removed Deprecations

Bamboo 2.0 removed functions and modules that were deprecated in 1.x. If your code still uses any deprecated APIs, you'll get compile errors after upgrading. Check the compiler output and replace deprecated calls with their recommended alternatives.

## Migration Checklist

1. Update `bamboo` to `~> 2.0` in `mix.exs`
2. Add `bamboo_phoenix` to `mix.exs` if you use Phoenix views or layouts
3. Run `mix deps.get`
4. Replace `deliver_now` with `deliver_now!` and `deliver_later` with `deliver_later!` for a quick migration (or update call sites to handle ok/error tuples)
5. Fix any compile errors from removed deprecations
6. Run your test suite to verify everything works
7. Optionally, refactor key delivery call sites to use the non-bang tuple-returning versions for better error handling
