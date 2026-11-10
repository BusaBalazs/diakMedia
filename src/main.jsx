import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@fontsource-variable/inter/wght.css';
import '@fontsource/permanent-marker/400.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/maxi.css';
import './styles/share.css';
import './styles/quick.css';
import App from './App.jsx';
import { LikesProvider } from './lib/likes.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LikesProvider>
        <App />
      </LikesProvider>
    </BrowserRouter>
  </React.StrictMode>
);
