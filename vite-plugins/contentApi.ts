import { readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Connect, Plugin, ViteDevServer } from "vite";

// Schema modules only, never `src/content` itself — the index calls
// `import.meta.glob`, which esbuild does not transform when Node loads the
// Vite config, so importing it here would throw before the dev server starts.
import { parseCertification } from "../src/content/schema/certifications";
import { parseExperience } from "../src/content/schema/experience";
import { parseProject } from "../src/content/schema/projects";
import { CONTENT_ID_PATTERN } from "../src/content/schema/validate";
import { RateLimiter, hasAllowedOrigin, hasLocalHost } from "./requestGuard";

/**
 * The write half of the local CMS.
 *
 * `apply: "serve"` is the load-bearing line: this plugin exists only while the
 * dev server runs. It is never part of `vite build`, so the deployed site has
 * no content API, no write path and no new attack surface — the published
 * artefact is exactly as static as it was before.
 *
 * Git is the database. This endpoint only moves JSON into and out of the
 * working tree; committing and deploying stay manual and reviewable.
 */

type Parser = (raw: unknown, where: string) => { id: string };

/**
 * Every editable collection, keyed by its URL segment and directory name.
 *
 * A Map rather than an object literal: the key arrives from the request URL,
 * and a Map has no prototype chain for `__proto__` or `constructor` to
 * resolve against.
 */
const COLLECTIONS = new Map<string, Parser>([
  ["certifications", parseCertification],
  ["experience", parseExperience],
  ["projects", parseProject],
]);

const CONTENT_ROOT = path.resolve(
  import.meta.dirname,
  "../src/content/entries",
);
const ROUTE = "/__content";

/**
 * Bursty by design: saving several entries in a row is normal editing, while
 * the sustained rate should stay low. 30 requests of burst, refilling at 2/s.
 */
const RATE_LIMIT_BURST = 30;
const RATE_LIMIT_PER_SECOND = 2;

type Json = Record<string, unknown>;
type Request = Parameters<Connect.NextHandleFunction>[0];
type Response = Parameters<Connect.NextHandleFunction>[1];

const sendJson = (response: Response, status: number, body: unknown) => {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  // The dev server is the only consumer; make that explicit rather than
  // leaving a permissive default in place.
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
};

const readBody = async (request: Request): Promise<Json> => {
  const chunks: Buffer[] = [];
  let size = 0;

  const stream = request as AsyncIterable<Buffer>;
  for await (const chunk of stream) {
    size += chunk.length;
    // An entry is a few hundred bytes; anything near this is a mistake or a
    // runaway client, and neither should be able to exhaust memory.
    if (size > 64 * 1024) throw new Error("Request body too large");
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) throw new Error("Request body was empty");

  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Request body must be a JSON object");
  }
  return parsed as Json;
};

const parserFor = (collection: string) => {
  const parse = COLLECTIONS.get(collection);
  if (!parse) {
    throw new Error(`Unknown collection ${JSON.stringify(collection)}`);
  }
  return parse;
};

const collectionDir = (collection: string) => {
  parserFor(collection);
  return path.join(CONTENT_ROOT, collection);
};

/**
 * Resolves an entry to its file, refusing anything that could escape the
 * collection directory. The id pattern already excludes dots and separators;
 * the resolved path is re-checked so the guarantee does not rest on the
 * regex alone.
 */
const resolveEntryPath = (collection: string, id: string) => {
  const dir = collectionDir(collection);

  if (!CONTENT_ID_PATTERN.test(id)) {
    throw new Error(`Invalid id ${JSON.stringify(id)}`);
  }

  const resolved = path.join(dir, `${id}.json`);
  if (path.dirname(resolved) !== dir) {
    throw new Error("Refusing to write outside the content directory");
  }
  return resolved;
};

const listEntries = async (collection: string) => {
  const dir = collectionDir(collection);
  const parse = parserFor(collection);

  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }

  return Promise.all(
    files
      .filter((file) => file.endsWith(".json"))
      .map(async (file) => {
        const raw: unknown = JSON.parse(
          await readFile(path.join(dir, file), "utf8"),
        );
        return parse(raw, file);
      }),
  );
};

/** `/__content/<collection>` or `/__content/<collection>/<id>`. */
const parseRoute = (url: string) => {
  const [pathname] = url.split("?");
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));

  return { collection: segments[0] ?? "", id: segments[1] ?? "" };
};

export function contentApi(): Plugin {
  return {
    name: "voltriv:content-api",
    apply: "serve",

    configureServer(server: ViteDevServer) {
      const limiter = new RateLimiter(
        RATE_LIMIT_BURST,
        RATE_LIMIT_PER_SECOND,
      );

      server.middlewares.use(ROUTE, (request, response, next) => {
        void (async () => {
          try {
            // Anti-rebinding: a browser tricked into resolving a hostile
            // domain to 127.0.0.1 still sends that domain as `Host`.
            if (!hasLocalHost(request) || !hasAllowedOrigin(request)) {
              sendJson(response, 403, {
                error: "Content API is reachable from this machine only",
              });
              return;
            }

            const limit = limiter.take();
            if (!limit.allowed) {
              response.setHeader("Retry-After", String(limit.retryAfter));
              sendJson(response, 429, {
                error: `Too many requests — retry in ${limit.retryAfter}s`,
              });
              return;
            }

            const method = request.method ?? "GET";
            const { collection, id } = parseRoute(request.url ?? "/");

            if (method === "GET") {
              sendJson(response, 200, {
                entries: await listEntries(collection),
              });
              return;
            }

            if (method === "PUT") {
              // Throws on an unknown collection before anything is read.
              const parse = parserFor(collection);

              const body = await readBody(request);
              // Validated with the *same* parser the app loads content
              // through, so the admin UI cannot write a record that would
              // later fail the build.
              const entry = parse(body, "submitted entry");

              await writeFile(
                resolveEntryPath(collection, entry.id),
                `${JSON.stringify(entry, null, 2)}\n`,
                "utf8",
              );
              sendJson(response, 200, { entry });
              return;
            }

            if (method === "DELETE") {
              await unlink(resolveEntryPath(collection, id));
              sendJson(response, 200, { deleted: id });
              return;
            }

            response.statusCode = 405;
            response.setHeader("Allow", "GET, PUT, DELETE");
            response.end();
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Unknown error";
            // Surfaced in the admin UI, so the editor sees the same message
            // the build would have failed with.
            sendJson(response, 400, { error: message });
          }
        })().catch(next);
      });
    },
  };
}
