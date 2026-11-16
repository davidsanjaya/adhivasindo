import type { Column, Task, TeamMember } from '../types';

export const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    order: 0,
  },
  {
    id: 'doing',
    title: 'Doing',
    order: 1,
  },
  {
    id: 'review',
    title: 'Review',
    order: 2,
  },
  {
    id: 'done',
    title: 'Done',
    order: 3,
  },
  {
    id: 'rework',
    title: 'Rework',
    order: 4,
  },
];

export const initialMembers: TeamMember[] = [
  {
    id: 'member-1',
    name: 'David',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 'member-2',
    name: 'Sarah',
    avatar: 'https://i.pravatar.cc/150?img=47',
  },
  {
    id: 'member-3',
    name: 'Michael',
    avatar: 'https://i.pravatar.cc/150?img=11',
  },
  {
    id: 'member-4',
    name: 'Jessica',
    avatar: 'https://i.pravatar.cc/150?img=44',
  },
  {
    id: 'member-5',
    name: 'Alex',
    avatar: 'https://i.pravatar.cc/150?img=13',
  },
];

export const initialTasks: Task[] = [
  // TO DO
  {
    id: 'task-1',
    title: 'Research podcast and video website',
    description: 'Research competitors and identify opportunities for the new platform.',
    columnId: 'todo',
    assignees: ['member-1', 'member-2'],
    dueDate: '2026-11-17',
    label: 'Feature',
    priority: 'High',
    checklist: [
      {
        id: 'check-1',
        title: 'Research competitors',
        completed: true,
      },
      {
        id: 'check-2',
        title: 'Identify target audience',
        completed: false,
      },
      {
        id: 'check-3',
        title: 'Prepare research report',
        completed: false,
      },
    ],
    attachments: [
      {
        id: 'attachment-1',
        name: 'research.pdf',
        type: 'application/pdf',
      },
    ],
    position: 0,
  },
  {
    id: 'task-2',
    title: 'Debug checkout process',
    description: 'Investigate payment failures during checkout.',
    columnId: 'todo',
    assignees: ['member-3'],
    dueDate: '2026-11-19',
    label: 'Bug',
    priority: 'High',
    checklist: [],
    attachments: [],
    position: 1,
  },

  // DOING
  {
    id: 'task-3',
    title: 'Design wireframes for landing page',
    description: 'Create wireframes for the new landing page.',
    columnId: 'doing',
    assignees: ['member-2', 'member-4'],
    dueDate: '2026-11-18',
    label: 'Feature',
    priority: 'Medium',
    checklist: [
      {
        id: 'check-4',
        title: 'Create desktop wireframe',
        completed: true,
      },
      {
        id: 'check-5',
        title: 'Create mobile wireframe',
        completed: false,
      },
    ],
    attachments: [],
    position: 0,
  },
  {
    id: 'task-4',
    title: 'Install marketing tools',
    description: 'Set up analytics and marketing integrations.',
    columnId: 'doing',
    assignees: ['member-1'],
    dueDate: '2026-11-20',
    label: 'Undefined',
    checklist: [],
    attachments: [],
    position: 1,
    coverImage: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600',
  },

  // REVIEW
  {
    id: 'task-5',
    title: 'Create and refine logo designs',
    description: 'Review logo concepts and finalize the brand identity.',
    columnId: 'review',
    assignees: ['member-3', 'member-5'],
    dueDate: '2026-11-16',
    label: 'Issue',
    priority: 'Medium',
    checklist: [
      {
        id: 'check-6',
        title: 'Review initial concepts',
        completed: true,
      },
      {
        id: 'check-7',
        title: 'Collect feedback',
        completed: true,
      },
      {
        id: 'check-8',
        title: 'Finalize logo',
        completed: false,
      },
    ],
    attachments: [],
    position: 0,
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600',
  },

  // DONE
  {
    id: 'task-6',
    title: 'Create email page layout',
    description: 'Implement the necessary email page components.',
    columnId: 'done',
    assignees: ['member-2'],
    dueDate: '2026-11-12',
    label: 'Feature',
    priority: 'Low',
    checklist: [
      {
        id: 'check-9',
        title: 'Create email layout',
        completed: true,
      },
      {
        id: 'check-10',
        title: 'Implement responsive design',
        completed: true,
      },
    ],
    attachments: [],
    position: 0,
  },

  // REWORK
  {
    id: 'task-7',
    title: 'Blog edit page modification',
    description: 'Improve the blog editing page and playlist page design.',
    columnId: 'rework',
    assignees: ['member-1', 'member-4'],
    dueDate: '2026-11-21',
    label: 'Feature',
    priority: 'High',
    checklist: [
      {
        id: 'check-11',
        title: 'Review existing layout',
        completed: true,
      },
      {
        id: 'check-12',
        title: 'Fix responsive issues',
        completed: true,
      },
      {
        id: 'check-13',
        title: 'Update visual design',
        completed: false,
      },
      {
        id: 'check-14',
        title: 'Final review',
        completed: false,
      },
    ],
    attachments: [],
    position: 0,
  },
  {
    id: 'task-8',
    title: 'Plan training sessions',
    description: 'Organize and execute training sessions for new hires.',
    columnId: 'rework',
    assignees: ['member-3', 'member-5'],
    dueDate: '2026-11-22',
    label: 'Issue',
    priority: 'Medium',
    checklist: [],
    attachments: [],
    position: 1,
    coverImage: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=600',
  },
];
