/*
 * ============================================================
 *  main.jsx  |  Camada: Front-end (ponto de entrada do React)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (base das telas)
 * ------------------------------------------------------------
 *  O que faz: é o primeiro arquivo executado pelo navegador (index.html -> main.jsx).
 *  Monta o React dentro da <div id="root"> e "embrulha" o App com os provedores globais:
 *  BrowserRouter (rotas/URLs) e AppProvider (sessão do usuário logado e do cliente).
 *  Também importa os CSS globais.
 *  Quem chama: index.html (via Vite).        Chama: App.jsx, AppContext.jsx.
 * ============================================================
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import App from './App';
import './index.css';
import './styles/landing.css';
import './styles/app-modern.css';

// Ordem dos "embrulhos" (de fora para dentro):
//  - React.StrictMode: modo de desenvolvimento que avisa sobre práticas inseguras (não aparece em produção).
//  - BrowserRouter: permite usar <Routes>, useNavigate e useParams em qualquer tela.
//  - AppProvider: deixa user, tenant, login, logout e hasFeature disponíveis via useApp() em qualquer componente.
//  - App: define qual tela aparece para cada URL.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
