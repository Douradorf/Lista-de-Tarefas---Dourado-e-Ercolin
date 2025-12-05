export interface Task {
  id: string;
  description: string;
  assignee: string; // Full name
  completed: boolean;
  createdAt: number;
  dueDate?: string; // YYYY-MM-DD format
}

export interface TaskList {
  id: string;
  title: string;
  tasks: Task[];
  createdAt: number;
}

export type ViewState = 'dashboard' | 'list';

export interface RouteState {
  view: ViewState;
  listId?: string;
}