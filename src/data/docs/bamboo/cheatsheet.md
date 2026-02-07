---
title: Cheatsheet
description: Quick reference for Bamboo functions and patterns
project: bamboo
order: 10
section: resources
---

# Bamboo Cheatsheet

Quick reference for the most common Bamboo functions and patterns.

## Setup

```elixir
# mix.exs
{:bamboo, "~> 2.3.0"}

# Mailer module
defmodule MyApp.Mailer do
  use Bamboo.Mailer, otp_app: :my_app
end

# Config
config :my_app, MyApp.Mailer,
  adapter: Bamboo.SendGridAdapter,
  api_key: "..."
```

## Composing Emails

```elixir
import Bamboo.Email

# All-at-once
new_email(
  to: "user@example.com",
  from: "app@example.com",
  subject: "Hello",
  html_body: "<p>Hi</p>",
  text_body: "Hi"
)

# Pipe style
new_email()
|> to("user@example.com")
|> from("app@example.com")
|> subject("Hello")
|> html_body("<p>Hi</p>")
|> text_body("Hi")
```

## Recipients

```elixir
# String
to("user@example.com")

# Name + address tuple
to({"Jane Doe", "jane@example.com"})

# Multiple
to(["one@example.com", {"Two", "two@example.com"}])

# CC and BCC
cc("team@example.com")
bcc(["logs@example.com", "archive@example.com"])
```

## Attachments and Headers

```elixir
# File attachment
|> put_attachment("path/to/file.pdf")

# Custom header
|> put_header("Reply-To", "reply@example.com")

# Adapter-specific metadata
|> put_private(:send_grid_template, %{template_id: "abc123"})
```

## Sending

```elixir
# Synchronous (returns {:ok, email} or {:error, error})
MyApp.Mailer.deliver_now(email)

# Synchronous (raises on failure)
MyApp.Mailer.deliver_now!(email)

# Background (returns {:ok, email} or {:error, error})
MyApp.Mailer.deliver_later(email)

# Background (raises on failure)
MyApp.Mailer.deliver_later!(email)

# With response from adapter
MyApp.Mailer.deliver_now(email, response: true)
```

## Adapter Config by Environment

```elixir
# config/dev.exs
config :my_app, MyApp.Mailer,
  adapter: Bamboo.LocalAdapter

# config/test.exs
config :my_app, MyApp.Mailer,
  adapter: Bamboo.TestAdapter

# config/prod.exs — SendGrid
config :my_app, MyApp.Mailer,
  adapter: Bamboo.SendGridAdapter,
  api_key: System.get_env("SENDGRID_API_KEY")

# config/prod.exs — Mailgun
config :my_app, MyApp.Mailer,
  adapter: Bamboo.MailgunAdapter,
  api_key: System.get_env("MAILGUN_API_KEY"),
  domain: System.get_env("MAILGUN_DOMAIN")

# config/prod.exs — Mandrill
config :my_app, MyApp.Mailer,
  adapter: Bamboo.MandrillAdapter,
  api_key: System.get_env("MANDRILL_API_KEY")
```

## Dev Email Viewer

```elixir
# In your Phoenix router
if Mix.env() == :dev do
  forward "/sent_emails", Bamboo.SentEmailViewerPlug
end
```

## Testing

```elixir
# In your test
use Bamboo.Test

# Assert email was delivered
assert_delivered_email expected_email

# Assert with specific fields
assert_email_delivered_with to: [{_, "user@example.com"}], subject: "Welcome"

# Pattern match
assert_delivered_email_matches %{to: [{_, "user@example.com"}]}

# Assert no emails sent
assert_no_emails_delivered()

# Refute delivery
refute_delivered_email some_email
refute_email_delivered_with to: [{_, "admin@example.com"}]

# For emails sent from other processes (Task, GenServer)
use Bamboo.Test, shared: true
```

## Interceptors

```elixir
# Config
config :my_app, MyApp.Mailer,
  adapter: Bamboo.SendGridAdapter,
  interceptors: [MyApp.BlockListInterceptor]

# Implementation
defmodule MyApp.BlockListInterceptor do
  @behaviour Bamboo.Interceptor

  def call(email) do
    if should_block?(email), do: Bamboo.Email.block(email), else: email
  end
end
```

## Common Patterns

### Base Email with Defaults

```elixir
defmodule MyApp.Email do
  import Bamboo.Email

  defp base_email do
    new_email()
    |> from("support@myapp.com")
    |> put_header("Reply-To", "help@myapp.com")
  end

  def welcome(user) do
    base_email()
    |> to(user.email)
    |> subject("Welcome!")
    |> text_body("Thanks for joining.")
  end
end
```

### Custom Formatter

```elixir
defimpl Bamboo.Formatter, for: MyApp.User do
  def format_email_address(user, _opts) do
    {user.name, user.email}
  end
end

# Now you can pass a user struct directly
new_email(to: user)
```

## Key Modules

| Module | Purpose |
|--------|---------|
| `Bamboo.Email` | Build email structs |
| `Bamboo.Mailer` | Send emails |
| `Bamboo.Test` | Test assertions |
| `Bamboo.Formatter` | Custom address formatting |
| `Bamboo.Interceptor` | Modify/block before send |
| `Bamboo.Phoenix` | Phoenix view rendering (separate package) |
| `Bamboo.SentEmailViewerPlug` | Dev email inspector |
