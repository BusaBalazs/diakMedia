// Client-side image preparation: validates the file, scales it down and re-encodes it as JPEG.
// Keeps uploads small (good on phones) and makes the development data layer fit into localStorage.
export const MAX_SOURCE_BYTES = 8 * 1024 * 1024;

export async function prepareImage(file, { max = 1400, quality = 0.82 } = {}) {
  if (!file.type.startsWith('image/')) throw new Error('Csak képfájl tölthető fel.');
  if (file.size > MAX_SOURCE_BYTES) throw new Error('A kép legfeljebb 8 MB lehet.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  return { blob, dataUrl, name: file.name.replace(/\.[^.]+$/, '') + '.jpg' };
}
