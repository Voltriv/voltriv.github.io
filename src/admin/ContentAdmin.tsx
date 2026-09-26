import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { slugify } from "@/content/schema/validate";
import { COLLECTIONS, isListField, type CollectionSpec } from "./collections";
import "./admin.css";

const ENDPOINT = "/__content";

/** One entry as the form holds it: every value a string. */
type Draft = Record<string, string>;
type Entry = Record<string, unknown> & { id: string };

const emptyDraft = (spec: CollectionSpec): Draft => {
  const draft: Draft = { id: "" };
  for (const field of spec.fields) {
    draft[field.key] =
      field.kind === "select" ? (field.options?.[0] ?? "") : "";
  }
  return draft;
};

/**
 * Entries arrive as parsed JSON, so a field is `unknown` as far as types go.
 * Only primitives become text; anything else would stringify to
 * "[object Object]" and silently corrupt the entry on the next save.
 */
const asText = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
};

const toDraft = (spec: CollectionSpec, entry: Entry): Draft => {
  const draft: Draft = { id: entry.id };
  for (const field of spec.fields) {
    const value = entry[field.key];
    draft[field.key] = Array.isArray(value)
      ? (value as unknown[]).map(asText).filter(Boolean).join("\n")
      : asText(value);
  }
  return draft;
};

/** Empty strings are dropped so optional fields stay absent, not blank. */
const toPayload = (spec: CollectionSpec, draft: Draft) => {
  const payload: Record<string, unknown> = {
    id: draft.id.trim() || slugify(draft[spec.titleField] ?? ""),
  };

  for (const field of spec.fields) {
    const raw = draft[field.key] ?? "";
    if (isListField(field)) {
      // Newlines or commas, so a pasted list works either way.
      const items = raw
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);
      if (items.length > 0) payload[field.key] = items;
      continue;
    }
    const trimmed = raw.trim();
    if (trimmed !== "") payload[field.key] = trimmed;
  }

  return payload;
};

const readError = async (response: Response) => {
  try {
    const body: unknown = await response.json();
    if (
      typeof body === "object" &&
      body !== null &&
      typeof (body as { error?: unknown }).error === "string"
    ) {
      return (body as { error: string }).error;
    }
  } catch {
    // Fall through to the status line.
  }
  return `${response.status} ${response.statusText}`;
};

/**
 * Reads a collection. Pure I/O — it returns data and throws on failure rather
 * than touching React state, which keeps it reusable from both the mount
 * effect and the event handlers.
 */
const loadEntries = async (collection: string): Promise<Entry[]> => {
  const response = await fetch(`${ENDPOINT}/${collection}`);
  if (!response.ok) throw new Error(await readError(response));

  const body: unknown = await response.json();
  const list =
    typeof body === "object" && body !== null
      ? (body as { entries?: unknown }).entries
      : undefined;

  return Array.isArray(list) ? (list as Entry[]) : [];
};

const describe = (cause: unknown) =>
  cause instanceof Error ? cause.message : String(cause);

export function ContentAdmin() {
  const [activeKey, setActiveKey] = useState(COLLECTIONS[0].key);
  const spec = useMemo(
    () => COLLECTIONS.find((item) => item.key === activeKey) ?? COLLECTIONS[0],
    [activeKey],
  );

  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(COLLECTIONS[0]));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setEntries(await loadEntries(spec.key));
      setError(null);
    } catch (cause) {
      setError(describe(cause));
    }
  }, [spec.key]);

  // Reload whenever the active collection changes. State is set only after
  // the await — never synchronously in the effect body — and the cancel flag
  // stops a slow response from landing after a tab switch or unmount.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const loaded = await loadEntries(spec.key);
        if (!cancelled) setEntries(loaded);
      } catch (cause) {
        if (!cancelled) setError(describe(cause));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [spec.key]);

  const reset = useCallback(() => {
    setDraft(emptyDraft(spec));
    setEditingId(null);
    setStatus(null);
    setError(null);
  }, [spec]);

  const selectCollection = (key: string) => {
    if (key === activeKey) return;
    const next = COLLECTIONS.find((item) => item.key === key);
    if (!next) return;

    setActiveKey(key);
    setEntries([]);
    setDraft(emptyDraft(next));
    setEditingId(null);
    setStatus(null);
    setError(null);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setStatus(null);

    try {
      const payload = toPayload(spec, draft);
      const id = String(payload.id);

      const response = await fetch(`${ENDPOINT}/${spec.key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await readError(response));

      // Renaming changes the id, and therefore the filename: remove the old
      // file so an edit does not silently leave a duplicate behind.
      if (editingId && editingId !== id) {
        await fetch(`${ENDPOINT}/${spec.key}/${encodeURIComponent(editingId)}`, {
          method: "DELETE",
        });
      }

      setStatus(`Saved src/content/entries/${spec.key}/${id}.json`);
      setDraft(emptyDraft(spec));
      setEditingId(null);
      await refresh();
    } catch (cause) {
      setError(describe(cause));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `${ENDPOINT}/${spec.key}/${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error(await readError(response));

      setStatus(`Deleted ${id}.json`);
      if (editingId === id) reset();
      await refresh();
    } catch (cause) {
      setError(describe(cause));
    } finally {
      setBusy(false);
    }
  };

  const update = (key: string, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const subtitleOf = (entry: Entry) =>
    spec.subtitleFields
      .map((key) => asText(entry[key]))
      .filter(Boolean)
      .join(" · ");

  return (
    <main className="admin">
      <header className="admin-header">
        <h1>Content</h1>
        <p>
          Writes JSON into <code>src/content/entries/</code>. Nothing is
          published until you commit and run <code>npm run deploy</code>.
        </p>
      </header>

      <nav className="admin-tabs" aria-label="Collections">
        {COLLECTIONS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => selectCollection(item.key)}
            aria-current={item.key === activeKey ? "page" : undefined}
            className={item.key === activeKey ? "is-active" : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Wrapped rather than passed directly: an async handler returns a
          promise, which a void-returning DOM handler must not receive. */}
      <form className="admin-form" onSubmit={(event) => void save(event)}>
        <h2>
          {editingId ? `Editing ${editingId}` : `New ${spec.label.toLowerCase()} entry`}
        </h2>

        {spec.fields.map((field) => (
          <label className="admin-field" key={field.key}>
            <span>
              {field.label}
              {field.required ? "" : " (optional)"}
            </span>

            {field.kind === "select" ? (
              <select
                value={draft[field.key] ?? ""}
                onChange={(event) => update(field.key, event.target.value)}
              >
                {(field.options ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.kind === "textarea" || isListField(field) ? (
              <textarea
                rows={isListField(field) ? 4 : 3}
                value={draft[field.key] ?? ""}
                placeholder={field.placeholder}
                onChange={(event) => update(field.key, event.target.value)}
              />
            ) : (
              <input
                type={field.kind === "number" ? "number" : "text"}
                value={draft[field.key] ?? ""}
                placeholder={field.placeholder}
                onChange={(event) => update(field.key, event.target.value)}
              />
            )}

            {field.hint ? <small>{field.hint}</small> : null}
          </label>
        ))}

        <label className="admin-field">
          <span>File id (optional)</span>
          <input
            value={draft.id ?? ""}
            placeholder={
              draft[spec.titleField]
                ? slugify(draft[spec.titleField])
                : "derived from the title"
            }
            onChange={(event) => update("id", event.target.value)}
          />
        </label>

        <div className="admin-actions">
          <button type="submit" disabled={busy}>
            {editingId ? "Save changes" : "Add entry"}
          </button>
          {editingId ? (
            <button type="button" onClick={reset} disabled={busy}>
              Cancel
            </button>
          ) : null}
        </div>

        {error ? <p className="admin-error">{error}</p> : null}
        {status ? <p className="admin-status">{status}</p> : null}
      </form>

      <section className="admin-list">
        <h2>
          {entries.length} {entries.length === 1 ? "entry" : "entries"} on file
        </h2>

        {entries.length === 0 ? (
          <p className="admin-empty">
            Nothing here yet. The page renders its empty state until an entry
            is added.
          </p>
        ) : (
          <ul>
            {entries.map((entry) => (
              <li key={entry.id}>
                <div>
                  <strong>{asText(entry[spec.titleField]) || entry.id}</strong>
                  <span>{subtitleOf(entry)}</span>
                </div>
                <div className="admin-row-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(toDraft(spec, entry));
                      setEditingId(entry.id);
                      setStatus(null);
                      setError(null);
                    }}
                    disabled={busy}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(entry.id)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
