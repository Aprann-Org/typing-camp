function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return slug || "child";
}

/** Profile id: slug of the child's first name + creation timestamp, per the brief's data model comment. */
export function createProfileId(firstName: string, createdAtIso: string): string {
  return `${slugify(firstName)}-${new Date(createdAtIso).getTime()}`;
}
