---
title: Working with Associations
description: Define and use factories with Ecto associations
project: ex_machina
order: 2
section: guides
---

# Working with Associations

ExMachina handles Ecto associations in factories so you don't have to manually create and link related records. This guide covers how to define factories with `belongs_to`, `has_many`, and other relationships.

## belongs_to Associations

Use `build` to define the associated record in your factory. When you `insert` the parent, ExMachina automatically inserts the association first:

```elixir
def article_factory do
  %MyApp.Article{
    title: sequence(:title, &"Article #{&1}"),
    body: "Some content",
    author: build(:user)
  }
end
```

Now when you call `insert(:article)`, ExMachina will:

1. Build the article with a built user
2. Insert the user into the database
3. Set the `author_id` foreign key on the article
4. Insert the article

```elixir
article = insert(:article)
article.author    # => %MyApp.User{id: 1, ...}
article.author_id # => 1
```

### Overriding the Association

Pass the association as an override to use a specific record:

```elixir
author = insert(:user, name: "Specific Author")
article = insert(:article, author: author)

article.author.name # => "Specific Author"
```

### Why build Instead of insert?

Always use `build` (not `insert`) for associations in factory definitions. ExMachina handles inserting when needed. If you use `insert` inside a factory, the associated record gets inserted every time — even when you only call `build(:article)`, which is unexpected.

```elixir
# Good — association is built, inserted only when parent is inserted
def article_factory do
  %MyApp.Article{
    author: build(:user)
  }
end

# Bad — user gets inserted into the database even with build(:article)
def article_factory do
  %MyApp.Article{
    author: insert(:user)
  }
end
```

## has_many Associations

For `has_many` relationships, you typically don't define the children in the parent factory. Instead, create them in your test and pass the parent as an override:

```elixir
def comment_factory do
  %MyApp.Comment{
    body: "Great article!",
    article: build(:article)
  }
end

# In your test
article = insert(:article)
comments = insert_list(3, :comment, article: article)
```

If you need a factory that always includes children, use a helper function:

```elixir
def with_comments(article, count \\ 3) do
  insert_list(count, :comment, article: article)
  article
end

# Usage
article = insert(:article) |> with_comments(5)
```

## Nested Associations

Associations can be nested. If a comment belongs to an article that belongs to a user, ExMachina handles the full chain:

```elixir
def comment_factory do
  %MyApp.Comment{
    body: "A comment",
    article: build(:article)
  }
end

def article_factory do
  %MyApp.Article{
    title: "An article",
    author: build(:user)
  }
end

# Inserting a comment automatically creates the article and its author
comment = insert(:comment)
comment.article.author # => %MyApp.User{...}
```

### Sharing a Parent Across Children

When creating multiple records that should share the same parent, pass it explicitly:

```elixir
author = insert(:user)
articles = insert_list(3, :article, author: author)
# All three articles belong to the same author
```

Without the explicit override, each article would get its own auto-generated author.

## Lazy Evaluation with Functions

Use anonymous functions to delay association creation. This is useful when the association depends on the parent's attributes:

```elixir
def account_factory do
  %MyApp.Account{
    plan: "premium",
    owner: fn -> build(:user) end
  }
end
```

The function is called when the factory is evaluated, not when it's defined. You can also receive the parent record as an argument:

```elixir
def account_factory do
  %MyApp.Account{
    plan: "premium",
    owner: fn account ->
      build(:user, vip: account.plan == "premium")
    end
  }
end
```

When overriding lazy attributes at call time, wrap the override in a function too:

```elixir
insert_pair(:account, owner: fn -> build(:user, name: "Shared") end)
```

## many_to_many Associations

For many-to-many relationships, create the associations separately and link them:

```elixir
def article_factory do
  %MyApp.Article{
    title: sequence(:title, &"Article #{&1}"),
    tags: []
  }
end

def tag_factory do
  %MyApp.Tag{
    name: sequence(:tag, &"tag-#{&1}")
  }
end

# In your test
tags = insert_list(2, :tag)
article = insert(:article, tags: tags)
```

How this works depends on your Ecto schema setup. If you use a join table with `many_to_many`, you may need to handle the join records separately.

## Params with Associations

The params functions handle associations differently:

- `params_for/2` strips `belongs_to` associations and foreign keys
- `params_with_assocs/2` inserts `belongs_to` associations and includes the foreign key IDs
- `has_many` and `has_one` associations are recursively converted to maps

```elixir
# No association data — useful for create actions where the parent is set separately
params_for(:article)
# => %{title: "Article 0", body: "Some content"}

# Inserts author, includes author_id — useful for nested create forms
params_with_assocs(:article)
# => %{title: "Article 0", body: "Some content", author_id: 1}

# String keys for controller params
string_params_with_assocs(:article)
# => %{"title" => "Article 0", "body" => "Some content", "author_id" => 1}
```

## Tips

- **Use `build` in factory definitions** for all associations. Let ExMachina decide when to insert.
- **Override associations in tests** to control relationships precisely and avoid unnecessary database records.
- **Use helper functions** like `with_comments/2` for common patterns that add children to a parent.
- **Share parents explicitly** when multiple records need to reference the same associated record.
