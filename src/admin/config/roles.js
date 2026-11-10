// Simple role model. Permissions are named so finer-grained rules can be added later
// without touching the components: always ask `can(role, 'content.review')`, never compare role names in the UI.
export const ROLES = {
  teacher: { id: 'teacher', label: 'Tanár' },
  editor: { id: 'editor', label: 'Szerkesztő' },
  author: { id: 'author', label: 'Szerző' },
};

const PERMISSIONS = {
  'content.create': ['teacher', 'editor', 'author'],
  'content.review': ['teacher', 'editor'],
  'content.publish': ['teacher'],
  'suggestions.submit': ['teacher', 'editor', 'author'],
  'suggestions.review': ['teacher', 'editor'],
  'topics.use': ['teacher', 'editor', 'author'],
  'team.view': ['teacher', 'editor', 'author'],
  'settings.manage': ['teacher'],
};

export const can = (role, permission) => (PERMISSIONS[permission] || []).includes(role);

// Authors see only their own content; editors and teachers can access school drafts for review and reassignment.
export const seesAllSchoolContent = (role) => role === 'teacher' || role === 'editor';
