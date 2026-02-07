---
title: Adapters
description: Configure email adapters for different providers
project: bamboo
order: 2
section: guides
---

# Adapters

Bamboo uses adapters to deliver emails through different providers. You configure an adapter once in your application config, and your email-sending code stays the same regardless of which service you use.

## How Adapters Work

When you call `deliver_now/1` or `deliver_later/1` on your mailer, Bamboo passes the email struct to the configured adapter. The adapter handles the provider-specific details — API authentication, request formatting, and error handling.

This separation means you can use `Bamboo.LocalAdapter` during development, `Bamboo.TestAdapter` in tests, and a production adapter like `Bamboo.SendGridAdapter` in production, all without changing any of your email-building code.

## Built-in Adapters

### LocalAdapter

Stores emails in memory for development. Pair it with `Bamboo.SentEmailViewerPlug` to inspect emails in your browser.

```elixir
# config/dev.exs
config :my_app, MyApp.Mailer,
  adapter: Bamboo.LocalAdapter
```

### TestAdapter

Designed for test suites. Sends emails to the current process so you can make assertions about delivery.

```elixir
# config/test.exs
config :my_app, MyApp.Mailer,
  adapter: Bamboo.TestAdapter
```

See the [Testing guide](/projects/bamboo/guides/testing) for details on writing email tests.

### SendGridAdapter

Delivers email through the SendGrid API.

```elixir
# config/prod.exs
config :my_app, MyApp.Mailer,
  adapter: Bamboo.SendGridAdapter,
  api_key: System.get_env("SENDGRID_API_KEY")
```

The `Bamboo.SendGridHelper` module provides additional functions for SendGrid-specific features like transactional templates and substitution tags.

### MandrillAdapter

Delivers email through the Mandrill API (Mailchimp Transactional).

```elixir
config :my_app, MyApp.Mailer,
  adapter: Bamboo.MandrillAdapter,
  api_key: System.get_env("MANDRILL_API_KEY")
```

The `Bamboo.MandrillHelper` module adds support for tags, merge variables, templates, and scheduled delivery.

### MailgunAdapter

Delivers email through the Mailgun API.

```elixir
config :my_app, MyApp.Mailer,
  adapter: Bamboo.MailgunAdapter,
  api_key: System.get_env("MAILGUN_API_KEY"),
  domain: System.get_env("MAILGUN_DOMAIN")
```

## Community Adapters

The community maintains adapters for many additional providers:

| Adapter | Provider |
|---------|----------|
| `bamboo_ses` | Amazon SES |
| `bamboo_smtp` | Any SMTP server |
| `bamboo_postmark` | Postmark |
| `bamboo_sparkpost` | SparkPost |
| `bamboo_mailjet` | Mailjet |
| `bamboo_gmail` | Gmail |
| `bamboo_campaign_monitor` | Campaign Monitor |
| `bamboo_sendcloud` | Sendcloud |
| `bamboo_config_adapter` | Config-based routing |
| `bamboo_fallback_adapter` | Fallback chains |
| `bamboo_mailtrap` | Mailtrap (Sending and Sandbox) |

Install community adapters as separate Hex packages. For example:

```elixir
defp deps do
  [
    {:bamboo, "~> 2.3.0"},
    {:bamboo_ses, "~> 0.4.0"}
  ]
end
```

## Hackney Options

All HTTP-based adapters use Hackney under the hood. You can configure timeouts and other Hackney options:

```elixir
config :my_app, MyApp.Mailer,
  adapter: Bamboo.SendGridAdapter,
  api_key: System.get_env("SENDGRID_API_KEY"),
  hackney_opts: [
    recv_timeout: :timer.minutes(1),
    connect_timeout: :timer.minutes(1)
  ]
```

## Interceptors

Interceptors let you modify or block emails before they reach the adapter. This is useful for filtering recipients, adding headers, or preventing emails to certain addresses.

Configure interceptors on your mailer:

```elixir
config :my_app, MyApp.Mailer,
  adapter: Bamboo.SendGridAdapter,
  api_key: "...",
  interceptors: [MyApp.EmailInterceptor]
```

An interceptor implements the `Bamboo.Interceptor` behaviour with a single `call/1` function that receives and returns an email:

```elixir
defmodule MyApp.EmailInterceptor do
  @behaviour Bamboo.Interceptor

  @blocked ["blocked@example.com"]

  def call(email) do
    if Enum.any?(Bamboo.Email.all_recipients(email), fn {_, addr} -> addr in @blocked end) do
      Bamboo.Email.block(email)
    else
      email
    end
  end
end
```

Blocked emails are silently dropped — the adapter never sees them.

## Writing a Custom Adapter

To integrate with a provider that doesn't have an existing adapter, implement the `Bamboo.Adapter` behaviour:

```elixir
defmodule MyApp.CustomAdapter do
  @behaviour Bamboo.Adapter

  @impl true
  def deliver(email, config) do
    # Send the email using your provider's API
    # Return {:ok, response} or {:error, reason}
  end

  @impl true
  def handle_config(config) do
    # Validate and transform config at startup
    config
  end

  @impl true
  def supports_attachments?, do: true
end
```

The `deliver/2` function receives a normalized `%Bamboo.Email{}` struct and the adapter configuration. The `handle_config/1` function runs at compile time to validate configuration.

## Environment-Based Configuration

A typical setup uses different adapters per environment:

```elixir
# config/dev.exs
config :my_app, MyApp.Mailer,
  adapter: Bamboo.LocalAdapter

# config/test.exs
config :my_app, MyApp.Mailer,
  adapter: Bamboo.TestAdapter

# config/prod.exs
config :my_app, MyApp.Mailer,
  adapter: Bamboo.SendGridAdapter,
  api_key: System.get_env("SENDGRID_API_KEY")
```

This ensures you never accidentally send real emails from development or test environments.
