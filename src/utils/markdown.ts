/**
 * Formate le texte en ajoutant des espaces après la ponctuation si nécessaire
 * @param text - Le texte à formater
 * @returns Le texte formaté avec espaces après ponctuation
 */
export const formatMarkdownText = (text: string): string => {
  if (!text) return text;

  return text
    // Ajoute un espace après ! si suivi d'une lettre ou chiffre
    .replace(/!([A-Za-z0-9])/g, '! $1')
    // Ajoute un espace après ? si suivi d'une lettre ou chiffre
    .replace(/\?([A-Za-z0-9])/g, '? $1')
    // Ajoute un espace après . si suivi d'une lettre majuscule ou chiffre (début de phrase)
    .replace(/\.([A-Z0-9])/g, '. $1')
    // Ajoute un espace après , si suivi d'une lettre ou chiffre
    .replace(/,([A-Za-z0-9])/g, ', $1')
    // Nettoie les doubles espaces créés par les remplacements multiples
    .replace(/\s{2,}/g, ' ');
};
