import JSZip from "jszip";
import { promises as fs } from "fs";
import path from "path";
import type { WizardData } from "@/lib/store/wizard-store";
import {
  serializeRestaurantConfig,
  generateEnvFile,
  generateReadme,
} from "./config-injector";

const TEMPLATE_DIR = path.join(
  process.cwd(),
  "templates",
  "boilerplate"
);

// Files/folders to skip when copying from template
const SKIP_PATTERNS = [
  "node_modules",
  ".next",
  ".vercel",
  ".turbo",
  ".git",
  ".env",
  ".env.local",
  ".DS_Store",
  "package-lock.json",
  "yarn.lock",
  "tsconfig.tsbuildinfo",
  "TEMPLATE_README.md",
];

function shouldSkip(name: string): boolean {
  return SKIP_PATTERNS.some(
    (pattern) => name === pattern || name.startsWith(pattern)
  );
}

/**
 * Recursively walks a directory and returns relative file paths.
 */
async function walk(
  dir: string,
  basePath = ""
): Promise<{ abs: string; rel: string }[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: { abs: string; rel: string }[] = [];

  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const rel = basePath ? path.join(basePath, entry.name) : entry.name;

    if (shouldSkip(entry.name)) continue;

    if (entry.isDirectory()) {
      const nested = await walk(abs, rel);
      files.push(...nested);
    } else if (entry.isFile()) {
      files.push({ abs, rel });
    }
  }

  return files;
}

/**
 * Builds the ZIP for a user's customized restaurant website.
 * Returns the ZIP as a Node Buffer ready to stream to the browser.
 */
export async function buildZip(data: WizardData): Promise<Buffer> {
  const zip = new JSZip();

  // 1. Verify template exists
  try {
    await fs.access(TEMPLATE_DIR);
  } catch {
    throw new Error(
      "Template folder missing. Run: bash ../../scripts/sync-boilerplate.sh"
    );
  }

  // 2. Walk the template and add all files
  const files = await walk(TEMPLATE_DIR);

  for (const file of files) {
    const content = await fs.readFile(file.abs);
    // Use forward slashes for ZIP paths (Windows-safe)
    const zipPath = file.rel.split(path.sep).join("/");
    zip.file(zipPath, content);
  }

  // 3. Inject the user's config
  zip.file(
    "src/config/restaurant.config.json",
    serializeRestaurantConfig(data)
  );

  // 4. Generate a custom README
  zip.file("README.md", generateReadme(data));

  // 5. Generate .env.example (safe to commit) with placeholders
  zip.file(
    ".env.example",
    generateEnvFile(data).replace(
      data.supabase.serviceRoleKey || "__never__",
      "your_service_role_key_here"
    )
  );

  // 6. Generate .env.local (with the user's actual keys)
  zip.file(".env.local", generateEnvFile(data));

  // 7. Generate a top-level SETUP.txt for quick reference
  zip.file(
    "SETUP.txt",
    `🍽️  ${data.brand.name || "Your Restaurant"}

QUICK SETUP (3 steps):

1. pnpm install  (or: npm install)
2. pnpm dev
3. Open http://localhost:3000

Your Supabase keys are already in .env.local.
For admin access, read README.md → "Admin Access" section.

Questions? See README.md for full documentation.
`
  );

  // 8. Export the uploaded logo in its original image format.
  if (data.brand.logoDataUrl?.startsWith("data:")) {
    const match = data.brand.logoDataUrl.match(
      /^data:(image\/[-a-z0-9.+]+);base64,(.+)$/i
    );

    if (match) {
      const mime = match[1].toLowerCase();
      const ext = mime === "image/jpeg"
        ? "jpg"
        : mime === "image/svg+xml"
          ? "svg"
          : mime.replace("image/", "");

      zip.file(`public/logo.${ext}`, Buffer.from(match[2], "base64"));
    }
  }

  // 9. Export the separately uploaded PNG favicon.
  if (data.brand.faviconDataUrl?.startsWith("data:image/png;base64,")) {
    const match = data.brand.faviconDataUrl.match(
      /^data:image\/png;base64,(.+)$/i
    );

    if (match) {
      zip.file("public/favicon.png", Buffer.from(match[1], "base64"));
    }
  }

  // 10. Generate the ZIP as a Buffer
  const arrayBuffer = await zip.generateAsync({
    type: "arraybuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return Buffer.from(arrayBuffer);
}

/**
 * Returns the zip filename for download.
 */
export function getZipFilename(data: WizardData): string {
  const safeName = (data.brand.name || "restaurant")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${safeName || "restaurant"}-website.zip`;
}
