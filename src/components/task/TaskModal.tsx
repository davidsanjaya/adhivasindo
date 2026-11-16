import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonCheckbox,
} from '@ionic/react';
import { X, Trash2, Plus, Paperclip, Download } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useBoardStore } from '../../store/boardStore';
import type { Task, ChecklistItem, TaskLabel, TaskPriority, Attachment } from '../../types';
import { saveFile, getFile, deleteFile } from '../../utils/fileStorage';

import './TaskModal.css';

interface TaskModalProps {
  isOpen: boolean;
  task: Task | null;
  defaultColumnId?: string;
  onClose: () => void;
}

const ALLOWED_FILE_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.csv',
  '.zip',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
];

const isStoredFileId = (value: string) => {
  return (
    !value.startsWith('http://') &&
    !value.startsWith('https://') &&
    !value.startsWith('data:image/') &&
    !value.startsWith('blob:')
  );
};

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, task, defaultColumnId, onClose }: TaskModalProps) => {
  const columns = useBoardStore((state) => state.columns);
  const members = useBoardStore((state) => state.members);

  const addTask = useBoardStore((state) => state.addTask);
  const updateTask = useBoardStore((state) => state.updateTask);
  const deleteTask = useBoardStore((state) => state.deleteTask);

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [columnId, setColumnId] = useState(task?.columnId ?? defaultColumnId ?? columns[0]?.id ?? '');
  const [assignees, setAssignees] = useState<string[]>(task?.assignees ?? []);
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '');
  const [label, setLabel] = useState<TaskLabel>(task?.label ?? 'Feature');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'Medium');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(task?.checklist ?? []);

  const [newSubtask, setNewSubtask] = useState('');

  const [coverImage, setCoverImage] = useState(task?.coverImage ?? '');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');

  const [attachments, setAttachments] = useState<Attachment[]>(task?.attachments ?? []);

  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);

  const isEditing = task !== null;

  const handleAddSubtask = () => {
    const trimmedTitle = newSubtask.trim();

    if (!trimmedTitle) return;

    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      completed: false,
    };

    setChecklist((previous) => [...previous, newItem]);

    setNewSubtask('');
  };

  const handleToggleSubtask = (id: string) => {
    setChecklist((previous) =>
      previous.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setChecklist((previous) => previous.filter((item) => item.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim() || !columnId) return;

    const newlySavedFileIds: string[] = [];

    try {
      // Save new cover image if selected.
      let savedCoverImage = coverImage;

      if (coverImageFile) {
        savedCoverImage = await saveFile(coverImageFile);
        newlySavedFileIds.push(savedCoverImage);
      }

      // Save newly selected attachments.
      const newAttachments: Attachment[] = [];

      for (const file of pendingAttachments) {
        const fileId = await saveFile(file);

        newlySavedFileIds.push(fileId);

        newAttachments.push({
          id: fileId,
          name: file.name,
          type: file.type,
        });
      }

      // Combine existing and newly uploaded attachments.
      const savedAttachments = [...attachments, ...newAttachments];

      if (isEditing && task) {
        updateTask(task.id, {
          title: title.trim(),
          description,
          columnId,
          assignees,
          dueDate,
          label,
          priority,
          checklist,
          coverImage: savedCoverImage,
          attachments: savedAttachments,
        });
      } else {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: title.trim(),
          description,
          columnId,
          assignees,
          dueDate,
          label,
          priority,
          checklist,
          coverImage: savedCoverImage,
          attachments: savedAttachments,
          position: useBoardStore.getState().tasks.filter((item) => item.columnId === columnId).length,
        };

        addTask(newTask);
      }

      // Identify attachments removed by the user.
      const removedAttachments = (task?.attachments ?? []).filter(
        (oldAttachment) => !savedAttachments.some((current) => current.id === oldAttachment.id),
      );

      // Delete removed attachments from IndexedDB.
      for (const attachment of removedAttachments) {
        await deleteFile(attachment.id);
      }

      // Delete previous cover image if replaced or removed.
      const originalCoverImage = task?.coverImage ?? '';

      if (originalCoverImage && originalCoverImage !== savedCoverImage && isStoredFileId(originalCoverImage)) {
        await deleteFile(originalCoverImage);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);

      // Clean up files uploaded during this save attempt.
      for (const fileId of newlySavedFileIds) {
        try {
          await deleteFile(fileId);
        } catch (cleanupError) {
          console.error('Failed to clean up file:', cleanupError);
        }
      }

      alert('Something went wrong while saving the task.');
    }
  };

  const handleDelete = () => {
    if (!task) return;

    deleteTask(task.id);
    onClose();
  };

  useEffect(() => {
    let objectUrl = '';

    const loadCoverImage = async () => {
      if (!isOpen || !coverImage) {
        setCoverPreview('');
        return;
      }

      if (
        coverImage.startsWith('http://') ||
        coverImage.startsWith('https://') ||
        coverImage.startsWith('data:image/')
      ) {
        setCoverPreview(coverImage);
        return;
      }

      const storedFile = await getFile(coverImage);

      if (storedFile) {
        objectUrl = URL.createObjectURL(storedFile.blob);
        setCoverPreview(objectUrl);
      }
    };

    loadCoverImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [coverImage, isOpen]);

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a JPG, PNG, or WebP image.');
      return;
    }

    setCoverImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
  };

  const handleRemoveCoverImage = () => {
    setCoverImage('');
    setCoverImageFile(null);
    setCoverPreview('');
  };

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    const validFiles = files.filter((file) => {
      const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;

      return ALLOWED_FILE_EXTENSIONS.includes(extension);
    });

    if (validFiles.length !== files.length) {
      alert('Some files have unsupported formats.');
    }

    setPendingAttachments((previous) => [...previous, ...validFiles]);

    // Allow selecting the same file again.
    event.target.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((previous) => previous.filter((attachment) => attachment.id !== id));
  };

  const handleRemovePendingAttachment = (index: number) => {
    setPendingAttachments((previous) => previous.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleDownloadAttachment = async (attachment: Attachment) => {
    try {
      const storedFile = await getFile(attachment.id);

      if (!storedFile) {
        alert('File not found.');
        return;
      }

      const url = URL.createObjectURL(storedFile.blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the temporary URL after the download starts.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Failed to download attachment:', error);
      alert('Unable to download this file.');
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="task-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isEditing ? 'Edit Task' : 'Create Task'}</IonTitle>

          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <X size={20} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="task-form">
          {/* Title */}
          <div className="form-field">
            <IonLabel>Task Title *</IonLabel>

            <IonInput
              value={title}
              placeholder="Enter task title"
              onIonInput={(event) => setTitle(event.detail.value ?? '')}
            />
          </div>

          {/* Description */}
          <div className="form-field">
            <IonLabel>Description</IonLabel>

            <IonTextarea
              value={description}
              placeholder="Describe your task..."
              rows={4}
              onIonInput={(event) => setDescription(event.detail.value ?? '')}
            />
          </div>

          {/* Cover Image */}
          <div className="form-field">
            <IonLabel>Cover Image</IonLabel>

            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverImageChange} />

            {coverPreview && (
              <div className="cover-image-preview">
                <img src={coverPreview} alt="Task cover preview" />

                <IonButton color="danger" fill="outline" onClick={handleRemoveCoverImage}>
                  <Trash2 size={16} />
                  Remove Image
                </IonButton>
              </div>
            )}
          </div>

          {/* Assignees */}
          <div className="form-field">
            <IonLabel>Assignees</IonLabel>

            <IonSelect
              value={assignees}
              multiple
              placeholder="Select members"
              onIonChange={(event) => setAssignees(event.detail.value)}
            >
              {members.map((member) => (
                <IonSelectOption key={member.id} value={member.id}>
                  {member.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          {/* Due Date */}
          <div className="form-field">
            <IonLabel>Due Date</IonLabel>

            <IonInput type="date" value={dueDate} onIonChange={(event) => setDueDate(event.detail.value ?? '')} />
          </div>

          {/* Column */}
          <div className="form-field">
            <IonLabel>Column</IonLabel>

            <IonSelect value={columnId} onIonChange={(event) => setColumnId(event.detail.value)}>
              {columns.map((column) => (
                <IonSelectOption key={column.id} value={column.id}>
                  {column.title}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          {/* Label */}
          <div className="form-field">
            <IonLabel>Label</IonLabel>

            <IonSelect value={label} onIonChange={(event) => setLabel(event.detail.value)}>
              <IonSelectOption value="Feature">Feature</IonSelectOption>
              <IonSelectOption value="Bug">Bug</IonSelectOption>
              <IonSelectOption value="Issue">Issue</IonSelectOption>
              <IonSelectOption value="Undefined">Undefined</IonSelectOption>
            </IonSelect>
          </div>

          {/* Priority */}
          <div className="form-field">
            <IonLabel>Priority</IonLabel>

            <IonSelect value={priority} onIonChange={(event) => setPriority(event.detail.value)}>
              <IonSelectOption value="Low">Low</IonSelectOption>
              <IonSelectOption value="Medium">Medium</IonSelectOption>
              <IonSelectOption value="High">High</IonSelectOption>
            </IonSelect>
          </div>

          {/* Checklist */}
          <div className="form-field">
            <IonLabel>Checklist</IonLabel>

            <div className="checklist-items">
              {checklist.map((item) => (
                <div key={item.id} className="checklist-item">
                  <IonCheckbox checked={item.completed} onIonChange={() => handleToggleSubtask(item.id)} />

                  <span className={item.completed ? 'completed' : ''}>{item.title}</span>

                  <IonButton fill="clear" color="danger" onClick={() => handleDeleteSubtask(item.id)}>
                    <Trash2 size={16} />
                  </IonButton>
                </div>
              ))}
            </div>

            <div className="add-subtask">
              <IonInput
                value={newSubtask}
                placeholder="Add a subtask..."
                onIonInput={(event) => setNewSubtask(event.detail.value ?? '')}
              />

              <IonButton fill="clear" onClick={handleAddSubtask}>
                <Plus size={18} />
              </IonButton>
            </div>
          </div>

          {/* Attachments */}
          <div className="form-field">
            <IonLabel>Attachments</IonLabel>

            <input type="file" multiple accept={ALLOWED_FILE_EXTENSIONS.join(',')} onChange={handleAttachmentChange} />

            <div className="attachment-list">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="attachment-item">
                  <Paperclip size={16} />

                  <span>{attachment.name}</span>

                  <IonButton fill="clear" color="primary" onClick={() => handleDownloadAttachment(attachment)}>
                    <Download size={16} />
                  </IonButton>

                  <IonButton fill="clear" color="danger" onClick={() => handleRemoveAttachment(attachment.id)}>
                    <Trash2 size={16} />
                  </IonButton>
                </div>
              ))}

              {pendingAttachments.map((file, index) => (
                <div key={`${file.name}-${index}`} className="attachment-item">
                  <Paperclip size={16} />

                  <span>{file.name}</span>

                  <IonButton fill="clear" color="danger" onClick={() => handleRemovePendingAttachment(index)}>
                    <Trash2 size={16} />
                  </IonButton>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="task-form-actions">
            {isEditing && (
              <IonButton color="danger" fill="outline" onClick={handleDelete}>
                <Trash2 size={16} />
                Delete
              </IonButton>
            )}

            <div className="form-actions-right">
              <IonButton fill="outline" color="medium" onClick={onClose}>
                Discard
              </IonButton>

              <IonButton onClick={handleSave}>Save</IonButton>
            </div>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default TaskModal;
