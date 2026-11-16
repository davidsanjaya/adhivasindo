import { arrayMove } from '@dnd-kit/sortable';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { initialTasks, initialColumns, initialMembers } from '../data/initialData';
import type { Task, Column, TeamMember } from '../types';

interface BoardStore {
  tasks: Task[];
  columns: Column[];
  members: TeamMember[];

  // Column operations
  addColumn: (title: string) => void;
  updateColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;

  // Task operations
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, targetColumnId: string, targetIndex: number) => void;

  importData: (data: { tasks: Task[]; columns: Column[]; members: TeamMember[] }) => void;
}

export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      tasks: initialTasks,
      columns: initialColumns,
      members: initialMembers,
      addColumn: (title: string) => {
        const newColumn: Column = {
          id: crypto.randomUUID(),
          title,
          order: Math.max(-1, ...get().columns.map((column) => column.order)) + 1,
        };
        set((state) => ({
          columns: [...state.columns, newColumn],
        }));
      },
      updateColumn: (id: string, title: string) => {
        set((state) => ({
          columns: state.columns.map((column) => (column.id === id ? { ...column, title } : column)),
        }));
      },
      deleteColumn: (id: string) => {
        const hasTasks = get().tasks.some((task) => task.columnId === id);

        if (hasTasks) return;

        set((state) => ({
          columns: state.columns.filter((column) => column.id !== id),
        }));
      },
      addTask: (task: Task) => {
        set((state) => ({
          tasks: [...state.tasks, task],
        }));
      },
      updateTask: (id: string, updates: Partial<Task>) => {
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
        }));
      },
      deleteTask: (id: string) => {
        set((state) => {
          const task = state.tasks.find((task) => task.id === id);

          if (!task) return state;

          const remainingTasks = state.tasks
            .filter((item) => item.id !== id)
            .map((item) => {
              if (item.columnId !== task.columnId) {
                return item;
              }

              if (item.position > task.position) {
                return {
                  ...item,
                  position: item.position - 1,
                };
              }

              return item;
            });

          return { tasks: remainingTasks };
        });
      },
      moveTask: (taskId, targetColumnId, targetIndex) => {
        set((state) => {
          const activeTask = state.tasks.find((task) => task.id === taskId);

          if (!activeTask) return state;

          const sourceColumnId = activeTask.columnId;

          // Get source column tasks
          const sourceTasks = state.tasks
            .filter((task) => task.columnId === sourceColumnId)
            .sort((a, b) => a.position - b.position);

          // Same column: reorder tasks
          if (sourceColumnId === targetColumnId) {
            const oldIndex = sourceTasks.findIndex((task) => task.id === taskId);

            const newIndex = Math.max(0, Math.min(targetIndex, sourceTasks.length - 1));

            if (oldIndex === newIndex) return state;

            const reorderedTasks = arrayMove(sourceTasks, oldIndex, newIndex);

            const updatedTasks = new Map(reorderedTasks.map((task, index) => [task.id, { ...task, position: index }]));

            return {
              tasks: state.tasks.map((task) => updatedTasks.get(task.id) ?? task),
            };
          }

          // Different column: move task
          const remainingSourceTasks = sourceTasks.filter((task) => task.id !== taskId);

          const destinationTasks = state.tasks
            .filter((task) => task.columnId === targetColumnId)
            .sort((a, b) => a.position - b.position);

          const newDestinationTasks = [...destinationTasks];

          const safeIndex = Math.max(0, Math.min(targetIndex, newDestinationTasks.length));

          newDestinationTasks.splice(safeIndex, 0, {
            ...activeTask,
            columnId: targetColumnId,
          });

          // Recalculate positions in both columns
          const updatedTasks = new Map([
            ...remainingSourceTasks.map((task, index) => [task.id, { ...task, position: index }] as const),

            ...newDestinationTasks.map((task, index) => [task.id, { ...task, position: index }] as const),
          ]);

          return {
            tasks: state.tasks.map((task) => updatedTasks.get(task.id) ?? task),
          };
        });
      },
      importData: (data) => {
        set({
          tasks: data.tasks,
          columns: data.columns,
          members: data.members,
        });
      },
    }),
    {
      name: 'taskflow-storage',
    },
  ),
);
