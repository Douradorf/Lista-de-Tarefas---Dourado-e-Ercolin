import React, { useState, useEffect } from 'react';
import { RouteState } from './types';
import { Dashboard } from './components/Dashboard';
import { TaskListView } from './components/TaskListView';
import { SetupScreen } from './components/SetupScreen';
import { isConfigured, initFirebase } from './services/firebase';

const App: React.FC = () => {
  const [route, setRoute] = useState<RouteState>({ view: 'dashboard' });
  const [isOwner, setIsOwner] = useState<boolean>(false);
  
  // Initialize Firebase immediately on load
  useEffect(() => {
    initFirebase();
  }, []);

  // Simple Hash Router Implementation & Admin Check
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      // Admin Logic:
      // If we are at the root (Dashboard), we mark this session as Admin/Owner.
      // If we are at a specific list, we check if we have the Admin flag from a previous visit to Dashboard.
      const isDashboard = hash === '' || hash === '#/';
      
      if (isDashboard) {
        sessionStorage.setItem('dourado_ercolin_owner', 'true');
        setIsOwner(true);
        setRoute({ view: 'dashboard' });
      } else if (hash.startsWith('#/list/')) {
        const id = hash.replace('#/list/', '');
        // Check if session has owner flag
        const hasOwnerSession = sessionStorage.getItem('dourado_ercolin_owner') === 'true';
        setIsOwner(hasOwnerSession);
        setRoute({ view: 'list', listId: id });
      } else {
        setRoute({ view: 'dashboard' });
      }
    };

    // Initialize
    handleHashChange();

    // Listen
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Safety check, though isConfigured is now always true in services/firebase.ts
  if (!isConfigured()) {
    return <SetupScreen />;
  }

  const navigateToDashboard = () => {
    window.location.hash = '';
  };

  const navigateToList = (id: string) => {
    window.location.hash = `#/list/${id}`;
  };

  return (
    <>
      {route.view === 'dashboard' && (
        <Dashboard onSelectList={navigateToList} />
      )}
      
      {route.view === 'list' && route.listId && (
        <TaskListView 
          listId={route.listId} 
          onBack={navigateToDashboard}
          isOwner={isOwner}
        />
      )}
    </>
  );
};

export default App;