---
title: Bamboo
description: Testable, composable, and adapter-based Elixir email library
project: bamboo
order: 0
section: overview
---

# Bamboo

Bamboo is an Elixir library for composing and delivering email. It separates email creation from delivery, letting you build emails with a clean pipe-based API and send them through pluggable adapters for services like SendGrid, Mailgun, and Mandrill.

## Why Bamboo?

**Composable by design** — Emails are plain structs built through function pipelines. You can create shared base emails, layer on recipients and content, and pass them around like any other data.

**Adapter-based delivery** — Swap between email providers by changing a single configuration line. Use a local adapter during development, a test adapter in your test suite, and a production adapter like SendGrid when you deploy.

**Built for testing** — Because emails are just structs, unit tests can assert directly against fields without mocking. For integration tests, the included `TestAdapter` and assertion helpers make it straightforward to verify emails were sent with the right content.

**Phoenix integration** — The companion `bamboo_phoenix` package lets you render email bodies using Phoenix views and layouts, so you can share templates across your application.

## Core Concepts

Bamboo is organized around three main pieces:

- **Email** — A struct representing a message. You build one using functions from `Bamboo.Email` like `new_email/1`, `to/2`, `from/2`, `subject/2`, and `html_body/2`.
- **Mailer** — A module in your application that sends emails. You define one with `use Bamboo.Mailer, otp_app: :my_app` and call `deliver_now/1` or `deliver_later/1` on it.
- **Adapter** — The backend that actually transmits the email. Bamboo ships with adapters for Mandrill, SendGrid, Mailgun, and local/test usage, with many more available from the community.

## Quick Look

```elixir
import Bamboo.Email

new_email()
|> to("user@example.com")
|> from("app@example.com")
|> subject("Welcome!")
|> text_body("Thanks for signing up.")
|> MyApp.Mailer.deliver_now!()
```

## Next Steps

- [Getting Started](/projects/bamboo/getting-started) — Install Bamboo and send your first email
- [Adapters](/projects/bamboo/guides/adapters) — Configure delivery for your email provider
- [Testing](/projects/bamboo/guides/testing) — Write tests that verify email delivery
- [Cheatsheet](/projects/bamboo/cheatsheet) — Quick reference for common functions and patterns
