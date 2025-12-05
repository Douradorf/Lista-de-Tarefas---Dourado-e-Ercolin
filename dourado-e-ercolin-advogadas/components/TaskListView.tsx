import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Plus, Share2, Sparkles, AlertCircle } from 'lucide-react';
import { TaskList, Task } from '../types';
import { subscribeToList, addTaskToList, toggleTaskCompletion, removeTaskFromList, updateTask } from '../services/storageService';
import { suggestTasks } from '../services/geminiService';
import { TaskItem } from './TaskItem';
import { Header } from './Header';

interface TaskListViewProps {
  listId: string;
  onBack: () => void;
  isOwner: boolean;
}

export const TaskListView: React.FC<TaskListViewProps> = ({ listId, onBack, isOwner }) => {
  const [list, setList] = useState<TaskList | null>(null);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToList(listId, (data) => {
      setList(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [listId]);

  const sortedTasks = useMemo(() => {
    if (!list) return [];
    return [...list.tasks].sort((a, b) => {
      // 1. Completion status: Incomplete first
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // 2. Due Date: Has date -> earliest date
      if (a.dueDate && b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      // Tasks with date come before tasks without date
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      return 0;
    });
  }, [list]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc.trim() || !assignee.trim()) return;
    
    await addTaskToList(listId, newTaskDesc, assignee, dueDate);
    setNewTaskDesc('');
    setDueDate('');
  };

  const handleToggle = async (taskId: string) => {
    await toggleTaskCompletion(listId, taskId);
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('Tem certeza que deseja remover esta tarefa?')) {
      await removeTaskFromList(listId, taskId);
    }
  };

  const handleEdit = async (taskId: string, updates: Partial<Task>) => {
    await updateTask(listId, taskId, updates);
  };

  const handleAiSuggest = async () => {
    if (!list) return;
    setIsGenerating(true);
    const suggestions = await suggestTasks(list.title);
    
    // Auto add suggestions
    for (const sug of suggestions) {
      await addTaskToList(list.id, sug.description, sug.assigneeRole);
    }
    
    setIsGenerating(false);
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#/list/${listId}`;
    navigator.clipboard.writeText(url).then(() => {
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 3000);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="text-gray-500">Carregando tarefas...</div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Lista não encontrada ou removida.</p>
          {isOwner && (
            <button onClick={onBack} className="mt-4 text-brand-gold hover:underline">Voltar</button>
          )}
        </div>
      </div>
    );
  }

  const progress = list.tasks.length > 0 
    ? Math.round((list.tasks.filter(t => t.completed).length / list.tasks.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-brand-light font-sans text-brand-dark">
      <Header />
      
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        
        {/* Navigation & Actions */}
        <div className="flex justify-between items-center mb-6">
          {isOwner ? (
            <button 
              onClick={onBack} 
              className="flex items-center text-gray-500 hover:text-brand-navy transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar para Listas
            </button>
          ) : (
             <div className="text-sm text-gray-400 italic">Modo de Visualização</div>
          )}

          <button 
            onClick={handleShare}
            className="flex items-center space-x-2 text-brand-gold border border-brand-gold px-3 py-1.5 rounded hover:bg-brand-gold hover:text-white transition-colors text-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>{showCopySuccess ? "Link Copiado!" : "Copiar Link"}</span>
          </button>
        </div>

        {/* List Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
            <div 
              className="h-full bg-green-500 transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lista de Tarefas</span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-navy mt-1">
                {list.title}
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                {list.tasks.filter(t => t.completed).length} de {list.tasks.length} tarefas concluídas ({progress}%)
              </p>
            </div>
            
            {/* AI Action - Only for Owner */}
             {isOwner && process.env.API_KEY && (
               <button 
                  onClick={handleAiSuggest}
                  disabled={isGenerating}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? "Gerando..." : "Sugerir Tarefas com IA"}</span>
                </button>
             )}
          </div>
        </div>

        {/* Add Task Form - Only for Owner */}
        {isOwner && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Nova Tarefa</h3>
            <form onSubmit={handleAddTask} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                   <textarea
                    placeholder="Descrição da tarefa (mín. 50 caracteres)..."
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none resize-none h-32"
                    required
                    minLength={2} 
                  />
                  <div className="flex justify-end mt-1">
                      <span className={`text-xs ${newTaskDesc.length < 50 ? 'text-red-400' : 'text-green-500'}`}>
                          {newTaskDesc.length} caracteres
                      </span>
                  </div>
                </div>
                
                <div className="flex flex-col justify-start space-y-3">
                  <div>
                     <label className="block text-xs text-gray-500 mb-1">Responsável</label>
                     <input
                      type="text"
                      placeholder="Ex: Ana Souza"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                     <label className="block text-xs text-gray-500 mb-1">Data de Vencimento</label>
                     <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none text-gray-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-navy text-white font-medium py-2 px-4 rounded-md hover:bg-brand-dark transition-colors flex items-center justify-center space-x-2 mt-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              {isOwner 
                ? "Nenhuma tarefa cadastrada. Adicione uma tarefa acima ou use a IA para sugerir."
                : "Nenhuma tarefa cadastrada nesta lista ainda."}
            </div>
          ) : (
            sortedTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={handleToggle} 
                onDelete={handleDelete}
                onEdit={handleEdit}
                isOwner={isOwner} 
              />
            ))
          )}
        </div>

      </main>
    </div>
  );
};