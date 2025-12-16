import type { StackProfile, BehaviorProfile } from "@/shared/types";
import AdmZip from "adm-zip";

export interface AppContent {
  files: Map<string, string>; // filename -> content
  packageJson?: Record<string, unknown>;
  requirements?: string; // python requirements
}

/**
 * Detects the technology stack from app content
 * Returns: runtime, framework, database, external dependencies
 */
export async function detectStack(
  appContent: AppContent,
): Promise<StackProfile> {
  const stackProfile: StackProfile = {
    external_apis: [],
    databases: [],
  };

  // Node.js detection
  if (appContent.packageJson) {
    stackProfile.runtime = "Node.js";

    const deps = {
      ...(appContent.packageJson.dependencies as Record<string, string> || {}),
      ...(appContent.packageJson.devDependencies as Record<string, string> || {}),
    };

    // Detect framework
    const frameworks = {
      express: "Express",
      fastify: "Fastify",
      next: "Next.js",
      nuxt: "Nuxt",
      koa: "Koa",
      hapi: "@hapi/hapi",
      "@nestjs/core": "NestJS",
    };

    for (const [pkg, name] of Object.entries(frameworks)) {
      if (deps[pkg]) {
        stackProfile.framework = name;
        break;
      }
    }

    // Detect databases
    const dbMapping: Record<string, string> = {
      pg: "PostgreSQL",
      mongoose: "MongoDB",
      mongodb: "MongoDB",
      sqlite3: "SQLite",
      "better-sqlite3": "SQLite",
      mysql2: "MySQL",
      mysql: "MySQL",
      "@prisma/client": "Prisma",
      prisma: "Prisma",
    };

    for (const [pkg, db] of Object.entries(dbMapping)) {
      if (deps[pkg] && !stackProfile.databases?.includes(db)) {
        stackProfile.databases?.push(db);
      }
    }

    if (stackProfile.databases && stackProfile.databases.length > 0) {
      stackProfile.database = stackProfile.databases[0];
    }

    // Detect external APIs
    const apiPatterns: Record<string, string> = {
      stripe: "Stripe",
      twilio: "Twilio",
      "@sendgrid/mail": "SendGrid",
      sendgrid: "SendGrid",
      "aws-sdk": "AWS",
      "@aws-sdk": "AWS",
      "@google-cloud": "Google Cloud",
      firebase: "Firebase",
      "firebase-admin": "Firebase",
    };

    for (const [pkg, api] of Object.entries(apiPatterns)) {
      if (Object.keys(deps).some((dep) => dep.includes(pkg))) {
        stackProfile.external_apis?.push(api);
      }
    }

    // Detect deployment platform
    if (appContent.files.has("vercel.json")) {
      stackProfile.deployment_platform = "Vercel";
    } else if (
      appContent.files.has("replit.nix") ||
      appContent.files.has(".replit")
    ) {
      stackProfile.deployment_platform = "Replit";
    } else if (appContent.files.has("fly.toml")) {
      stackProfile.deployment_platform = "Fly.io";
    } else if (appContent.files.has("railway.json")) {
      stackProfile.deployment_platform = "Railway";
    }

    // Detect background jobs
    stackProfile.has_background_jobs =
      !!deps.bull || !!deps.agenda || !!deps["node-cron"];

    // Detect file uploads
    stackProfile.has_file_uploads =
      !!deps.multer || !!deps.formidable || !!deps.busboy;
  }

  // Python detection
  if (appContent.requirements) {
    stackProfile.runtime = "Python";

    const reqLower = appContent.requirements.toLowerCase();

    // Detect framework
    if (reqLower.includes("django")) {
      stackProfile.framework = "Django";
    } else if (reqLower.includes("flask")) {
      stackProfile.framework = "Flask";
    } else if (reqLower.includes("fastapi")) {
      stackProfile.framework = "FastAPI";
    }

    // Detect databases
    if (reqLower.includes("psycopg")) {
      stackProfile.databases?.push("PostgreSQL");
    }
    if (reqLower.includes("pymongo")) {
      stackProfile.databases?.push("MongoDB");
    }
    if (reqLower.includes("mysql")) {
      stackProfile.databases?.push("MySQL");
    }

    if (stackProfile.databases && stackProfile.databases.length > 0) {
      stackProfile.database = stackProfile.databases[0];
    }
  }

  // Deduplicate external_apis
  stackProfile.external_apis = [...new Set(stackProfile.external_apis)];

  return stackProfile;
}

/**
 * Analyzes code patterns to understand app behavior
 * Returns: statefulness, write-heavy patterns, background jobs, etc
 */
export async function analyzePatterns(
  appContent: AppContent,
): Promise<BehaviorProfile> {
  const behaviorProfile: BehaviorProfile = {
    is_stateful: false,
    write_heavy: false,
    has_background_jobs: false,
    has_file_uploads: false,
    estimated_concurrency_risk: "low",
    external_dependency_count: 0,
  };

  let writeCount = 0;
  let readCount = 0;
  const codeContent = Array.from(appContent.files.values()).join("\n");

  // Detect statefulness
  const statePatterns = [
    /global\s+\w+\s*=/i,
    /session\[/i,
    /sessionStorage/i,
    /localStorage/i,
    /\.cache/i,
    /memoryStore/i,
    /new\s+Map\(/,
    /new\s+Set\(/,
  ];

  behaviorProfile.is_stateful = statePatterns.some((pattern) =>
    pattern.test(codeContent)
  );

  // Detect write-heavy patterns
  const writePatterns = [
    /INSERT\s+INTO/gi,
    /UPDATE\s+\w+\s+SET/gi,
    /DELETE\s+FROM/gi,
    /\.save\(/gi,
    /\.create\(/gi,
    /\.update\(/gi,
    /\.delete\(/gi,
    /\.write\(/gi,
    /\.writeFile/gi,
  ];

  const readPatterns = [
    /SELECT\s+/gi,
    /\.find\(/gi,
    /\.findOne\(/gi,
    /\.get\(/gi,
    /\.read\(/gi,
    /\.readFile/gi,
  ];

  writePatterns.forEach((pattern) => {
    const matches = codeContent.match(pattern);
    writeCount += matches ? matches.length : 0;
  });

  readPatterns.forEach((pattern) => {
    const matches = codeContent.match(pattern);
    readCount += matches ? matches.length : 0;
  });

  behaviorProfile.write_heavy = writeCount > readCount;

  // Detect background jobs
  const bgJobPatterns = [
    /setTimeout/i,
    /setInterval/i,
    /bull/i,
    /agenda/i,
    /node-cron/i,
    /cron/i,
    /celery/i,
    /\.delay\(/i,
    /\.apply_async/i,
  ];

  behaviorProfile.has_background_jobs = bgJobPatterns.some((pattern) =>
    pattern.test(codeContent)
  );

  // Detect file uploads
  const uploadPatterns = [
    /multer/i,
    /formidable/i,
    /busboy/i,
    /werkzeug/i,
    /upload\(/i,
    /multipart\/form-data/i,
  ];

  behaviorProfile.has_file_uploads = uploadPatterns.some((pattern) =>
    pattern.test(codeContent)
  );

  // Count external dependencies
  if (appContent.packageJson) {
    const deps = {
      ...(appContent.packageJson.dependencies as Record<string, string> || {}),
      ...(appContent.packageJson.devDependencies as Record<string, string> || {}),
    };
    behaviorProfile.external_dependency_count = Object.keys(deps).length;
  }

  // Estimate concurrency risk
  const stackProfile = await detectStack(appContent);
  const isSQLite = stackProfile.database?.toLowerCase().includes("sqlite");
  const hasPooling = /pool/i.test(codeContent);

  if ((isSQLite && behaviorProfile.write_heavy) ||
      (behaviorProfile.is_stateful && !hasPooling)) {
    behaviorProfile.estimated_concurrency_risk = "high";
  } else if (
    behaviorProfile.has_background_jobs ||
    behaviorProfile.external_dependency_count > 10
  ) {
    behaviorProfile.estimated_concurrency_risk = "medium";
  } else {
    behaviorProfile.estimated_concurrency_risk = "low";
  }

  return behaviorProfile;
}

/**
 * Parses uploaded ZIP file and extracts content
 */
export async function parseZipUpload(zipBuffer: Buffer): Promise<AppContent> {
  const appContent: AppContent = {
    files: new Map(),
  };

  try {
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();

    // Directories and files to skip
    const skipPatterns = [
      /node_modules\//,
      /\.git\//,
      /\.next\//,
      /dist\//,
      /build\//,
      /__pycache__\//,
      /\.lock$/,
      /package-lock\.json$/,
      /yarn\.lock$/,
      /pnpm-lock\.yaml$/,
    ];

    for (const entry of zipEntries) {
      // Skip directories and unwanted files
      if (entry.isDirectory) continue;

      const shouldSkip = skipPatterns.some((pattern) =>
        pattern.test(entry.entryName)
      );

      if (shouldSkip) continue;

      try {
        const content = entry.getData().toString("utf8");
        appContent.files.set(entry.entryName, content);

        // Extract package.json
        if (entry.entryName.endsWith("package.json")) {
          try {
            appContent.packageJson = JSON.parse(content);
          } catch (e) {
            console.warn("Failed to parse package.json:", e);
          }
        }

        // Extract requirements.txt
        if (entry.entryName.endsWith("requirements.txt")) {
          appContent.requirements = content;
        }
      } catch (e) {
        // Skip binary files or files that can't be read as UTF-8
        console.warn(`Failed to read file ${entry.entryName}:`, e);
      }
    }
  } catch (error) {
    throw new Error(`Failed to parse ZIP file: ${error instanceof Error ? error.message : String(error)}`);
  }

  return appContent;
}

/**
 * Clones a GitHub repo and extracts content
 */
export async function cloneGitHubRepo(githubUrl: string): Promise<AppContent> {
  const appContent: AppContent = {
    files: new Map(),
  };

  // Validate and parse GitHub URL
  const httpsPattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(\.git)?$/;
  const sshPattern = /^git@github\.com:([^/]+)\/(.+?)\.git$/;

  let owner: string | null = null;
  let repo: string | null = null;

  const httpsMatch = githubUrl.match(httpsPattern);
  const sshMatch = githubUrl.match(sshPattern);

  if (httpsMatch) {
    owner = httpsMatch[1];
    repo = httpsMatch[2];
  } else if (sshMatch) {
    owner = sshMatch[1];
    repo = sshMatch[2];
  } else {
    throw new Error("Invalid GitHub URL format. Expected https://github.com/owner/repo or git@github.com:owner/repo.git");
  }

  // Get GitHub token from environment
  const githubToken = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };

  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }

  try {
    // Fetch repository tree
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;
    const treeResponse = await fetch(treeUrl, { headers });

    if (!treeResponse.ok) {
      // Try 'master' branch if 'main' fails
      const masterTreeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`;
      const masterResponse = await fetch(masterTreeUrl, { headers });

      if (!masterResponse.ok) {
        throw new Error(`Failed to fetch repository tree: ${masterResponse.statusText}`);
      }

      const masterData = await masterResponse.json() as { tree: Array<{ path: string; type: string; size?: number; url: string }> };
      await fetchFiles(masterData, appContent, headers);
    } else {
      const treeData = await treeResponse.json() as { tree: Array<{ path: string; type: string; size?: number; url: string }> };
      await fetchFiles(treeData, appContent, headers);
    }
  } catch (error) {
    throw new Error(`Failed to clone GitHub repository: ${error instanceof Error ? error.message : String(error)}`);
  }

  return appContent;
}

/**
 * Helper function to fetch files from GitHub tree
 */
async function fetchFiles(
  treeData: { tree: Array<{ path: string; type: string; size?: number; url: string }> },
  appContent: AppContent,
  headers: Record<string, string>,
): Promise<void> {
  // Patterns to skip
  const skipPatterns = [
    /^node_modules\//,
    /^\.git\//,
    /^\.next\//,
    /^dist\//,
    /^build\//,
    /^__pycache__\//,
    /\.lock$/,
    /package-lock\.json$/,
    /yarn\.lock$/,
    /pnpm-lock\.yaml$/,
  ];

  // Filter and fetch files
  const filesToFetch = treeData.tree.filter((item) => {
    if (item.type !== "blob") return false;
    if (skipPatterns.some((pattern) => pattern.test(item.path))) return false;
    if (item.size && item.size > 100 * 1024) return false; // Skip files > 100KB
    return true;
  });

  // Fetch files with concurrency limit
  const concurrencyLimit = 10;
  for (let i = 0; i < filesToFetch.length; i += concurrencyLimit) {
    const batch = filesToFetch.slice(i, i + concurrencyLimit);
    await Promise.all(
      batch.map(async (file) => {
        try {
          const response = await fetch(file.url, { headers });
          if (!response.ok) return;

          const data = await response.json() as { content?: string; encoding?: string };
          if (data.content && data.encoding === "base64") {
            const content = Buffer.from(data.content, "base64").toString("utf8");
            appContent.files.set(file.path, content);

            // Extract special files
            if (file.path === "package.json") {
              try {
                appContent.packageJson = JSON.parse(content);
              } catch (e) {
                console.warn("Failed to parse package.json:", e);
              }
            } else if (file.path === "requirements.txt") {
              appContent.requirements = content;
            }
          }
        } catch (e) {
          console.warn(`Failed to fetch file ${file.path}:`, e);
        }
      })
    );
  }
}
