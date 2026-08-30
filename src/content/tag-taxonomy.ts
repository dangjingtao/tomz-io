const TAG_ALIASES: Readonly<Record<string, string>> = {
  智能体: "Agent",
  多智能体: "Multi-Agent",
};

/**
 * Normalize public site tags without turning taxonomy into a rigid whitelist.
 *
 * Rules:
 * - a tag must not repeat the page's Group;
 * - known aliases converge to one canonical spelling;
 * - duplicates created by normalization are removed;
 * - unknown but meaningful topic tags are preserved.
 */
export function normalizeSiteTags(
  tags: readonly string[] | undefined,
  group?: string,
): string[] {
  const normalizedGroup = group?.trim();
  const seen = new Set<string>();

  return (tags ?? [])
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => TAG_ALIASES[tag] ?? tag)
    .filter((tag) => tag !== normalizedGroup)
    .filter((tag) => {
      if (seen.has(tag)) return false;
      seen.add(tag);
      return true;
    });
}
