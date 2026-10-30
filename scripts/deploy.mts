import { execFileSync, execSync } from "node:child_process";
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync, rmSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

// Builds deploy.zip for the cPanel Node.js app. With DEPLOY_SSH set in .env.deploy it also
// uploads the bundle, unpacks it into DEPLOY_PATH and restarts the app.

process.loadEnvFile(".env.deploy");

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
// localhost is allowed so the bundle can be tried locally before uploading.
if (!/^(https:\/\/[^/]+|http:\/\/localhost:\d+)$/.test(siteUrl)) {
  console.error("Set NEXT_PUBLIC_SITE_URL in .env.deploy to the live address, e.g. https://www.example.com (see docs/deployment.md).");
  process.exit(1);
}
if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
  console.warn("NEXT_PUBLIC_TURNSTILE_SITE_KEY is empty: public forms will have no spam check.");
}

const run = (command: string, cwd = ".") => execSync(command, { stdio: "inherit", cwd });

run("npx next build");

const out = "deploy";
rmSync(out, { recursive: true, force: true });
rmSync("deploy.zip", { force: true });
cpSync(".next/standalone", out, { recursive: true });
cpSync(".next/static", join(out, ".next/static"), { recursive: true });
cpSync("public", join(out, "public"), { recursive: true });
cpSync("drizzle", join(out, "drizzle"), { recursive: true });
mkdirSync(join(out, "scripts"));
cpSync("scripts/migrate.cjs", join(out, "scripts/migrate.cjs"));
cpSync("scripts/backup.cjs", join(out, "scripts/backup.cjs"));
cpSync("scripts/cpanel-app.cjs", join(out, "app.js"));

// Turbopack links server-external packages under hashed names (.next/node_modules/@libsql/client-<hash>)
// to absolute paths on this computer. Swap each link for a stub that loads the bundled copy instead.
const hashedDir = join(out, ".next/node_modules");
const packageDirs = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => (name.startsWith("@") ? packageDirs(join(dir, name)) : [join(dir, name)]));
for (const link of existsSync(hashedDir) ? packageDirs(hashedDir) : []) {
  if (!lstatSync(link).isSymbolicLink()) continue;
  const target = readlinkSync(link).replace(/\\/g, "/").replace(/\/$/, "");
  const name = target.slice(target.lastIndexOf("node_modules/") + "node_modules/".length);
  rmSync(link, { recursive: true, force: true });
  mkdirSync(link);
  writeFileSync(join(link, "package.json"), JSON.stringify({ name: relative(hashedDir, link).replace(/\\/g, "/"), main: "index.js" }));
  writeFileSync(join(link, "index.js"), `module.exports = require(${JSON.stringify(name)});\n`);
}
// Secrets are set on the server, never shipped in the bundle.
for (const file of readdirSync(out)) if (file.startsWith(".env")) rmSync(join(out, file));

// The build only traced the SQLite engine for this computer; the server runs Linux.
const libsqlVersion = JSON.parse(readFileSync("node_modules/libsql/package.json", "utf8")).version;
const engines = join(out, "node_modules/@libsql");
for (const dir of existsSync(engines) ? readdirSync(engines) : []) {
  if (/^(win32|darwin|linux)-/.test(dir)) rmSync(join(engines, dir), { recursive: true });
}
const linuxEngine = join(engines, "linux-x64-gnu");
mkdirSync(linuxEngine, { recursive: true });
const tarball = execSync(`npm pack @libsql/linux-x64-gnu@${libsqlVersion} --silent --pack-destination "${out}"`).toString().trim().split("\n").pop()!;
// Windows' own bsdtar, not Git Bash's GNU tar: it also writes the zip that cPanel's File Manager extracts.
const tar = process.platform === "win32" ? join(process.env.SystemRoot ?? "C:\\Windows", "System32", "tar.exe") : "bsdtar";
execFileSync(tar, ["-xzf", join(out, tarball), "-C", linuxEngine, "--strip-components=1"]);
rmSync(join(out, tarball));
execFileSync(tar, ["-a", "-cf", "../deploy.zip", "."], { cwd: out });
console.log("\nBuilt deploy.zip.");

const ssh = process.env.DEPLOY_SSH;
if (ssh) {
  const port = process.env.DEPLOY_SSH_PORT ?? "22";
  const appDir = process.env.DEPLOY_PATH ?? "flawlessskincarewebsite";
  execFileSync("scp", ["-P", port, "deploy.zip", `${ssh}:deploy.zip`], { stdio: "inherit" });
  execFileSync(
    "ssh",
    ["-p", port, ssh, `set -e; rm -rf ${appDir}/.next ${appDir}/node_modules; unzip -oq deploy.zip -d ${appDir}; rm deploy.zip; mkdir -p ${appDir}/tmp; touch ${appDir}/tmp/restart.txt`],
    { stdio: "inherit" },
  );
  console.log(`Deployed to ${siteUrl}.`);
} else {
  console.log("Upload it with cPanel's File Manager (docs/deployment.md), or set DEPLOY_SSH in .env.deploy to upload automatically.");
}
