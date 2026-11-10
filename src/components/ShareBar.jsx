import { useState } from 'react';
import { FacebookIcon, InstagramIcon, ShareIcon, TikTokIcon } from './Icons.jsx';
import LikeButton from './LikeButton.jsx';
import ShareModal from './ShareModal.jsx';

export const NETWORKS = [
  { id: 'facebook', label: 'Facebook', Icon: FacebookIcon },
  { id: 'instagram', label: 'Instagram', Icon: InstagramIcon },
  { id: 'tiktok', label: 'TikTok', Icon: TikTokIcon },
];

export default function ShareBar({ article }) {
  const [network, setNetwork] = useState(null);
  return (
    <div className="share-bar">
      <LikeButton article={article} />
      <div className="share-bar__group" role="group" aria-label="Megosztás">
        <span className="share-bar__label"><ShareIcon width={18} height={18} /> Megosztás</span>
        {NETWORKS.map(({ id, label, Icon }) => (
          <button key={id} type="button" className="share-btn" onClick={() => setNetwork(id)} aria-haspopup="dialog">
            <Icon width={18} height={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      {network && <ShareModal article={article} network={network} onClose={() => setNetwork(null)} />}
    </div>
  );
}
