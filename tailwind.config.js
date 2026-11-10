// Tailwind is used ONLY by the admin interface.
// - `important: '.admin-scope'` scopes every utility to the admin root element, so nothing can leak into the public site.
// - `preflight` is off: the public site keeps its own base styles untouched (the admin adds a scoped reset in admin.css).
export default {
  content: ['./src/admin/**/*.{js,jsx}'],
  important: '.admin-scope',
  corePlugins: { preflight: false, container: false },
  theme: {
    extend: {
      colors: {
        canvas: '#F5F6F7',
        surface: '#FFFFFF',
        ink: '#171923',
        muted: '#6B7280',
        line: '#E5E7EB',
        brand: { DEFAULT: '#16866F', dark: '#116B59', soft: '#E7F3F0' },
        lime: '#D7F53C',
        warn: { DEFAULT: '#EAB308', ink: '#7A5B00' },
        ok: { DEFAULT: '#16A34A', ink: '#166534' },
        danger: { DEFAULT: '#DC5252', ink: '#B42323' },
        info: { DEFAULT: '#3B82F6', ink: '#1D4ED8' },
      },
      fontFamily: { sans: ["'Inter Variable'", 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 1px 2px rgba(23, 25, 35, 0.05)', pop: '0 8px 24px rgba(23, 25, 35, 0.12)' },
    },
  },
};
