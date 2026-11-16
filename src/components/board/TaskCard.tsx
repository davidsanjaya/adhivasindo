import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IonCard, IonCardContent, IonBadge, IonAvatar, IonProgressBar } from '@ionic/react';
import { CalendarDays, CheckSquare, Paperclip, GripVertical } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useBoardStore } from '../../store/boardStore';
import type { Task } from '../../types';
import { getFile } from '../../utils/fileStorage';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }: TaskCardProps) => {
  const members = useBoardStore((state) => state.members);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  // Find assigned members
  const assignedMembers = members.filter((member) => task.assignees.includes(member.id));

  // Calculate checklist progress
  const completedItems = task.checklist.filter((item) => item.completed).length;

  const totalItems = task.checklist.length;

  const progress = totalItems > 0 ? completedItems / totalItems : 0;

  // Format due date
  const formattedDate = new Date(`${task.dueDate}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  useEffect(() => {
    let objectUrl = '';
    let cancelled = false;

    const loadCoverImage = async () => {
      if (!task.coverImage) {
        setCoverImageUrl('');
        return;
      }

      // Support existing image URLs.
      if (
        task.coverImage.startsWith('http://') ||
        task.coverImage.startsWith('https://') ||
        task.coverImage.startsWith('data:image/')
      ) {
        setCoverImageUrl(task.coverImage);
        return;
      }

      // Otherwise, retrieve the image from IndexedDB.
      try {
        const storedFile = await getFile(task.coverImage);

        if (!storedFile || cancelled) return;

        objectUrl = URL.createObjectURL(storedFile.blob);
        setCoverImageUrl(objectUrl);
      } catch (error) {
        console.error('Failed to load cover image:', error);
      }
    };

    loadCoverImage();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [task.coverImage]);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      }}
    >
      <IonCard className="task-card" button onClick={() => onClick(task)}>
        {/* Cover Image */}
        {coverImageUrl && (
          <div className="task-cover">
            <img src={coverImageUrl} alt={task.title} />
          </div>
        )}

        <IonCardContent className="task-card-content">
          {/* Label */}
          <div className="task-card-header">
            <IonBadge className={`task-label label-${task.label.toLowerCase()}`}>{task.label}</IonBadge>

            <button
              type="button"
              className="task-drag-handle"
              {...attributes}
              {...listeners}
              aria-label={`Drag ${task.title}`}
            >
              <GripVertical size={18} />
            </button>
          </div>

          {/* Checklist Progress */}
          {totalItems > 0 && (
            <div className="task-progress">
              <IonProgressBar value={progress} />
            </div>
          )}

          {/* Task Title */}
          <h3 className="task-title">{task.title}</h3>

          {/* Task Metadata */}
          <div className="task-footer">
            <div className="task-metadata">
              {/* Due Date */}
              {task.dueDate && (
                <span className="task-meta-item due-date">
                  <CalendarDays size={13} />
                  {formattedDate}
                </span>
              )}

              {/* Checklist */}
              {totalItems > 0 && (
                <span className="task-meta-item">
                  <CheckSquare size={13} />
                  {completedItems}/{totalItems}
                </span>
              )}

              {/* Attachments */}
              {task.attachments.length > 0 && (
                <span className="task-meta-item">
                  <Paperclip size={13} />
                  {task.attachments.length}
                </span>
              )}
            </div>

            {/* Assignees */}
            <div className="task-assignees">
              {assignedMembers.map((member) => (
                <IonAvatar key={member.id}>
                  <img src={member.avatar} alt={member.name} />
                </IonAvatar>
              ))}
            </div>
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default TaskCard;
