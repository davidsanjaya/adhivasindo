import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';

import KanbanBoard from '../components/board/KanbanBoard';
import BoardToolbar from '../components/layout/BoardToolbar';
import Header from '../components/layout/Header';
import TaskModal from '../components/task/TaskModal';
import type { Task, TaskFilters } from '../types';

const Home: React.FC = () => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [defaultColumnId, setDefaultColumnId] = useState<string>();

  const [filters, setFilters] = useState<TaskFilters>({
    searchTerm: '',
    assigneeId: '',
    label: '',
  });

  const handleCreateTask = (columnId?: string) => {
    setSelectedTask(null);
    setDefaultColumnId(columnId);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleFilterChange = (key: keyof TaskFilters, value: string) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: '',
      assigneeId: '',
      label: '',
    });
  };

  return (
    <IonPage>
      <Header>
        <BoardToolbar filters={filters} onFilterChange={handleFilterChange} onResetFilters={handleResetFilters} />
      </Header>

      <IonContent fullscreen>
        <KanbanBoard filters={filters} onAddTask={handleCreateTask} onEditTask={handleEditTask} />

        <TaskModal
          key={`${isTaskModalOpen}-${selectedTask?.id ?? 'new'}-${defaultColumnId ?? ''}`}
          isOpen={isTaskModalOpen}
          task={selectedTask}
          defaultColumnId={defaultColumnId}
          onClose={() => setIsTaskModalOpen(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
