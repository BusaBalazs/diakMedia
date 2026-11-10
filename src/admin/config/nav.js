// Sidebar structure. `permission` hides an item from roles that may not use it.
export const NAV_ITEMS = [
  { id: 'dashboard', to: '/admin', label: 'Irányítópult', icon: 'dashboard', end: true },
  { id: 'content', to: '/admin/tartalmak', label: 'Tartalmak', icon: 'document' },
  { id: 'topics', to: '/admin/temajavaslat', label: 'Téma javaslat', icon: 'notebook', permission: 'topics.use' },
  { id: 'suggestions', to: '/admin/javaslatok', label: 'Diákjavaslatok', icon: 'lightbulb', badge: 'newSuggestions' },
  { id: 'team', to: '/admin/szerkesztoseg', label: 'Szerkesztőség', icon: 'users', permission: 'team.view' },
  { id: 'settings', to: '/admin/beallitasok', label: 'Beállítások', icon: 'settings', permission: 'settings.manage' },
];
