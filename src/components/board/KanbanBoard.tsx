import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { IonButton, IonAlert, IonActionSheet, IonCard, IonCardContent, IonBadge } from '@ionic/react';
import { createOutline, trashOutline } from 'ionicons/icons';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { useBoardStore } from '../../store/boardStore';
import type { Column, Task, TaskFilters } from '../../types';

import BoardColumn from './BoardColumn';

import './KanbanBoard.css';

interface KanbanBoardProps {
  filters: TaskFilters;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ filters, onAddTask, onEditTask }) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const columns = useBoardStore((state) => state.columns);
  const tasks = useBoardStore((state) => state.tasks);
  const addColumn = useBoardStore((state) => state.addColumn);
  const moveTask = useBoardStore((state) => state.moveTask);
  const updateColumn = useBoardStore((state) => state.updateColumn);
  const deleteColumn = useBoardStore((state) => state.deleteColumn);

  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);

  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteBlockedOpen, setIsDeleteBlockedOpen] = useState(false);

  const handleAddColumn = (title: string) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    addColumn(trimmedTitle);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(filters.searchTerm.toLowerCase().trim());

    const matchesAssignee = !filters.assigneeId || task.assignees.includes(filters.assigneeId);

    const matchesLabel = !filters.label || task.label === filters.label;

    return matchesSearch && matchesAssignee && matchesLabel;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    try {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const activeTask = tasks.find((task) => task.id === active.id);

      if (!activeTask) return;

      const overData = over.data.current;

      let targetColumnId: string;
      let targetIndex: number;

      // Dropped directly onto a column
      if (overData?.type === 'column') {
        targetColumnId = overData.columnId;

        targetIndex = tasks.filter((task) => task.columnId === targetColumnId).length;
      } else {
        // Dropped onto another task
        const overTask = tasks.find((task) => task.id === over.id);

        if (!overTask) return;

        targetColumnId = overTask.columnId;

        const destinationTasks = tasks
          .filter((task) => task.columnId === targetColumnId)
          .sort((a, b) => a.position - b.position);

        targetIndex = destinationTasks.findIndex((task) => task.id === overTask.id);

        if (targetIndex === -1) return;
      }

      moveTask(activeTask.id, targetColumnId, targetIndex);
    } finally {
      setActiveTask(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((task) => task.id === event.active.id);

    setActiveTask(task ?? null);
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  const handleOpenActions = (column: Column) => {
    setSelectedColumn(column);
    setIsActionSheetOpen(true);
  };

  return (
    <section className="kanban-section">
      <DragOverlay
        dropAnimation={{
          duration: 180,
          easing: 'ease',
        }}
      >
        {activeTask && (
          <div className="task-card-drag-overlay">
            <IonCard className="task-card">
              {activeTask.coverImage && (
                <div className="task-cover">
                  <img src={activeTask.coverImage} alt={activeTask.title} />
                </div>
              )}

              <IonCardContent className="task-card-content">
                <IonBadge className={`task-label label-${activeTask.label.toLowerCase()}`}>{activeTask.label}</IonBadge>

                <h3 className="task-title">{activeTask.title}</h3>
              </IonCardContent>
            </IonCard>
          </div>
        )}
      </DragOverlay>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="kanban-board">
          {columns
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((column) => {
              const columnTasks = filteredTasks
                .filter((task) => task.columnId === column.id)
                .sort((a, b) => a.position - b.position);

              return (
                <BoardColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  onAddTask={onAddTask}
                  onEditTask={onEditTask}
                  onOpenActions={handleOpenActions}
                />
              );
            })}

          <div className="add-list-container">
            <IonButton expand="block" fill="clear" className="add-list-button" onClick={() => setIsAlertOpen(true)}>
              <Plus size={18} />
              Add new list
            </IonButton>
          </div>
        </div>
      </DndContext>

      <IonAlert
        isOpen={isAlertOpen}
        header="Create New List"
        message="Enter a name for your new column."
        inputs={[
          {
            name: 'title',
            type: 'text',
            placeholder: 'e.g. Testing',
          },
        ]}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Create',
            role: 'confirm',
          },
        ]}
        onDidDismiss={(event) => {
          if (event.detail.role === 'confirm') {
            handleAddColumn(event.detail.data?.values?.title ?? '');
          }

          setIsAlertOpen(false);
        }}
      />

      <IonActionSheet
        isOpen={isActionSheetOpen}
        header={selectedColumn?.title}
        buttons={[
          {
            text: 'Rename',
            icon: createOutline,
            handler: () => {
              setIsRenameOpen(true);
            },
          },
          {
            text: 'Delete',
            role: 'destructive',
            icon: trashOutline,
            handler: () => {
              const hasTasks = tasks.some((task) => task.columnId === selectedColumn?.id);

              if (hasTasks) {
                setIsDeleteBlockedOpen(true);
              } else {
                setIsDeleteOpen(true);
              }
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
          },
        ]}
        onDidDismiss={() => setIsActionSheetOpen(false)}
      />

      <IonAlert
        isOpen={isRenameOpen}
        header="Rename Column"
        inputs={[
          {
            name: 'title',
            type: 'text',
            value: selectedColumn?.title,
            placeholder: 'Enter column name',
          },
        ]}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Save',
            role: 'confirm',
          },
        ]}
        onDidDismiss={(event) => {
          if (event.detail.role === 'confirm' && selectedColumn) {
            const title = event.detail.data?.values?.title?.trim();

            if (title) {
              updateColumn(selectedColumn.id, title);
            }
          }

          setIsRenameOpen(false);
        }}
      />

      <IonAlert
        isOpen={isDeleteOpen}
        header="Delete Column"
        message={`Are you sure you want to delete "${selectedColumn?.title}"?`}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Delete',
            role: 'confirm',
          },
        ]}
        onDidDismiss={(event) => {
          if (event.detail.role === 'confirm' && selectedColumn) {
            deleteColumn(selectedColumn.id);
          }

          setIsDeleteOpen(false);
        }}
      />

      <IonAlert
        isOpen={isDeleteBlockedOpen}
        header="Cannot Delete Column"
        message="This column still contains tasks. Move or delete all tasks before deleting this column."
        buttons={['OK']}
        onDidDismiss={() => setIsDeleteBlockedOpen(false)}
      />
    </section>
  );
};

export default KanbanBoard;
