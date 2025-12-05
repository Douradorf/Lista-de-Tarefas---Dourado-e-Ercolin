import React, { useState } from 'react';
import { Check, Trash2, User, Calendar, Pencil, X, Save } from 'lucide-react';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Task>) => void;
  isOwner: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onEdit, isOwner }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(task.description);
  const [editAssignee, setEditAssignee] = useState(task.assignee);
  const [editDate, setEditDate] = useState(task.dueDate || '');

  // Logic to get first name for display
  const firstName = task.assignee.trim().split(' ')[0];

  // Logic to format date (e.g., 2024-12-25 to 25/12/2024)
  const formattedDate = task.dueDate 
    ? new Date(task.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
    : null;

  const handleSave = () => {
    if (!editDesc.trim()) return;
    onEdit(task.id, {
      description: editDesc,
      assignee: editAssignee,
      dueDate: editDate
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditDesc(task.description);
    setEditAssignee(task.assignee);
    setEditDate(task.dueDate || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white p-4 border-2 border-brand-gold/30 rounded-lg mb-3 shadow-md transition-all">
        <div className="space-y-3">
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-brand-gold outline-none resize-y min-h-[80px]"
            placeholder="Descrição da tarefa"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Responsável</label>
              <input
                type="text"
                value={editAssignee}
                onChange={(e) => setEditAssignee(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Vencimento</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={handleCancel}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Cancelar</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-white bg-brand-navy rounded hover:bg-brand-dark transition-colors"
            >
              <Save className="w-3 h-3" />
              <span>Salvar</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group flex flex-col md:flex-row items-start md:items-center p-4 border rounded-lg mb-3 transition-all duration-300 
      ${task.completed ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-200 hover:border-brand-gold/50 shadow-sm hover:shadow-md'}`}
    >
      {/* Checkbox Section */}
      <div className="flex items-center w-full md:w-auto mb-2 md:mb-0">
        <button
          onClick={() => onToggle(task.id)}
          className={`flex-shrink-0 w-6 h-6 rounded border-2 mr-4 flex items-center justify-center transition-colors duration-200
            ${task.completed 
              ? 'bg-green-600 border-green-600' 
              : 'border-gray-300 hover:border-brand-gold bg-white'
            }`}
          aria-label={task.completed ? "Marcar como pendente" : "Marcar como concluída"}
        >
          {task.completed && <Check className="w-4 h-4 text-white" />}
        </button>
      </div>

      {/* Content Section */}
      <div className="flex-grow min-w-0 pr-4">
        <p 
          className={`text-sm md:text-base break-words whitespace-pre-wrap leading-relaxed
            ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}
        >
          {task.description}
        </p>
      </div>

      {/* Info Section (Assignee, Date, Actions) */}
      <div className="flex items-center justify-between w-full md:w-auto mt-3 md:mt-0 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-gray-100 pt-2 md:pt-0 gap-2">
        
        <div className="flex items-center gap-2">
           {/* Due Date Badge */}
          {formattedDate && (
            <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-200" title="Data de Vencimento">
              <Calendar className="w-3 h-3 mr-1 opacity-70" />
              <span>{formattedDate}</span>
            </div>
          )}

          {/* Assignee Badge */}
          <div className="flex items-center text-xs font-medium text-brand-navy bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
            <User className="w-3 h-3 mr-1 opacity-70" />
            <span title={task.assignee}>{firstName}</span>
          </div>
        </div>

        {/* Actions (only for owner) */}
        {isOwner && (
          <div className="flex items-center ml-2 border-l border-gray-100 pl-2 space-x-1">
            <button 
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-brand-navy transition-colors p-1.5 rounded hover:bg-gray-100"
              title="Editar tarefa"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded hover:bg-red-50"
              title="Excluir tarefa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};