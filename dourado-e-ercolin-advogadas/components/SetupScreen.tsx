import React, { useState } from 'react';
import { Header } from './Header';
import { saveConfig } from '../services/firebase';

export const SetupScreen: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !authDomain || !projectId) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    
    saveConfig({
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim()
    });
  };

  return (
    <div className="min-h-screen bg-brand-light font-sans">
      <Header />
      <main className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-serif text-brand-navy mb-4">Configuração Inicial</h2>
          <p className="text-gray-600 mb-6">
            Para que o sistema funcione online e possa ser compartilhado com seus clientes, precisamos conectá-lo ao Google Firebase.
          </p>

          <div className="bg-blue-50 border-l-4 border-brand-navy p-4 mb-8 text-sm text-gray-700">
            <strong>Instruções:</strong>
            <ol className="list-decimal ml-4 mt-2 space-y-1">
              <li>Acesse o console do Firebase e clique no ícone Web <code>&lt;/&gt;</code>.</li>
              <li>Copie os valores do código que aparecerá (firebaseConfig).</li>
              <li>Cole-os nos campos abaixo.</li>
            </ol>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input 
                type="text" 
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-gold outline-none"
                placeholder="Ex: AIzaSyD..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auth Domain</label>
              <input 
                type="text" 
                value={authDomain}
                onChange={e => setAuthDomain(e.target.value)}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-gold outline-none"
                placeholder="Ex: seu-projeto.firebaseapp.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project ID</label>
              <input 
                type="text" 
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-gold outline-none"
                placeholder="Ex: seu-projeto"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-brand-navy text-white font-bold py-3 rounded-lg hover:bg-brand-dark transition-colors mt-4"
            >
              Salvar e Conectar
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};