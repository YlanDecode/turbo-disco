import React from 'react';
import { ComingSoon } from '@/components/ui/coming-soon';
import { Webhook } from 'lucide-react';

export const WebhooksPage: React.FC = () => {
  return (
    <ComingSoon
      title="Webhooks"
      description="Configurez des webhooks pour recevoir des notifications en temps reel sur les evenements de votre chatbot."
      icon={Webhook}
      features={[
        'Notifications en temps reel',
        'Configuration des evenements',
        'Historique des livraisons',
        'Tests et verification des signatures',
        'Retry automatique en cas d\'echec',
      ]}
    />
  );
};
