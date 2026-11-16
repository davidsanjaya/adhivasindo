import type { Task, Column, TeamMember } from '../types';

export interface BoardBackup {
  version: number;
  exportedAt: string;
  tasks: Task[];
  columns: Column[];
  members: TeamMember[];
}

export const exportBoard = (tasks: Task[], columns: Column[], members: TeamMember[]): void => {
  const backup: BoardBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
    columns,
    members,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'taskflow-backup.json';

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export const validateBackup = (data: unknown): data is BoardBackup => {
  if (!isObject(data)) return false;

  if (
    data.version !== 1 ||
    !Array.isArray(data.tasks) ||
    !Array.isArray(data.columns) ||
    !Array.isArray(data.members)
  ) {
    return false;
  }

  const validMembers = data.members.every(
    (member) =>
      isObject(member) &&
      typeof member.id === 'string' &&
      typeof member.name === 'string' &&
      typeof member.avatar === 'string',
  );

  const validColumns = data.columns.every(
    (column) =>
      isObject(column) &&
      typeof column.id === 'string' &&
      typeof column.title === 'string' &&
      typeof column.order === 'number',
  );

  const validTasks = data.tasks.every((task) => {
    if (!isObject(task)) return false;

    return (
      typeof task.id === 'string' &&
      typeof task.title === 'string' &&
      typeof task.description === 'string' &&
      typeof task.columnId === 'string' &&
      Array.isArray(task.assignees) &&
      task.assignees.every((id) => typeof id === 'string') &&
      typeof task.dueDate === 'string' &&
      ['Feature', 'Bug', 'Issue', 'Undefined'].includes(task.label as string) &&
      (task.priority === undefined || ['Low', 'Medium', 'High'].includes(task.priority as string)) &&
      Array.isArray(task.checklist) &&
      task.checklist.every(
        (item) =>
          isObject(item) &&
          typeof item.id === 'string' &&
          typeof item.title === 'string' &&
          typeof item.completed === 'boolean',
      ) &&
      Array.isArray(task.attachments) &&
      task.attachments.every(
        (attachment) =>
          isObject(attachment) &&
          typeof attachment.id === 'string' &&
          typeof attachment.name === 'string' &&
          typeof attachment.type === 'string',
      ) &&
      (task.coverImage === undefined || typeof task.coverImage === 'string') &&
      typeof task.position === 'number'
    );
  });

  return validMembers && validColumns && validTasks;
};
