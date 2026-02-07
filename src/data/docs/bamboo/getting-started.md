---
title: Getting Started
description: Install Bamboo and send your first email
project: bamboo
order: 1
section: guides
---

# Getting Started with Bamboo

This guide walks you through installing Bamboo, setting up a mailer, and sending your first email.

## Installation

Add `bamboo` to your dependencies in `mix.exs`:

```elixir
defp deps do
  [
    {:bamboo, "~> 2.3.0"},
    {:jason, "~> 1.0"}
  ]
end
```

Then fetch dependencies:

```bash
mix deps.get
```

Bamboo uses Jason for JSON encoding by default. If you prefer a different JSON library, you can configure it:

```elixir
config :bamboo, :json_library, SomeOtherLib
```

## Define Your Mailer

Create a mailer module that Bamboo will use to send emails. This module ties your application to an adapter through configuration:

```elixir
defmodule MyApp.Mailer do
  use Bamboo.Mailer, otp_app: :my_app
end
```

## Configure the Adapter

In your config files, tell the mailer which adapter to use. For development, the `LocalAdapter` stores emails in memory so you can inspect them without sending anything externally:

```elixir
# config/dev.exs
config :my_app, MyApp.Mailer,
  adapter: Bamboo.LocalAdapter
```

For production, configure a real adapter like SendGrid:

```elixir
# config/prod.exs
config :my_app, MyApp.Mailer,
  adapter: Bamboo.SendGridAdapter,
  api_key: System.get_env("SENDGRID_API_KEY")
```

See the [Adapters guide](/projects/bamboo/guides/adapters) for a full list of available adapters and their configuration.

## Create an Email Module

Define a module where you build your emails. Import `Bamboo.Email` to get access to all the composition functions:

```elixir
defmodule MyApp.Email do
  import Bamboo.Email

  def welcome_email(user) do
    new_email(
      to: user.email,
      from: "support@myapp.com",
      subject: "Welcome to MyApp!",
      html_body: "<h1>Welcome, #{user.name}!</h1><p>Thanks for joining.</p>",
      text_body: "Welcome, #{user.name}! Thanks for joining."
    )
  end
end
```

### Pipe-Based Composition

You can also build emails incrementally using pipes, which is useful when you want to set shared defaults:

```elixir
defmodule MyApp.Email do
  import Bamboo.Email

  def welcome_email(user) do
    base_email()
    |> to(user.email)
    |> subject("Welcome to MyApp!")
    |> html_body("<h1>Welcome, #{user.name}!</h1>")
    |> text_body("Welcome, #{user.name}!")
  end

  def password_reset_email(user, token) do
    base_email()
    |> to(user.email)
    |> subject("Reset your password")
    |> html_body("<p>Click <a href=\"https://myapp.com/reset/#{token}\">here</a> to reset.</p>")
    |> text_body("Visit https://myapp.com/reset/#{token} to reset your password.")
  end

  defp base_email do
    new_email()
    |> from("support@myapp.com")
    |> put_header("Reply-To", "help@myapp.com")
  end
end
```

## Send an Email

Use your mailer module to deliver emails. Bamboo provides four delivery functions:

```elixir
# Synchronous — returns {:ok, email} or {:error, error}
MyApp.Email.welcome_email(user) |> MyApp.Mailer.deliver_now()

# Synchronous — raises on failure
MyApp.Email.welcome_email(user) |> MyApp.Mailer.deliver_now!()

# Background — returns {:ok, email} or {:error, error}
MyApp.Email.welcome_email(user) |> MyApp.Mailer.deliver_later()

# Background — raises on failure
MyApp.Email.welcome_email(user) |> MyApp.Mailer.deliver_later!()
```

`deliver_now` sends the email immediately and blocks until the adapter responds. `deliver_later` hands the email off to a background process using Bamboo's `TaskSupervisorStrategy` by default.

For most production use cases, prefer `deliver_later` to avoid blocking your request handling.

## View Sent Emails in Development

When using the `LocalAdapter`, you can add Bamboo's built-in email viewer to your Phoenix router to inspect sent emails in the browser:

```elixir
# lib/my_app_web/router.ex
if Mix.env() == :dev do
  forward "/sent_emails", Bamboo.SentEmailViewerPlug
end
```

Visit `/sent_emails` in your browser to see all emails sent during the current session. This is especially handy for checking password reset links, confirmation emails, and other transactional messages without connecting to an external service.

## Recipients

Bamboo accepts several formats for recipient addresses:

```elixir
# Plain string
new_email(to: "user@example.com")

# Name and address tuple
new_email(to: {"Jane Doe", "jane@example.com"})

# Lists for multiple recipients
new_email(to: ["one@example.com", {"Two", "two@example.com"}])
```

You can also use `cc/2` and `bcc/2`:

```elixir
new_email()
|> to("primary@example.com")
|> cc("team@example.com")
|> bcc(["logs@example.com", "archive@example.com"])
```

For custom structs (like a `%User{}`), implement the `Bamboo.Formatter` protocol so you can pass them directly to `to/2`, `from/2`, and other recipient functions.

## Attachments

Add file attachments to any email:

```elixir
new_email()
|> to("user@example.com")
|> from("app@example.com")
|> subject("Your report")
|> text_body("See attached.")
|> put_attachment("path/to/report.pdf")
```

## Next Steps

- [Adapters](/projects/bamboo/guides/adapters) — Configure adapters for SendGrid, Mailgun, Mandrill, and more
- [Testing](/projects/bamboo/guides/testing) — Test email delivery in your application
- [Cheatsheet](/projects/bamboo/cheatsheet) — Quick reference for all functions
