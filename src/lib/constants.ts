import type { Project, OrgStats } from "./types";

export const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#get-involved", label: "Get Involved" },
];

export const GITHUB_ORG_URL = "https://github.com/beam-community";

export const ABOUT_FEATURES = [
  {
    icon: "lucide:package",
    title: "Package Stewardship",
    description:
      "We adopt and maintain critical open source packages that the ecosystem depends on.",
  },
  {
    icon: "lucide:users",
    title: "Community Maintenance",
    description:
      "A team of dedicated maintainers ensures libraries stay healthy and up to date.",
  },
  {
    icon: "lucide:trending-up",
    title: "Ecosystem Growth",
    description:
      "We help the Elixir and Erlang ecosystem thrive by filling gaps and nurturing new projects.",
  },
  {
    icon: "lucide:shield-check",
    title: "Quality Standards",
    description:
      "Projects follow consistent standards for testing, documentation, and release management.",
  },
];

export const INVOLVEMENT_CARDS = [
  {
    icon: "lucide:git-pull-request",
    title: "Contribute Code",
    description:
      "Browse issues across our projects and submit pull requests. Every contribution matters.",
    linkText: "Find issues",
    linkUrl:
      "https://github.com/orgs/beam-community/repositories",
  },
  {
    icon: "lucide:heart-handshake",
    title: "Adopt a Project",
    description:
      "Have an Elixir or Erlang package the community depends on? We can help maintain it long-term.",
    linkText: "Get in touch",
    linkUrl: "https://github.com/beam-community/beam-community.org/issues/new",
  },
  {
    icon: "lucide:star",
    title: "Spread the Word",
    description:
      "Star our projects, share them with your team, and help us grow the BEAM community.",
    linkText: "Visit GitHub",
    linkUrl: "https://github.com/beam-community",
  },
];

export const FOOTER_LINKS = [
  { label: "GitHub", url: "https://github.com/beam-community", icon: "simple-icons:github" },
  { label: "Hex.pm", url: "https://hex.pm", icon: "simple-icons:elixir" },
  { label: "Elixir Forum", url: "https://elixirforum.com", icon: "lucide:message-circle" },
  { label: "Erlang Ecosystem Foundation", url: "https://erlef.org", icon: "lucide:globe" },
];

export const FALLBACK_PROJECTS: Project[] = [
  {
    name: "ex_machina",
    description: "Create test data for Elixir applications",
    stars: 2041,
    forks: 146,
    language: "Elixir",
    topics: ["elixir", "testing"],
    url: "https://github.com/beam-community/ex_machina",
    homepage: "https://hex.pm/packages/ex_machina",
    isFeatured: true,
  },
  {
    name: "bamboo",
    description:
      "Testable, composable, and adapter based Elixir email library for devs that love piping",
    stars: 1951,
    forks: 344,
    language: "Elixir",
    topics: ["elixir", "email"],
    url: "https://github.com/beam-community/bamboo",
    homepage: "https://hex.pm/packages/bamboo",
    isFeatured: true,
  },
  {
    name: "elixir-companies",
    description: "A list of companies currently using Elixir in production",
    stars: 1663,
    forks: 367,
    language: "Elixir",
    topics: ["elixir"],
    url: "https://github.com/beam-community/elixir-companies",
    homepage: null,
    isFeatured: true,
  },
  {
    name: "stripity-stripe",
    description: "An Elixir Library for Stripe",
    stars: 990,
    forks: 340,
    language: "Elixir",
    topics: ["elixir", "stripe"],
    url: "https://github.com/beam-community/stripity-stripe",
    homepage: "https://hex.pm/packages/stripity_stripe",
    isFeatured: true,
  },
  {
    name: "jsonapi",
    description: "JSON:API Serializer and Query Handler for Elixir",
    stars: 504,
    forks: 158,
    language: "Elixir",
    topics: ["elixir", "json-api"],
    url: "https://github.com/beam-community/jsonapi",
    homepage: "https://hex.pm/packages/jsonapi",
    isFeatured: true,
  },
  {
    name: "avro_ex",
    description: "An Avro Library that emphasizes testability and ease of use",
    stars: 61,
    forks: 25,
    language: "Elixir",
    topics: ["elixir", "avro"],
    url: "https://github.com/beam-community/avro_ex",
    homepage: "https://hex.pm/packages/avro_ex",
    isFeatured: true,
  },
  {
    name: "ueberauth",
    description:
      "An Elixir Authentication System for Plug-based Web Applications",
    stars: 51,
    forks: 7,
    language: "Elixir",
    topics: ["elixir", "authentication"],
    url: "https://github.com/beam-community/ueberauth",
    homepage: "https://hex.pm/packages/ueberauth",
    isFeatured: false,
  },
  {
    name: "elixirschool",
    description:
      "The premier destination for people looking to learn and master the Elixir programming language",
    stars: 16,
    forks: 4,
    language: "Elixir",
    topics: ["elixir", "education"],
    url: "https://github.com/beam-community/elixirschool",
    homepage: "https://elixirschool.com",
    isFeatured: false,
  },
];

export const FALLBACK_STATS: OrgStats = {
  totalStars: 7900,
  totalForks: 1400,
  projectCount: 15,
  memberCount: 21,
};
