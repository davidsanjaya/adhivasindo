import { IonHeader, IonToolbar, IonButton, IonAvatar } from '@ionic/react';
import { ChevronDown, Plus, Lock } from 'lucide-react';
import type { ReactNode } from 'react';

import { useBoardStore } from '../../store/boardStore';

import './Header.css';

interface HeaderProps {
  children: ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  const members = useBoardStore((state) => state.members);

  return (
    <IonHeader className="app-header">
      <IonToolbar>
        <div className="header-container">
          {/* Workspace */}
          <div className="workspace-selector">
            <Lock size={18} />
            <span>Adhivasindo</span>
            <ChevronDown size={18} />
          </div>

          {/* Team members */}
          <div className="header-members">
            {members.slice(0, 4).map((member) => (
              <IonAvatar key={member.id}>
                <img src={member.avatar} alt={member.name} />
              </IonAvatar>
            ))}

            <IonButton fill="clear" className="invite-button">
              <Plus size={16} />
              <span>Invite</span>
            </IonButton>
          </div>

          {/* Board controls */}
          <div className="header-board-controls">{children}</div>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
