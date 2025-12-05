import { TaskList, Task } from '../types';
import { getDb } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  getDoc,
  setDoc
} from 'firebase/firestore';

const LISTS_COLLECTION = 'task_lists';

// Subscribe to all lists (for Dashboard)
export const subscribeToAllLists = (callback: (lists: TaskList[]) => void) => {
  const db = getDb();
  if (!db) return () => {};

  const q = query(collection(db, LISTS_COLLECTION), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const lists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TaskList[];
    callback(lists);
  });
};

// Subscribe to a single list (for TaskListView)
export const subscribeToList = (listId: string, callback: (list: TaskList | null) => void) => {
  const db = getDb();
  if (!db) return () => {};

  return onSnapshot(doc(db, LISTS_COLLECTION, listId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as TaskList);
    } else {
      callback(null);
    }
  });
};

export const createList = async (title: string) => {
  const db = getDb();
  if (!db) return;

  const newList: Omit<TaskList, 'id'> = {
    title,
    tasks: [],
    createdAt: Date.now(),
  };

  await addDoc(collection(db, LISTS_COLLECTION), newList);
};

export const deleteList = async (id: string) => {
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, LISTS_COLLECTION, id));
};

// Add Task
export const addTaskToList = async (listId: string, description: string, assignee: string, dueDate?: string) => {
  const db = getDb();
  if (!db) return;

  const listRef = doc(db, LISTS_COLLECTION, listId);
  const listSnap = await getDoc(listRef);
  
  if (listSnap.exists()) {
    const listData = listSnap.data() as TaskList;
    const newTask: Task = {
      id: crypto.randomUUID(),
      description,
      assignee,
      completed: false,
      createdAt: Date.now(),
      dueDate
    };
    
    await updateDoc(listRef, {
      tasks: [...listData.tasks, newTask]
    });
  }
};

// Update Task (Edit)
export const updateTask = async (listId: string, taskId: string, updates: Partial<Task>) => {
  const db = getDb();
  if (!db) return;

  const listRef = doc(db, LISTS_COLLECTION, listId);
  const listSnap = await getDoc(listRef);
  
  if (listSnap.exists()) {
    const listData = listSnap.data() as TaskList;
    const updatedTasks = listData.tasks.map(t => 
      t.id === taskId ? { ...t, ...updates } : t
    );
    
    await updateDoc(listRef, { tasks: updatedTasks });
  }
};

// Toggle Task
export const toggleTaskCompletion = async (listId: string, taskId: string) => {
  const db = getDb();
  if (!db) return;

  const listRef = doc(db, LISTS_COLLECTION, listId);
  const listSnap = await getDoc(listRef);
  
  if (listSnap.exists()) {
    const listData = listSnap.data() as TaskList;
    const updatedTasks = listData.tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    
    await updateDoc(listRef, { tasks: updatedTasks });
  }
};

// Delete Task
export const removeTaskFromList = async (listId: string, taskId: string) => {
  const db = getDb();
  if (!db) return;

  const listRef = doc(db, LISTS_COLLECTION, listId);
  const listSnap = await getDoc(listRef);
  
  if (listSnap.exists()) {
    const listData = listSnap.data() as TaskList;
    const updatedTasks = listData.tasks.filter(t => t.id !== taskId);
    
    await updateDoc(listRef, { tasks: updatedTasks });
  }
};

// Fallback for loadLists to avoid breakages before async migration is fully complete in components
export const loadLists = (): TaskList[] => {
  return []; // Deprecated synchronous load
};