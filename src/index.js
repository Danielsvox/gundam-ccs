import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './Resources/fonts/walsheim/GTWalsheimPro-Medium.ttf';
import './Resources/fonts/walsheim/GTWalsheimPro-Regular.ttf';
import './Resources/fonts/walsheim/GTWalsheimPro-Light.ttf';
import './Resources/fonts/walsheim/GTWalsheimPro-Bold.ttf';
import { BrowserRouter } from 'react-router-dom';
import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
