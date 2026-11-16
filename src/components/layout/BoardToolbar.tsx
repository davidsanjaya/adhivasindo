import { IonButton, IonInput, IonSelect, IonSelectOption, useIonAlert, useIonToast } from '@ionic/react';
import { RotateCcw, Search, Download, Upload, Filter } from 'lucide-react';
import { useRef, useState } from 'react';

import { useBoardStore } from '../../store/boardStore';
import type { TaskFilters } from '../../types';
import { exportBoard, validateBackup } from '../../utils/boardBackup';

import './BoardToolbar.css';

interface BoardToolbarProps {
  filters: TaskFilters;
  onFilterChange: (key: keyof TaskFilters, value: string) => void;
  onResetFilters: () => void;
}

const BoardToolbar: React.FC<BoardToolbarProps> = ({ filters, onFilterChange, onResetFilters }) => {
  const members = useBoardStore((state) => state.members);
  const tasks = useBoardStore((state) => state.tasks);
  const columns = useBoardStore((state) => state.columns);
  const importData = useBoardStore((state) => state.importData);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const handleExport = () => {
    exportBoard(tasks, columns, members);

    presentToast({
      message: 'Board exported successfully!',
      duration: 2000,
      color: 'success',
      position: 'bottom',
    });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const fileContent = await file.text();
      const parsedData: unknown = JSON.parse(fileContent);

      if (!validateBackup(parsedData)) {
        throw new Error('Invalid backup file format.');
      }

      presentAlert({
        header: 'Import Board',
        message: 'Importing this backup will replace your current board data. Are you sure you want to continue?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Import',
            role: 'confirm',
            handler: () => {
              importData({
                tasks: parsedData.tasks,
                columns: parsedData.columns,
                members: parsedData.members,
              });

              presentToast({
                message: 'Board imported successfully!',
                duration: 2000,
                color: 'success',
                position: 'bottom',
              });
            },
          },
        ],
      });
    } catch {
      presentToast({
        message: 'Unable to import. Please select a valid TaskFlow backup.',
        duration: 3000,
        color: 'danger',
        position: 'bottom',
      });
    } finally {
      // Allow selecting the same file again.
      event.target.value = '';
    }
  };

  return (
    <section className="board-toolbar">
      <div className="toolbar-controls">
        {/* Filter */}
        <div className="filter-wrapper">
          <IonButton
            fill={isFilterOpen ? 'solid' : 'outline'}
            className={`filter-button ${isFilterOpen ? 'filter-button-active' : ''}`}
            onClick={() => setIsFilterOpen((previous) => !previous)}
          >
            <Filter size={18} />
            Filter
          </IonButton>
        </div>

        {/* Export / Import */}
        <div className="backup-actions">
          <IonButton fill="outline" onClick={handleExport}>
            <Download size={16} />
            Export
          </IonButton>

          <IonButton fill="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} />
            Import
          </IonButton>

          <input ref={fileInputRef} type="file" accept=".json,application/json" hidden onChange={handleImport} />
        </div>

        {/* Search */}
        <div className="search-container">
          <Search size={18} />

          <IonInput
            value={filters.searchTerm}
            placeholder="Search tasks..."
            className="search-input"
            onIonInput={(event) => onFilterChange('searchTerm', event.detail.value ?? '')}
          />
        </div>
      </div>
      {/* Filter dropdown */}
      {isFilterOpen && (
        <div className="filter-fields">
          <IonSelect
            value={filters.assigneeId}
            placeholder="All Assignees"
            interface="popover"
            onIonChange={(event) => onFilterChange('assigneeId', event.detail.value)}
          >
            <IonSelectOption value="">All Assignees</IonSelectOption>

            {members.map((member) => (
              <IonSelectOption key={member.id} value={member.id}>
                {member.name}
              </IonSelectOption>
            ))}
          </IonSelect>

          <IonSelect
            value={filters.label}
            placeholder="All Labels"
            interface="popover"
            onIonChange={(event) => onFilterChange('label', event.detail.value)}
          >
            <IonSelectOption value="">All Labels</IonSelectOption>
            <IonSelectOption value="Feature">Feature</IonSelectOption>
            <IonSelectOption value="Bug">Bug</IonSelectOption>
            <IonSelectOption value="Issue">Issue</IonSelectOption>
            <IonSelectOption value="Undefined">Undefined</IonSelectOption>
          </IonSelect>

          <IonButton
            fill="outline"
            className="filter-reset-button"
            onClick={onResetFilters}
            disabled={!filters.searchTerm && !filters.assigneeId && !filters.label}
          >
            <RotateCcw size={15} />
            Reset
          </IonButton>
        </div>
      )}
    </section>
  );
};

export default BoardToolbar;
