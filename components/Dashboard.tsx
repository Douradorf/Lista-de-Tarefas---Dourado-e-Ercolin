import React, { useState, useEffect } from 'react';
import { Plus, List, ChevronRight, Trash2 } from 'lucide-react';
import { TaskList } from '../types';
import { subscribeToAllLists, createList, deleteList } from '../services/storageService';
import { Header } from './Header';

interface DashboardProps {
  onSelectList: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectList }) => {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [newListName, setNewListName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToAllLists((data) => {
      setLists(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    
    // Optimistic update handled by firebase listener
    await createList(newListName);
    setNewListName('');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja apagar esta lista inteira?')) {
      await deleteList(id);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light font-sans">
      <Header />

      <main className="max-w-5xl mx-auto p-6 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif text-brand-navy mb-2">Lista de Tarefas</h2>
          <p className="text-gray-500">Gerencie todas as atividades do escritório.</p>
        </div>

        {/* Create New List */}
        <div className="max-w-xl mx-auto mb-12">
          <form onSubmit={handleCreate} className="relative group">
            <div className="flex shadow-lg rounded-full overflow-hidden border border-gray-200 bg-white p-1 focus-within:ring-4 focus-within:ring-brand-gold/20 transition-all">
              <input
                type="text"
                placeholder="Nome da nova lista (ex: Processo 1234/23 - Inventário)..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="flex-grow px-6 py-3 text-gray-700 outline-none placeholder-gray-400 bg-transparent"
              />
              <button
                type="submit"
                className="bg-brand-gold text-white px-6 py-2 rounded-full font-medium hover:bg-yellow-600 transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-1" />
                Criar
              </button>
            </div>
          </form>
        </div>

        {/* Lists Grid */}
        {isLoading ? (
           <div className="text-center py-20 text-gray-400">Carregando listas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-400">
                <List className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Nenhuma lista criada ainda.</p>
              </div>
            ) : (
              lists.map((list) => (
                <div
                  key={list.id}
                  onClick={() => onSelectList(list.id)}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-brand-navy/5 rounded-lg text-brand-navy">
                      <List className="w-6 h-6" />
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, list.id)}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 h-14">
                    {list.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-4 border-t pt-4">
                    <span>{list.tasks.length} Tarefas</span>
                    <div className="flex items-center text-brand-gold font-medium">
                      Acessar <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};