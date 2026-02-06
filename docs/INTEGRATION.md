# Guide d'Integration - API Chatbot

Ce guide explique comment integrer le chatbot dans une application tierce (site web, application mobile, boite de dialogue, etc.).

---

## Table des matieres

1. [Authentification (Cle API)](#1-authentification-cle-api)
2. [Gestion des conversations](#2-gestion-des-conversations)
3. [Envoi de messages (Streaming)](#3-envoi-de-messages-streaming)
4. [Formatage et affichage des reponses](#4-formatage-et-affichage-des-reponses)
5. [Exemple complet : boite de dialogue](#5-exemple-complet--boite-de-dialogue)

---

## 1. Authentification (Cle API)

### Principe

Chaque projet possede une **cle API** unique. Cette cle identifie le projet et donne acces aux endpoints de chat et de conversations. Elle doit etre transmise dans le header `X-API-Key` de chaque requete.

### Base URL

```
https://chatbot-api.lantorian.com/api/v1
```

### Header d'authentification

```
X-API-Key: votre-cle-api-ici
Content-Type: application/json
```

### Ou trouver la cle API ?

La cle API est fournie a la creation du projet. Elle est visible une seule fois. Si vous l'avez perdue, vous pouvez :

- **Reveler la cle** : `POST /projects/{projectId}/reveal-key`
- **Regenerer une nouvelle cle** : `POST /projects/{projectId}/regenerate-key` (l'ancienne est immediatement invalidee)
- **Faire une rotation** : `POST /projects/{projectId}/rotate-key` (periode de grace de 24h ou l'ancienne cle reste active)

### Verifier que la cle fonctionne

```bash
curl -X GET "https://chatbot-api.lantorian.com/api/v1/conversations" \
  -H "X-API-Key: votre-cle-api-ici"
```

Si la cle est valide, vous recevrez la liste des conversations (possiblement vide). Sinon, une erreur `401`.

---

## 2. Gestion des conversations

### Creer une conversation

```
POST /conversations
```

**Body (optionnel)** :
```json
{
  "session_id": "identifiant-session-optionnel"
}
```

**Reponse** :
```json
{
  "id": "conv_abc123",
  "project_id": "proj_xyz",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z",
  "message_count": 0
}
```

> **Note** : La creation de conversation est **optionnelle**. Si vous envoyez un message sans `conversation_id`, le serveur cree automatiquement une conversation et retourne son ID dans la reponse.

### Lister les conversations

```
GET /conversations?page=1&limit=20
```

**Reponse** :
```json
{
  "conversations": [
    {
      "id": "conv_abc123",
      "project_id": "proj_xyz",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:35:00Z",
      "message_count": 4
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

### Recuperer une conversation et ses messages

```
GET /conversations/{conversationId}?limit=50
```

**Reponse** :
```json
{
  "id": "conv_abc123",
  "project_id": "proj_xyz",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:35:00Z",
  "messages": [
    {
      "id": "msg_001",
      "conversation_id": "conv_abc123",
      "role": "user",
      "content": "Bonjour, comment ca marche ?",
      "created_at": "2025-01-15T10:30:05Z"
    },
    {
      "id": "msg_002",
      "conversation_id": "conv_abc123",
      "role": "assistant",
      "content": "Bonjour ! Je suis votre assistant...",
      "created_at": "2025-01-15T10:30:08Z"
    }
  ]
}
```

### Supprimer une conversation

```
DELETE /conversations/{conversationId}
```

Retourne `204 No Content` en cas de succes. Tous les messages associes sont supprimees.

---

## 3. Envoi de messages (Streaming)

### Methode 1 : Reponse complete (sans streaming)

```
POST /chat
```

**Body** :
```json
{
  "message": "Bonjour, quels sont vos services ?",
  "conversation_id": "conv_abc123",
  "k": 3,
  "use_web_search": false,
  "max_tokens": 600
}
```

| Champ              | Type     | Requis | Description                                     |
|--------------------|----------|--------|-------------------------------------------------|
| `message`          | string   | oui    | Le message de l'utilisateur                     |
| `conversation_id`  | string   | non    | ID de conversation existante (sinon en cree une)|
| `k`                | number   | non    | Nombre de documents RAG a utiliser comme contexte|
| `use_web_search`   | boolean  | non    | Activer la recherche web                        |
| `max_tokens`       | number   | non    | Nombre max de tokens en sortie (defaut: 600)    |

**Reponse** :
```json
{
  "response": "Bonjour ! Voici nos services...",
  "conversation_id": "conv_abc123",
  "message_id": "msg_003",
  "contexts": ["Document 1 pertinent...", "Document 2 pertinent..."],
  "metadata": {}
}
```

### Methode 2 : Streaming (SSE) - Recommandee

Le streaming permet d'afficher la reponse **mot par mot** en temps reel, comme ChatGPT.

```
POST /chat/stream
```

Le body est identique a `POST /chat`. La reponse est un flux **Server-Sent Events (SSE)**.

#### Format des evenements SSE

Le serveur envoie 3 types d'evenements :

**1. Tokens (texte de la reponse, arrive mot par mot)** :
```
event: token
data: Bonjour

event: token
data:  ! Je

event: token
data:  suis votre
```

**2. Metadonnees (conversation_id et sources RAG)** :
```
event: meta
data: {"conversation_id": "conv_abc123", "contexts": ["Source 1...", "Source 2..."]}
```

**3. Fin du stream** :
```
event: done
data: [DONE]
```

**4. Erreur (si probleme)** :
```
event: error
data: Description de l'erreur
```

#### Implementation JavaScript (Vanilla)

```javascript
async function sendMessageStream(message, conversationId, apiKey, onToken, onComplete, onError) {
  const controller = new AbortController();

  try {
    const response = await fetch('https://chatbot-api.lantorian.com/api/v1/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        message: message,
        conversation_id: conversationId || null,
        max_tokens: 600,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erreur serveur');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = '';
    let fullResponse = '';
    let receivedConversationId = conversationId;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        // Detecter le type d'evenement
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim();

          if (currentEvent === 'done') {
            onComplete(fullResponse, receivedConversationId);
            return;
          }
          continue;
        }

        // Traiter les donnees
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            onComplete(fullResponse, receivedConversationId);
            return;
          }

          if (currentEvent === 'error') {
            onError(new Error(data));
            return;
          }

          // Essayer de parser comme JSON (metadonnees)
          try {
            const parsed = JSON.parse(data);
            if (parsed.conversation_id) {
              receivedConversationId = parsed.conversation_id;
            }
            // Ignorer les metadonnees de fin (response_time_ms)
          } catch {
            // C'est un token texte
            fullResponse += data;
            onToken(data, fullResponse);
          }

          currentEvent = '';
        }
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      onComplete(fullResponse, receivedConversationId);
    } else {
      onError(error);
    }
  }

  // Retourner le controller pour permettre l'annulation
  return controller;
}
```

#### Annuler un stream en cours

```javascript
const controller = await sendMessageStream(...);

// Pour annuler :
controller.abort();
```

---

## 4. Formatage et affichage des reponses

### Les reponses sont en Markdown

Le chatbot retourne ses reponses en **Markdown**. Cela inclut :

- **Gras** (`**texte**`), *italique* (`*texte*`)
- Listes a puces et numerotees
- Blocs de code (`` `code` `` et ``` ```bloc``` ```)
- Liens (`[texte](url)`)
- Tableaux

### Librairies recommandees pour le rendu Markdown

| Langage/Framework | Librairie                      |
|-------------------|--------------------------------|
| React             | `react-markdown` + `remark-gfm` + `rehype-raw` |
| Vue.js            | `markdown-it` ou `vue-markdown`|
| Vanilla JS        | `marked` ou `markdown-it`      |
| iOS (Swift)       | `MarkdownUI` ou `Down`         |
| Android (Kotlin)  | `Markwon`                      |
| Flutter           | `flutter_markdown`             |

### Correction de ponctuation

Appliquer cette fonction sur le texte recu pour ameliorer l'espacement apres la ponctuation :

```javascript
function formatMarkdownText(text) {
  if (!text) return text;
  return text
    .replace(/!([A-Za-z0-9])/g, '! $1')
    .replace(/\?([A-Za-z0-9])/g, '? $1')
    .replace(/\.([A-Z0-9])/g, '. $1')
    .replace(/,([A-Za-z0-9])/g, ', $1')
    .replace(/\s{2,}/g, ' ');
}
```

### Affichage progressif (effet machine a ecrire)

Avec le streaming, les tokens arrivent un par un. L'affichage se fait naturellement de facon progressive. Il suffit de concatener les tokens au fur et a mesure et de mettre a jour le DOM :

```javascript
let messageElement = document.getElementById('bot-response');

function onToken(token, fullText) {
  // Le rendu Markdown doit etre applique sur le texte COMPLET
  // (pas sur chaque token individuellement)
  messageElement.innerHTML = renderMarkdown(formatMarkdownText(fullText));

  // Auto-scroll vers le bas
  messageElement.scrollTop = messageElement.scrollHeight;
}
```

---

## 5. Exemple complet : boite de dialogue

Voici un exemple complet d'integration dans une boite de dialogue HTML/CSS/JS minimale.

### HTML

```html
<div id="chatbot-widget" style="display:none;">
  <!-- Header -->
  <div id="chat-header">
    <span>Assistant</span>
    <button id="chat-close">&times;</button>
  </div>

  <!-- Messages -->
  <div id="chat-messages"></div>

  <!-- Input -->
  <div id="chat-input-area">
    <input type="text" id="chat-input" placeholder="Ecrivez votre message..." />
    <button id="chat-send">Envoyer</button>
  </div>
</div>

<!-- Bouton flottant pour ouvrir le chat -->
<button id="chat-toggle">💬</button>
```

### CSS

```css
#chatbot-widget {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 360px;
  height: 500px;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #fff;
  z-index: 9999;
}

#chat-header {
  background: #2563eb;
  color: white;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

#chat-header button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

#chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-msg {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.chat-msg.user {
  align-self: flex-end;
  background: #2563eb;
  color: white;
  border-bottom-right-radius: 4px;
}

.chat-msg.assistant {
  align-self: flex-start;
  background: #f1f5f9;
  color: #1e293b;
  border-bottom-left-radius: 4px;
}

.chat-msg.assistant.streaming {
  opacity: 0.9;
}

#chat-input-area {
  display: flex;
  padding: 12px;
  border-top: 1px solid #e2e8f0;
  gap: 8px;
}

#chat-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
}

#chat-input:focus {
  border-color: #2563eb;
}

#chat-send {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
}

#chat-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

#chat-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  z-index: 9999;
}

/* Styles Markdown dans les reponses */
.chat-msg.assistant p { margin: 0 0 8px 0; }
.chat-msg.assistant p:last-child { margin-bottom: 0; }
.chat-msg.assistant ul, .chat-msg.assistant ol { margin: 4px 0; padding-left: 20px; }
.chat-msg.assistant code {
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}
.chat-msg.assistant pre {
  background: #1e293b;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
}
.chat-msg.assistant pre code {
  background: none;
  padding: 0;
  color: inherit;
}
.chat-msg.assistant strong { font-weight: 600; }
```

### JavaScript

```html
<!-- Inclure une librairie Markdown (ex: marked) -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

<script>
(function () {
  // ============================================================
  // CONFIGURATION - A adapter a votre projet
  // ============================================================
  const API_BASE_URL = 'https://chatbot-api.lantorian.com/api/v1';
  const API_KEY = 'votre-cle-api-ici';

  // ============================================================
  // ETAT
  // ============================================================
  let conversationId = null;
  let isStreaming = false;
  let abortController = null;

  // ============================================================
  // ELEMENTS DOM
  // ============================================================
  const widget    = document.getElementById('chatbot-widget');
  const messages  = document.getElementById('chat-messages');
  const input     = document.getElementById('chat-input');
  const sendBtn   = document.getElementById('chat-send');
  const closeBtn  = document.getElementById('chat-close');
  const toggleBtn = document.getElementById('chat-toggle');

  // ============================================================
  // OUVRIR / FERMER
  // ============================================================
  toggleBtn.addEventListener('click', () => {
    const isOpen = widget.style.display !== 'none';
    widget.style.display = isOpen ? 'none' : 'flex';
    toggleBtn.textContent = isOpen ? '💬' : '✕';
  });

  closeBtn.addEventListener('click', () => {
    widget.style.display = 'none';
    toggleBtn.textContent = '💬';
  });

  // ============================================================
  // FORMATAGE MARKDOWN
  // ============================================================
  function formatMarkdownText(text) {
    if (!text) return text;
    return text
      .replace(/!([A-Za-z0-9])/g, '! $1')
      .replace(/\?([A-Za-z0-9])/g, '? $1')
      .replace(/\.([A-Z0-9])/g, '. $1')
      .replace(/,([A-Za-z0-9])/g, ', $1')
      .replace(/\s{2,}/g, ' ');
  }

  function renderMarkdown(text) {
    return marked.parse(formatMarkdownText(text));
  }

  // ============================================================
  // AJOUTER UN MESSAGE AU CHAT
  // ============================================================
  function addMessage(role, content) {
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;

    if (role === 'assistant') {
      div.innerHTML = renderMarkdown(content);
    } else {
      div.textContent = content;
    }

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  // ============================================================
  // ENVOYER UN MESSAGE (STREAMING)
  // ============================================================
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isStreaming) return;

    // Afficher le message utilisateur
    addMessage('user', text);
    input.value = '';

    // Preparer la bulle de reponse (vide au depart)
    const botBubble = addMessage('assistant', '');
    botBubble.classList.add('streaming');
    botBubble.innerHTML = '<em>...</em>';

    // Desactiver l'input
    isStreaming = true;
    sendBtn.disabled = true;
    input.disabled = true;
    abortController = new AbortController();

    let fullResponse = '';

    try {
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || `Erreur ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
            if (currentEvent === 'done') {
              botBubble.classList.remove('streaming');
              break;
            }
            continue;
          }

          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              botBubble.classList.remove('streaming');
              break;
            }

            if (currentEvent === 'error') {
              throw new Error(data);
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.conversation_id) {
                conversationId = parsed.conversation_id;
              }
              // Ignorer les autres metadonnees
            } catch {
              // C'est un token texte : l'ajouter a la reponse
              fullResponse += data;
              botBubble.innerHTML = renderMarkdown(fullResponse);
              messages.scrollTop = messages.scrollHeight;
            }

            currentEvent = '';
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        botBubble.innerHTML = `<em>Erreur : ${error.message}</em>`;
        botBubble.style.color = '#dc2626';
      }
    } finally {
      isStreaming = false;
      sendBtn.disabled = false;
      input.disabled = false;
      input.focus();
      botBubble.classList.remove('streaming');
    }
  }

  // ============================================================
  // SUPPRIMER LA CONVERSATION (NOUVEAU CHAT)
  // ============================================================
  async function deleteConversation() {
    if (!conversationId) return;

    try {
      await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': API_KEY },
      });
    } catch (e) {
      console.warn('Erreur suppression conversation:', e);
    }

    conversationId = null;
    messages.innerHTML = '';
  }

  // ============================================================
  // EVENEMENTS
  // ============================================================
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
})();
</script>
```

---

## Resume des endpoints utilises

| Action                  | Methode  | Endpoint                          | Auth Header   |
|-------------------------|----------|-----------------------------------|---------------|
| Envoyer un message      | `POST`   | `/chat`                           | `X-API-Key`   |
| Envoyer en streaming    | `POST`   | `/chat/stream`                    | `X-API-Key`   |
| Creer une conversation  | `POST`   | `/conversations`                  | `X-API-Key`   |
| Lister les conversations| `GET`    | `/conversations`                  | `X-API-Key`   |
| Voir une conversation   | `GET`    | `/conversations/{id}`             | `X-API-Key`   |
| Supprimer conversation  | `DELETE` | `/conversations/{id}`             | `X-API-Key`   |
| Verifier la connexion   | `GET`    | `/ping`                           | Aucun         |

---

## Gestion des erreurs

| Code HTTP | Signification                           | Action recommandee                          |
|-----------|-----------------------------------------|---------------------------------------------|
| `401`     | Cle API invalide ou manquante           | Verifier la cle, la regenerer si necessaire |
| `403`     | Acces refuse (projet inactif, etc.)     | Contacter l'administrateur                  |
| `404`     | Conversation introuvable                | Creer une nouvelle conversation             |
| `429`     | Trop de requetes (rate limiting)        | Attendre puis reessayer                     |
| `500`     | Erreur serveur                          | Reessayer apres quelques secondes           |

---

## Bonnes pratiques

1. **Stocker le `conversation_id`** : Apres le premier message, stocker l'ID de conversation recu pour maintenir le contexte. Si l'utilisateur ferme la boite et la rouvre, reprendre la meme conversation.

2. **Preferer le streaming** : L'endpoint `/chat/stream` offre une meilleure UX car l'utilisateur voit la reponse se construire en temps reel.

3. **Ne pas exposer la cle API cote client** : Dans un site web public, passer par un proxy backend qui ajoute le header `X-API-Key`. Ne jamais mettre la cle en dur dans du JavaScript accessible au navigateur.

4. **Gerer l'annulation** : Utiliser un `AbortController` pour permettre a l'utilisateur d'annuler une reponse en cours.

5. **Limiter les tokens** : Utiliser `max_tokens` pour controler la longueur des reponses et eviter des couts excessifs.

6. **Nettoyer les conversations** : Supprimer les conversations terminees si elles ne sont plus necessaires.
