import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('Mounting Hopitel App...');
const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<h1>Erreur : Élément #root non trouvé</h1>';
} else {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('App mounted successfully');
  } catch (err: any) {
    console.error('Mounting Error:', err);
    rootElement.innerHTML = `<h1 style="color:red; padding:20px;">Erreur de rendu React : ${err?.message || 'Erreur inconnue'}</h1>`;
  }
}
