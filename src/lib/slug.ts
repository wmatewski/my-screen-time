const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "session";

export const createBaseSlug = (value: string) => slugify(value).slice(0, 48);

export const createUniqueSlug = async (
  value: string,
  isTaken: (candidate: string) => Promise<boolean>,
) => {
  const base = createBaseSlug(value);
  let candidate = base;
  let attempt = 1;

  while (await isTaken(candidate)) {
    candidate = `${base}-${attempt}`.slice(0, 56);
    attempt += 1;
  }

  return candidate;
};
