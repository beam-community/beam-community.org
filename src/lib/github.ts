import type { Project, OrgStats } from "./types";
import { FALLBACK_PROJECTS, FALLBACK_STATS } from "./constants";

const GITHUB_API = "https://api.github.com";
const HEX_API = "https://hex.pm/api";
const ORG = "beam-community";

const EXCLUDED_REPOS = new Set([
  "beam-community.org",
  "common-config",
  "actions-sync",
  "actions-pr-title",
]);

const FEATURED_COUNT = 6;

function githubHeaders(): HeadersInit {
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
      { headers: githubHeaders() },
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

async function getTotalDownloads(projects: Project[]): Promise<number> {
  try {
    const results = await Promise.allSettled(
      projects.map(async (p) => {
        const pkgName = p.name.replace(/-/g, "_");
        const res = await fetch(`${HEX_API}/packages/${pkgName}`);
        if (!res.ok) return 0;
        const data = await res.json();
        return (data?.downloads?.all as number) ?? 0;
      }),
    );
    return results.reduce((sum, r) => sum + (r.status === "fulfilled" ? r.value : 0), 0);
  } catch {
    return FALLBACK_STATS.totalDownloads;
  }
}

export async function getOrgStats(
  projects: Project[],
): Promise<OrgStats> {
  const totalStars = projects.reduce((sum, p) => sum + p.stars, 0);
  const totalForks = projects.reduce((sum, p) => sum + p.forks, 0);
  const totalDownloads = await getTotalDownloads(projects);

  return {
    totalStars,
    totalForks,
    projectCount: projects.length,
    totalDownloads,
  };
}
