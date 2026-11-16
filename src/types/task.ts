export type TaskLabel = 'Feature' | 'Bug' | 'Issue' | 'Undefined';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;

  columnId: string;

  assignees: string[];
  dueDate: string;

  label: TaskLabel;
  priority?: TaskPriority;

  checklist: ChecklistItem[];
  attachments: Attachment[];

  coverImage?: string;

  position: number;
}
