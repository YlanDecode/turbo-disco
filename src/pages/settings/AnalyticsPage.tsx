import React from 'react';
import { ComingSoon } from '@/components/ui/coming-soon';
import { BarChart3 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  return (
    <ComingSoon
      title="Analytics"
      description="Analysez les performances de votre chatbot avec des statistiques detaillees et des graphiques interactifs."
      icon={BarChart3}
      features={[
        'Statistiques de conversations',
        'Taux de satisfaction utilisateur',
        'Questions les plus frequentes',
        'Temps de reponse moyen',
        'Exportation des rapports',
        'Tableaux de bord personnalisables',
      ]}
    />
  );
};
