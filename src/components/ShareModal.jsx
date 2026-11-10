import { useEffect, useRef, useState } from 'react';
import ArticleImage from './ArticleImage.jsx';
import { CheckIcon, CloseIcon, StarMark } from './Icons.jsx';
import { SchoolTag } from './Tags.jsx';
import { enrich } from '../lib/content.js';
import { BRAND } from '../data/brand.js';

const NET = {
  facebook: { name: 'Facebook', ratio: '1.91 / 1' },
  instagram: { name: 'Instagram', ratio: '1 / 1' },
  tiktok: { name: 'TikTok', ratio: '9 / 16' },
};

const hashtags = (tags) => tags.map((t) => '#' + t.replace(/[^\p{L}\p{N}]/gu, '')).filter((t) => t.length > 1).join(' ');

function buildCaption(network, a, link) {
  const tags = hashtags([...a.tags, BRAND.name]);
  if (network === 'facebook') return `${a.title}\n\n${a.excerpt}\n\nOlvasd el: ${link}`;
  if (network === 'instagram') return `${a.title}\n\n${a.excerpt}\n\nA teljes cikk a profilunk linkjében.\n${link}\n\n${tags}`;
  return `${a.title} ${tags}`;
}

// Demo only: builds a postable version of the article and pretends to publish it. Nothing leaves the browser.
export default function ShareModal({ article, network, onClose }) {
  const a = enrich(article);
  const net = NET[network];
  const ref = useRef(null);
  const [phase, setPhase] = useState('preview'); // preview | sending | done
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/cikk/${a.slug}`;
  const caption = buildCaption(network, a, link);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => { if (d && d.open) d.close(); };
  }, []);

  useEffect(() => {
    if (phase !== 'sending') return undefined;
    const t = setTimeout(() => setPhase('done'), 1100);
    return () => clearTimeout(t);
  }, [phase]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { setCopied(false); }
  };

  return (
    <dialog
      ref={ref}
      className="share-modal"
      aria-labelledby="share-title"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) ref.current.close(); }}
    >
      <div className="share-modal__inner">
        <header className="share-modal__head">
          <h2 id="share-title" className="share-modal__title">Megosztás: {net.name}</h2>
          <button type="button" className="icon-btn" onClick={() => ref.current.close()}>
            <CloseIcon /><span className="visually-hidden">Bezárás</span>
          </button>
        </header>

        {phase !== 'done' ? (
          <div className="share-modal__body">
            <div className={`post-preview post-preview--${network}`}>
              <div className="post-preview__img"><ArticleImage imageKey={a.imageKey} ratio={network === 'tiktok' ? '3 / 4' : network === 'facebook' ? '1.91 / 1' : '1 / 1'} categoryId={a.categoryId} decorative /></div>
              <div className="post-preview__text">
                <span className="sticker sticker--lime" style={{ '--rot': '-2deg' }}>{a.category.name}</span>
                <p className="post-preview__title">{a.title}</p>
                <div className="post-preview__foot">
                  <SchoolTag school={a.school} size="sm" />
                  <span className="post-preview__brand"><StarMark size={16} /> {BRAND.name}</span>
                </div>
              </div>
            </div>
            <div className="share-modal__side">
              <label className="share-modal__label" htmlFor="share-caption">Bejegyzés szövege</label>
              <textarea id="share-caption" className="share-modal__caption" readOnly rows={8} value={caption} />
              <label className="share-modal__label" htmlFor="share-link">Link a cikkhez</label>
              <div className="share-modal__link">
                <input id="share-link" readOnly value={link} onFocus={(e) => e.target.select()} />
                <button type="button" className="btn btn--dark" onClick={copy}>{copied ? 'Másolva' : 'Másolás'}</button>
              </div>
              <p className="share-modal__demo">Ez egy demó: a bejegyzés nem kerül ki a közösségi oldalra.</p>
              <button type="button" className="btn btn--primary btn--lg" disabled={phase === 'sending'} onClick={() => setPhase('sending')}>
                {phase === 'sending' ? 'Közzététel folyamatban…' : `Közzététel a(z) ${net.name} oldalon`}
              </button>
            </div>
          </div>
        ) : (
          <div className="share-modal__done" role="status">
            <span className="share-modal__check"><CheckIcon width={34} height={34} /></span>
            <h3>A megosztás sikeres</h3>
            <p>A cikk posztolható változata elkészült a(z) {net.name} számára. Demó üzemmódban a bejegyzés valójában nem lett közzétéve.</p>
            <div className="share-modal__actions">
              <button type="button" className="btn btn--dark" onClick={() => ref.current.close()}>Bezárás</button>
              <button type="button" className="text-link text-link--btn" onClick={() => setPhase('preview')}>Vissza az előnézethez</button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
