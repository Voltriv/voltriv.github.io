import { assertUniqueIds } from "./schema/validate";

/**
 * Turns a glob of JSON modules into a validated, ordered collection.
 *
 * `import.meta.glob` cannot take a variable — Vite resolves it statically at
 * build time — so each caller passes its own glob result in. Everything after
 * that is identical for every collection, which is what keeps the three
 * loaders from drifting apart.
 *
 * Validation runs at module load, so a malformed entry fails `npm run build`
 * and the dev server instead of reaching production as an empty card.
 */
export function loadCollection<Entry extends { id: string }>(
  modules: Record<string, { default: unknown }>,
  parse: (raw: unknown, where: string) => Entry,
  sort: (entries: readonly Entry[]) => Entry[],
  where: string,
): readonly Entry[] {
  const loaded = Object.entries(modules).map(([path, module]) =>
    parse(module.default, path),
  );

  assertUniqueIds(loaded, where);

  return sort(loaded);
}
