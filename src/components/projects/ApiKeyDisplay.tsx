import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { copyToClipboard } from '@/lib/helpers';
import { toast } from 'sonner';

interface ApiKeyDisplayProps {
  apiKey: string;
  isSensitive?: boolean;
}

export const ApiKeyDisplay: React.FC<ApiKeyDisplayProps> = ({ apiKey, isSensitive = true }) => {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(!isSensitive);

  const handleCopy = async () => {
    const success = await copyToClipboard(apiKey);
    if (success) {
      setCopied(true);
      toast.success('Clé API copiée dans le presse-papiers');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Erreur lors de la copie');
    }
  };

  const displayKey = revealed ? apiKey : '•'.repeat(apiKey.length);

  return (
    <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Clé API générée
        </CardTitle>
        <CardDescription className="text-yellow-800 dark:text-yellow-200">
          {isSensitive && (
            <>
              ⚠️ Cette clé ne sera affichée qu'une seule fois. Copiez-la et conservez-la en lieu
              sûr.
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={displayKey} readOnly className="font-mono text-sm" />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setRevealed(!revealed)}
            title={revealed ? 'Masquer' : 'Révéler'}
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={handleCopy} title="Copier">
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        {isSensitive && (
          <p className="text-xs text-muted-foreground">
            Utilisez cette clé dans l'en-tête <code className="bg-muted px-1 py-0.5 rounded">X-API-Key</code> pour
            authentifier vos requêtes.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
