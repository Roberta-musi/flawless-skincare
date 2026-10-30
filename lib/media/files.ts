import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";

// turbopackIgnore stops the build tracing (and so bundling) every file these paths might reach.
const root = resolve(/* turbopackIgnore: true */ process.env.MEDIA_DIR ?? "data/media");

function pathFor(key: string) {
  const path = resolve(/* turbopackIgnore: true */ join(root, key));
  if (!path.startsWith(root + sep)) throw new Error(`Invalid media key: ${key}`);
  return path;
}

export async function writeMediaFile(key: string, body: ArrayBuffer) {
  const path = pathFor(key);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, Buffer.from(body));
}

export async function readMediaFile(key: string) {
  try {
    return await readFile(pathFor(key));
  } catch {
    return null;
  }
}

export async function deleteMediaFiles(keys: string[]) {
  await Promise.all(keys.map((key) => rm(pathFor(key), { force: true })));
}
