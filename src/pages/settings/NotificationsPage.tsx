import React from 'react';
import { ComingSoon } from '@/components/ui/coming-soon';
import { Bell } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  return (
    <ComingSoon
      title="Notifications"
      description="Gerez vos preferences de notifications et restez informe des evenements importants."
      icon={Bell}
      features={[
        'Notifications par email',
        'Notifications push',
        'Alertes en temps reel',
        'Configuration par type d\'evenement',
        'Resume quotidien/hebdomadaire',
        'Integration Slack et Discord',
      ]}
    />
  );
};
