// A user's `project` field can now hold one or more project names
// separated by commas, e.g. "CRM,ERP" or "CRM, ERP Support".
// This is purely a frontend convention - the backend still stores it
// as a single String column, nothing to migrate.

export const parseProjects = (value) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

// True if `a` and `b` (both raw comma-separated project strings) share
// at least one project in common, case-insensitively.
export const projectsOverlap = (a, b) => {
  const setB = new Set(parseProjects(b).map((item) => item.toLowerCase()));
  return parseProjects(a).some((item) => setB.has(item.toLowerCase()));
};

export const formatProjects = (value) => parseProjects(value).join(', ');
