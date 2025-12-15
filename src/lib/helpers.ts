import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Formater une date ISO en texte lisible
export const formatDate = (isoDate: string): string => {
  try {
    return format(parseISO(isoDate), 'dd/MM/yyyy à HH:mm', { locale: fr });
  } catch {
    return isoDate;
  }
};

// Formater une date en "il y a X temps"
export const formatRelativeTime = (isoDate: string): string => {
  try {
    return formatDistanceToNow(parseISO(isoDate), { addSuffix: true, locale: fr });
  } catch {
    return isoDate;
  }
};

// Copier du texte dans le presse-papiers
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// Formater la taille de fichier
export const formatFileSize = (bytes: number | null): string => {
  if (bytes === null) return 'Inconnu';
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Masquer une clé API (afficher seulement le début et la fin)
export const maskApiKey = (apiKey: string): string => {
  if (apiKey.length < 16) return '****';
  return `${apiKey.substring(0, 8)}****${apiKey.substring(apiKey.length - 4)}`;
};

// Valider une extension de fichier
export const isValidFileExtension = (filename: string, validExtensions: string[]): boolean => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? validExtensions.includes(ext) : false;
};

// Truncate text with ellipsis
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
