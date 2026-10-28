import { useState } from 'react';
import { getImage } from '../data/images.js';
import { categoryById } from '../data/categories.js';
import { BRAND } from '../data/brand.js';

// Keeps the aspect ratio in every case and shows a branded fallback if the image is missing or fails.
export default function ArticleImage({ imageKey, ratio = '16 / 10', alt, categoryId, decorative = false, eager = false, className = '' }) {
  const img = getImage(imageKey);
  const [failed, setFailed] = useState(false);
  const cat = categoryById[categoryId];
  return (
    <div className={`media ${className}`} style={{ aspectRatio: ratio }}>
      {img && !failed ? (
        <img
          src={img.src}
          alt={decorative ? '' : alt ?? img.alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          style={{ objectPosition: img.position }}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="media__fallback" style={{ '--fallback': cat?.color || '#2D3CF0' }} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : 'Az illusztráció nem érhető el'} aria-hidden={decorative || undefined}>
          <span>{BRAND.name.slice(0, 1)}</span>
        </div>
      )}
    </div>
  );
}
