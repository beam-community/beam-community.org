---
title: Testing Emails
description: Test email delivery in your Elixir application
project: bamboo
order: 3
section: guides
---

# Testing Emails

Bamboo makes email testing straightforward at two levels: unit tests that check the email struct directly, and integration tests that verify emails were actually delivered through your mailer.

## Configure the TestAdapter

Set up `Bamboo.TestAdapter` in your test config so no emails are sent externally during tests:

```elixir
# config/test.exs
config :my_app, MyApp.Mailer,
  adapter: Bamboo.TestAdapter
```

## Unit Testing

Because Bamboo emails are plain structs, you can test email composition without any special setup. Just call your email function and assert against the struct fields:

```elixir
defmodule MyApp.EmailTest do
  use ExUnit.Case

  test "welcome email has the right fields" do
    user = %{name: "Jane", email: "jane@example.com"}
    email = MyApp.Email.welcome_email(user)

    assert email.to == "jane@example.com"
    assert email.from == "support@myapp.com"
    assert email.subject == "Welcome to MyApp!"
    assert email.html_body =~ "Welcome, Jane"
    assert email.text_body =~ "Welcome, Jane"
  end
end
```

No mocking or adapter configuration needed — you're testing pure data.

## Integration Testing with Bamboo.Test

To verify that emails are actually delivered through your mailer, use `Bamboo.Test`. This module provides assertion functions that check whether the `TestAdapter` received specific emails:

```elixir
defmodule MyApp.RegistrationTest do
  use ExUnit.Case
  use Bamboo.Test

  test "registering a user sends a welcome email" do
    user = create_user(%{email: "jane@example.com"})

    MyApp.Registration.register(user)

    assert_delivered_email MyApp.Email.welcome_email(user)
  end
end
```

`assert_delivered_email/1` checks that an email matching the given struct was delivered. It waits up to 100ms before failing, which handles slight timing differences.

## Assertion Functions

### assert_delivered_email

Checks that an exact email was delivered:

```elixir
email = MyApp.Email.welcome_email(user)
MyApp.Mailer.deliver_now!(email)

assert_delivered_email email
```

### assert_email_delivered_with

Checks that an email was delivered matching specific fields. Useful when you don't want to build the full expected email:

```elixir
MyApp.Mailer.deliver_now!(MyApp.Email.welcome_email(user))

assert_email_delivered_with to: [{"Jane", "jane@example.com"}], subject: "Welcome to MyApp!"
```

### assert_delivered_email_matches

Uses pattern matching to check delivered emails. Handy when you only care about certain fields:

```elixir
MyApp.Mailer.deliver_now!(MyApp.Email.welcome_email(user))

assert_delivered_email_matches %{to: [{_, "jane@example.com"}]}
```

### assert_no_emails_delivered

Verifies no emails were sent at all:

```elixir
# After an action that should NOT send email
MyApp.SomeModule.do_something_quiet()

assert_no_emails_delivered()
```

## Refutation Functions

### refute_delivered_email

Asserts that a specific email was NOT delivered:

```elixir
refute_delivered_email MyApp.Email.admin_alert_email()
```

### refute_email_delivered_with

Asserts no email with the given fields was delivered:

```elixir
refute_email_delivered_with to: [{"Admin", "admin@example.com"}]
```

## Testing Async Emails

When emails are sent from a separate process — such as a `Task`, `GenServer`, or during acceptance tests — the default `TestAdapter` won't work because it sends to the calling process. Use shared mode instead:

```elixir
defmodule MyApp.BackgroundJobTest do
  use ExUnit.Case
  use Bamboo.Test, shared: true

  test "background job sends a notification email" do
    MyApp.BackgroundWorker.process_order(order)

    assert_delivered_email MyApp.Email.order_confirmation(order)
  end
end
```

With `shared: true`, the adapter sends emails to a shared process that any test can read from. This is required whenever the code under test spawns a new process to send email.

**Note:** Shared mode prevents async test execution for email assertions. If you use `async: true` on your test module, email assertions may be unreliable in shared mode because multiple tests could see each other's emails.

## Testing Interceptors

If you use interceptors to block certain emails, you can verify that blocked emails are not delivered:

```elixir
defmodule MyApp.InterceptorTest do
  use ExUnit.Case
  use Bamboo.Test

  test "blocked addresses do not receive email" do
    email = MyApp.Email.welcome_email(%{email: "blocked@example.com"})
    MyApp.Mailer.deliver_now(email)

    assert_no_emails_delivered()
  end
end
```

## Testing Tips

- **Unit test composition, integration test delivery.** Test that your email functions produce the right struct, and separately test that your application code calls the mailer at the right time.
- **Use `assert_email_delivered_with` for partial matches.** When you only care about a few fields, partial matching keeps tests focused and less brittle.
- **Use `shared: true` sparingly.** Only enable it when you're testing code that sends email from a spawned process.
- **Check both text and HTML bodies.** If you send multipart emails, make sure both the plain text and HTML versions have the right content.
