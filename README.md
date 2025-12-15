# MADABEST LLM RAG Interface

Interface frontend moderne en React + TypeScript pour l'API MADABEST LLM AI avec capacités RAG (Retrieval-Augmented Generation).

## 🚀 Fonctionnalités

- ✅ **Chat conversationnel avec streaming SSE** - Réponses en temps réel
- ✅ **Gestion de projets** - CRUD complet avec rotation de clés API
- ✅ **Upload de documents RAG** - PDF, TXT, MD avec drag & drop
- ✅ **Interface responsive** - Design moderne avec TailwindCSS
- ✅ **Authentification sécurisée** - Clés API chiffrées en localStorage
- ✅ **Gestion de contextes** - Visualisation des documents utilisés
- ✅ **Mode sombre** - Support du thème clair/sombre

## 📋 Prérequis

- Node.js 18+ et npm
- Backend MADABEST LLM AI démarré sur `http://localhost:8089`

## 🛠️ Installation

```bash
# Installer les dépendances
npm install
```

## ⚙️ Configuration

Le fichier `.env.local` est déjà configuré avec :

```env
VITE_API_BASE_URL=http://localhost:8089/api/v1
VITE_APP_NAME=MADABEST Assistant
VITE_APP_DESCRIPTION=AI Assistant with RAG capabilities
VITE_ENABLE_STREAMING=true
VITE_ENABLE_WEB_SEARCH=true
```

## 🚀 Démarrage

```bash
# Mode développement
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview
```

Le frontend sera accessible sur `http://localhost:5173`

## 📂 Structure du Projet

```
src/
├── api/                    # Configuration API
│   ├── client.ts          # Client Axios + intercepteurs
│   ├── types.ts           # Types depuis OpenAPI
│   ├── endpoints/         # Endpoints par fonctionnalité
│   └── hooks/             # Hooks React Query
├── components/
│   ├── ui/               # Composants UI (shadcn)
│   ├── chat/             # Composants de chat
│   ├── projects/         # Gestion projets
│   └── layout/           # Layout & navigation
├── pages/               # Pages principales
├── contexts/           # Contextes React
└── lib/               # Utilitaires
```

## 🔑 Guide d'Utilisation

### 1. Créer un Projet

1. Cliquez sur **"Créer mon premier projet"**
2. Remplissez le formulaire de configuration
3. **⚠️ Important** : La clé API s'affiche une seule fois → Copiez-la !
4. Le projet est automatiquement activé

### 2. Chat avec Streaming

1. Accédez à `/chat`
2. Tapez votre question
3. `Ctrl+Enter` pour envoyer
4. Les réponses arrivent en streaming
5. Cliquez "Afficher les contextes" pour voir les sources RAG

### 3. Upload de Documents

1. Accédez à `/rag`
2. Glissez-déposez un fichier (PDF, TXT, MD)
3. Max 10 MB par fichier
4. L'ingestion se fait en arrière-plan

### 4. Gérer les Projets

1. Accédez à `/projects`
2. Sélectionnez un projet pour l'activer
3. Éditez la configuration de l'assistant
4. Rotation de clé API si nécessaire

## 🔐 Sécurité

- **Clés API chiffrées** : `crypto-js` pour chiffrer en localStorage
- **Intercepteurs Axios** : Injection automatique de `X-API-Key`
- **Gestion d'erreurs** : Redirection auto en cas de 401

⚠️ **En production** :
- Changez `ENCRYPTION_KEY` dans `src/api/client.ts`
- Ne commitez JAMAIS les clés API
- Utilisez HTTPS

## 📡 Endpoints API

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/projects` | POST | Créer un projet |
| `/projects` | GET | Lister les projets |
| `/chat/stream` | POST | Chat streaming SSE |
| `/conversations` | GET | Conversations |
| `/{projectId}/rag/ingest_file` | POST | Upload fichier |

Voir spec complète : attachement `api-v1.yml`

## 🧪 Développement

```bash
# Générer types depuis OpenAPI
npm run generate-types

# Linter
npm run lint
```

## 🐛 Dépannage

**Backend ne répond pas :**
```bash
curl http://localhost:8089/api/v1/ping
# Devrait retourner: {"message":"pong"}
```

**Erreur CORS :** Vérifiez que le backend autorise `localhost:5173`

**Clé API invalide :** Créez un nouveau projet

## 📦 Build de Production

```bash
npm run build
# Fichiers dans dist/

# Déployer avec serve
npm install -g serve
serve -s dist -p 3000
```

## 📄 Licence

© 2025 MADABEST. Tous droits réservés.

---

**Fait avec ❤️ pour MADABEST**
