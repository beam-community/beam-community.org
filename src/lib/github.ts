import type { Project, OrgStats } from "./types";
import { FALLBACK_PROJECTS, FALLBACK_STATS } from "./constants";

const GITHUB_API = "https://api.github.com";
const ORG = "beam-community";

const EXCLUDED_REPOS = new Set([
  "beam-community.org",
  "common-config",
  "actions-sync",
  "actions-pr-title",
]);

const FEATURED_COUNT = 6;

function headers(): HeadersInit {
  const h: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };
  const token = import.meta.env.GITHUB_TOKEN;
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  return h;
}

export async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch(
      `${GITHUB_API}/orgs/${ORG}/repos?per_page=100&sort=stars&direction=desc`,
      { headers: headers() },
    );
    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);

    const repos = await res.json();

    const projects: Project[] = repos
      .filter(
        (r: Record<string, unknown>) =>
          !r.archived && !EXCLUDED_REPOS.has(r.name as string),
      )
      .map((r: Record<string, unknown>) => ({
        name: r.name as string,
        description: (r.description as string) || "",
        stars: r.stargazers_count as number,
        forks: r.forks_count as number,
        language: r.language as string | null,
        topics: (r.topics as string[]) || [],
        url: r.html_url as string,
        homepage: r.homepage as string | null,
        isFeatured: false,
      }));

    projects.sort((a, b) => b.stars - a.stars);
    projects.slice(0, FEATURED_COUNT).forEach((p) => (p.isFeatured = true));

    return projects;
  } catch (e) {
    console.warn("Failed to fetch projects from GitHub API, using fallback:", e);
    return FALLBACK_PROJECTS;
  }
}

export async function getOrgStats(
  projects: Project[],
): Promise<OrgStats> {
  const totalStars = projects.reduce((sum, p) => sum + p.stars, 0);
  const totalForks = projects.reduce((sum, p) => sum + p.forks, 0);

  try {
    const res = await fetch(`${GITHUB_API}/orgs/${ORG}/members?per_page=100`, {
      headers: headers(),
    });
    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
    const members = await res.json();

    return {
      totalStars,
      totalForks,
      projectCount: projects.length,
      memberCount: Array.isArray(members) ? members.length : FALLBACK_STATS.memberCount,
    };
  } catch {
    return {
      totalStars,
      totalForks,
      projectCount: projects.length,
      memberCount: FALLBACK_STATS.memberCount,
    };
  }
}
