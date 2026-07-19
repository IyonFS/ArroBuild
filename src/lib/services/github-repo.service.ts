export interface GitHubRepoData {
  owner: string;
  repo: string;
  name: string;
  description: string | null;
  language: string | null;
  languages: string[];
  techStack: string[];
  hasPackageJson: boolean;
  packageName: string | null;
  folderStructure: string[];
  existingReadme: string | null;
  /** True when repo exists but structure is incomplete (empty / no package.json) */
  incomplete?: boolean;
}

export type GitHubRepoErrorCode =
  | "INVALID_URL"
  | "NOT_FOUND"
  | "RATE_LIMIT"
  | "API_ERROR";

export class GitHubRepoError extends Error {
  constructor(
    public code: GitHubRepoErrorCode,
    message: string
  ) {
    super(message);
    this.name = "GitHubRepoError";
  }
}

const GITHUB_URL_RE =
  /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/?(?:\.git)?$/;

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const trimmed = url.trim();
  const match = trimmed.match(GITHUB_URL_RE);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

async function githubFetch(path: string): Promise<Response> {
  const token = process.env.GITHUB_TOKEN?.trim();
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "ArroBuild-README-Generator",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`https://api.github.com${path}`, { headers, next: { revalidate: 0 } });
}

function decodeBase64Content(content: string): string {
  return Buffer.from(content, "base64").toString("utf-8");
}

function inferTechStack(
  languages: string[],
  packageJson: Record<string, unknown> | null
): string[] {
  const stack = new Set<string>(languages);

  if (packageJson) {
    const deps = {
      ...(packageJson.dependencies as Record<string, string> | undefined),
      ...(packageJson.devDependencies as Record<string, string> | undefined),
    };

    if (deps.next) stack.add("Next.js");
    if (deps.react) stack.add("React");
    if (deps.vue) stack.add("Vue");
    if (deps["@nestjs/core"]) stack.add("NestJS");
    if (deps.express) stack.add("Express");
    if (deps.tailwindcss) stack.add("Tailwind CSS");
    if (deps.prisma || deps["@prisma/client"]) stack.add("Prisma");
    if (deps.typescript || deps["@types/node"]) stack.add("TypeScript");
  }

  return Array.from(stack);
}

export async function fetchGitHubRepo(url: string): Promise<GitHubRepoData> {
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    throw new GitHubRepoError(
      "INVALID_URL",
      "URL tidak valid. Format yang benar: github.com/username/repo"
    );
  }

  const { owner, repo } = parsed;

  const repoRes = await githubFetch(`/repos/${owner}/${repo}`);
  if (repoRes.status === 404) {
    throw new GitHubRepoError(
      "NOT_FOUND",
      "Repo ini private atau tidak ditemukan. ArroBuild cuma bisa baca repo publik."
    );
  }
  if (repoRes.status === 403) {
    const body = await repoRes.text();
    if (body.toLowerCase().includes("rate limit")) {
      throw new GitHubRepoError(
        "RATE_LIMIT",
        "GitHub API rate limit tercapai. Coba lagi beberapa menit."
      );
    }
    throw new GitHubRepoError(
      "NOT_FOUND",
      "Repo ini private atau tidak ditemukan. ArroBuild cuma bisa baca repo publik."
    );
  }
  if (!repoRes.ok) {
    throw new GitHubRepoError("API_ERROR", "Gagal mengambil data dari GitHub.");
  }

  const repoData = (await repoRes.json()) as {
    name: string;
    description: string | null;
    language: string | null;
  };

  const [langRes, contentsRes] = await Promise.all([
    githubFetch(`/repos/${owner}/${repo}/languages`),
    githubFetch(`/repos/${owner}/${repo}/contents/`),
  ]);

  const languages: string[] = langRes.ok
    ? Object.keys((await langRes.json()) as Record<string, number>)
    : repoData.language
      ? [repoData.language]
      : [];

  let folderStructure: string[] = [];
  let hasPackageJson = false;
  let packageName: string | null = null;
  let packageJson: Record<string, unknown> | null = null;

  if (contentsRes.ok) {
    const contents = (await contentsRes.json()) as Array<{ name: string; type: string }>;
    folderStructure = contents
      .filter((c) => c.type === "dir" || c.name.match(/\.(json|md|ts|js|py|go|rs|toml|yml|yaml)$/))
      .map((c) => (c.type === "dir" ? `${c.name}/` : c.name))
      .slice(0, 20);

    hasPackageJson = contents.some((c) => c.name === "package.json");

    if (hasPackageJson) {
      const pkgRes = await githubFetch(`/repos/${owner}/${repo}/contents/package.json`);
      if (pkgRes.ok) {
        const pkgData = (await pkgRes.json()) as { content: string };
        try {
          packageJson = JSON.parse(decodeBase64Content(pkgData.content)) as Record<
            string,
            unknown
          >;
          packageName = (packageJson.name as string) ?? null;
        } catch {
          // ignore parse errors
        }
      }
    }
  }

  let existingReadme: string | null = null;
  for (const readmeName of ["README.md", "readme.md", "Readme.md"]) {
    const readmeRes = await githubFetch(`/repos/${owner}/${repo}/contents/${readmeName}`);
    if (readmeRes.ok) {
      const readmeData = (await readmeRes.json()) as { content: string };
      existingReadme = decodeBase64Content(readmeData.content);
      break;
    }
  }

  const techStack = inferTechStack(languages, packageJson);

  // PRD: incomplete when repo empty OR no package.json (structure not fully readable)
  const incomplete = folderStructure.length === 0 || !hasPackageJson;

  return {
    owner,
    repo,
    name: repoData.name,
    description: repoData.description,
    language: repoData.language,
    languages,
    techStack,
    hasPackageJson,
    packageName,
    folderStructure,
    existingReadme,
    incomplete,
  };
}
