export function contentTags(value) {
  const tags = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[\r\n,]+/)
      : [];
  return tags
    .filter((tag) => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter(Boolean);
}
