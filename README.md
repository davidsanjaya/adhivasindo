# TaskFlow

A responsive Kanban task management application built with **Ionic React and TypeScript**. TaskFlow helps users organize tasks, manage workflows, collaborate through team assignments, and track progress across customizable boards.

## Features

### 📋 Kanban Board

- Create, rename, and delete columns.
- Create, edit, and delete tasks.
- Drag and drop tasks between columns.
- Reorder tasks within columns.
- Support for empty columns and customizable workflows.

### 📝 Task Management

- Task descriptions and due dates.
- Task labels and priority levels.
- Assign tasks to team members.
- Checklists and subtask progress.
- Cover image uploads.

### 📎 File Attachments

- Upload multiple attachments.
- Support for common document, spreadsheet, presentation, archive, and image formats.
- Download uploaded files.
- Remove attachments.
- Persistent file storage using IndexedDB.

### 🔍 Search & Filtering

- Search tasks by title.
- Filter by assigned team member.
- Filter by task label.
- Combine multiple filters.
- Reset filters.

### 💾 Data Persistence

- Zustand for application state management.
- Local storage persistence for board data.
- IndexedDB for cover images and file attachments.
- Export and import board data.

### 📱 Responsive Design

- Desktop, tablet, and mobile layouts.
- Mobile-friendly drag-and-drop interactions.
- Horizontally scrollable Kanban board.

## Tech Stack

| Technology      | Purpose                                            |
| --------------- | -------------------------------------------------- |
| React           | UI development                                     |
| TypeScript      | Type safety                                        |
| Ionic React     | UI components and responsive application structure |
| Vite            | Development server and build tooling               |
| Zustand         | State management                                   |
| Zustand Persist | Persistent application state                       |
| dnd-kit         | Drag-and-drop functionality                        |
| Lucide React    | Icons                                              |
| IndexedDB       | File and image storage                             |

## Getting Started

### Prerequisites

- Node.js
- npm
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/davidsanjaya/adhivasindo.git
   ```

2. Navigate to the project directory:

   ```bash
   cd adhivasindo
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed in your terminal.

### Production Build

To create a production build:

```bash
npm run build
```

## Data Storage

TaskFlow uses two browser storage mechanisms:

- **Local Storage:** Stores board data, task information, columns, and application state through Zustand Persist.
- **IndexedDB:** Stores actual image and attachment file contents, while their metadata and file identifiers are maintained in the application state.

Uploaded files are stored locally in the browser and are not automatically synchronized between different browsers or devices.

## Project Structure

```text
src/
├── components/
│   ├── board/
│   ├── task/
│   └── ...
├── store/
├── types/
├── utils/
├── theme/
├── App.tsx
└── main.tsx
```

## Future Improvements

Potential enhancements include:

- Backend integration and cloud synchronization.
- User authentication and authorization.
- Real-time team collaboration.
- Shared boards across multiple devices.
- Advanced task analytics and reporting.

## Author

**David Sanjaya**

GitHub: [@davidsanjaya](https://github.com/davidsanjaya)

---

Built with React, TypeScript, and Ionic.
