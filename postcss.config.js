// Only Tailwind (no autoprefixer): the public site's CSS must stay byte-for-byte what it was before the admin existed.
export default {
  plugins: { tailwindcss: {} },
};
