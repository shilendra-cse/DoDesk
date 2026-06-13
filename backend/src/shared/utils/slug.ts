export function cleanSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '');
}

export function validateSlugInput(slug: string): { clean: string; error?: string } {
  const clean = cleanSlug(slug);

  if (clean.length < 3) {
    return { clean, error: 'Workspace URL must be at least 3 characters long' };
  }

  if (clean !== slug.toLowerCase().trim()) {
    return { clean, error: 'Workspace URL can only contain letters, numbers, and hyphens' };
  }

  return { clean };
}
