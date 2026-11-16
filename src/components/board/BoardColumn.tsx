import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { IonButton } from '@ionic/react';
import { Plus, MoreVertical } from 'lucide-react';

import type { Column, Task } from '../../types';

import './BoardColumn.css';

import TaskCard from './TaskCard';

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onOpenActions: (column: Column) => void;
}

const BoardColumn: React.FC<BoardColumnProps> = ({
  column,
  tasks,
  onEditTask,
  onAddTask,
  onOpenActions,
}: BoardColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      columnId: column.id,
    },
  });
  return (
    <div ref={setNodeRef} className="board-column">
      <div className="column-header">
        <div className="column-title">
          <h3>{column.title}</h3>

          <span className="task-count">{tasks.length}</span>
        </div>

        <div className="column-actions">
          <IonButton fill="clear" size="small" onClick={() => onAddTask(column.id)}>
            <Plus size={18} />
          </IonButton>

          <IonButton fill="clear" size="small" onClick={() => onOpenActions(column)}>
            <MoreVertical size={18} />
          </IonButton>
        </div>
      </div>

      <div className="column-tasks">
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            tasks.map((task) => <TaskCard key={task.id} task={task} onClick={() => onEditTask(task)} />)
          ) : (
            <div className="empty-column">No tasks yet</div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default BoardColumn;
