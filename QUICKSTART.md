# 🚀 Guide de Démarrage Rapide

## Étape 1 : Installation

```bash
npm install
```

Cette commande installe toutes les dépendances nécessaires :
- React 19 + TypeScript
- React Router pour la navigation
- TanStack Query (React Query) pour la gestion du cache
- Axios pour les requêtes HTTP
- TailwindCSS pour le styling
- Sonner pour les notifications
- Et bien d'autres...

## Étape 2 : Vérifier le Backend

Assurez-vous que le backend MADABEST est démarré :

```bash
curl http://localhost:8089/api/v1/ping
# Réponse attendue: {"message":"pong"}
```

Si le backend n'est pas démarré, lancez-le depuis le dossier `llm-ai/` :

```bash
cd ../LANTORIAN/MADABEST/llm-ai
python -m uvicorn app.main:app --reload --port 8089
```

## Étape 3 : Lancer le Frontend

```bash
npm run dev
```

Le frontend sera accessible sur : **http://localhost:5173**

## Étape 4 : Premier Projet

1. Ouvrez http://localhost:5173
2. Cliquez sur **"Créer mon premier projet"**
3. Remplissez les champs :
   - **Nom** : Mon Premier Projet
   - **Assistant** : Assistant MADABEST
   - **Entreprise** : MADABEST
4. Cliquez sur **"Créer le projet"**
5. **⚠️ IMPORTANT** : Copiez immédiatement la clé API affichée !
6. Cliquez sur **"Continuer vers le chat"**

## Étape 5 : Premier Chat

1. Dans l'interface de chat, tapez : "Bonjour, comment puis-je utiliser cet assistant ?"
2. Appuyez sur `Ctrl+Enter` ou cliquez sur le bouton d'envoi
3. Observez la réponse arriver en streaming !

## Étape 6 : Upload de Documents

1. Accédez à l'onglet **"RAG"** dans la navigation
2. Glissez-déposez un fichier PDF, TXT ou MD
3. Attendez la confirmation d'upload
4. Retournez au chat et posez des questions sur le document !

## 🎯 Prochaines Étapes

- **Personnaliser l'assistant** : Allez dans Projets → Éditer
- **Gérer les conversations** : Consultez l'historique
- **Explorer l'API** : Consultez `api-v1.yml` pour les détails

## ⚠️ Problèmes Courants

### Le frontend ne démarre pas

```bash
# Nettoyez et réinstallez
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erreur 404 sur l'API

Vérifiez que le backend tourne sur le bon port (8089) et que `VITE_API_BASE_URL` est correct dans `.env.local`.

### Erreur CORS

Assurez-vous que le backend autorise `localhost:5173` dans sa configuration CORS.

## 📚 Documentation Complète

Consultez le [README.md](./README.md) pour la documentation complète.

## 🆘 Besoin d'Aide ?

- Documentation API : Voir l'attachement `api-v1.yml`
- Issues : Créez une issue sur le repository
- Email : support@madabest.com

---

**Bon développement ! 🚀**
