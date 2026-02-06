export interface Project {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  url: string;
  homepage: string | null;
  isFeatured: boolean;
}

export interface OrgStats {
  totalStars: number;
  totalForks: number;
  projectCount: number;
  totalDownloads: number;
}
