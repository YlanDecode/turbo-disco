import { AxiosError } from 'axios';
import { toast } from 'sonner';
import i18n from '@/i18n';

/**
 * Structure d'erreur API standardisée
 */
interface ApiErrorResponse {
  detail?: string;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Patterns d'erreurs backend courants et leurs clés de traduction
 */
const ERROR_PATTERNS: Record<string, string> = {
  // Authentification
  'invalid credentials': 'errors.invalidCredentials',
  'incorrect password': 'errors.incorrectPassword',
  'wrong password': 'errors.incorrectPassword',
  'user not found': 'errors.userNotFound',
  'username not found': 'errors.userNotFound',
  'user does not exist': 'errors.userNotFound',
  'account not found': 'errors.userNotFound',
  'invalid username': 'errors.invalidUsername',
  'invalid email': 'errors.invalidEmail',
  'email already exists': 'errors.emailAlreadyExists',
  'username already exists': 'errors.usernameAlreadyExists',
  'user already exists': 'errors.usernameAlreadyExists',
  'account already exists': 'errors.usernameAlreadyExists',
  'token expired': 'errors.sessionExpired',
  'token invalid': 'errors.sessionExpired',
  'session expired': 'errors.sessionExpired',
  'not authenticated': 'errors.notAuthenticated',
  'authentication required': 'errors.notAuthenticated',
  'login required': 'errors.notAuthenticated',
  'account disabled': 'errors.accountDisabled',
  'account inactive': 'errors.accountDisabled',
  'account pending': 'errors.accountPending',
  'pending approval': 'errors.accountPending',

  // Validation
  'field required': 'errors.fieldRequired',
  'required field': 'errors.fieldRequired',
  'missing field': 'errors.fieldRequired',
  'invalid format': 'errors.invalidFormat',
  'invalid value': 'errors.invalidValue',
  'too short': 'errors.tooShort',
  'too long': 'errors.tooLong',
  'password too weak': 'errors.passwordTooWeak',
  'password too short': 'errors.passwordTooShort',

  // API Key / Projet
  'invalid api key': 'errors.invalidApiKey',
  'api key invalid': 'errors.invalidApiKey',
  'api key expired': 'errors.apiKeyExpired',
  'api key revoked': 'errors.apiKeyRevoked',
  'project not found': 'errors.projectNotFound',
  'no active project': 'errors.noActiveProject',

  // Ressources
  'not found': 'errors.notFound',
  'resource not found': 'errors.notFound',
  'conversation not found': 'errors.conversationNotFound',
  'message not found': 'errors.messageNotFound',
  'document not found': 'errors.documentNotFound',
  'file not found': 'errors.fileNotFound',

  // Permissions
  'permission denied': 'errors.permissionDenied',
  'access denied': 'errors.forbidden',
  'forbidden': 'errors.forbidden',
  'not authorized': 'errors.notAuthorized',
  'insufficient permissions': 'errors.insufficientPermissions',

  // Limites
  'rate limit': 'errors.rateLimitExceeded',
  'too many requests': 'errors.rateLimitExceeded',
  'quota exceeded': 'errors.quotaExceeded',
  'file too large': 'errors.fileTooLarge',
  'payload too large': 'errors.fileTooLarge',

  // Serveur
  'internal server error': 'errors.serverError',
  'server error': 'errors.serverError',
  'service unavailable': 'errors.serviceUnavailable',
  'maintenance': 'errors.maintenance',
  'timeout': 'errors.timeout',
  'request timeout': 'errors.timeout',

  // Chat / IA
  'model error': 'errors.modelError',
  'generation failed': 'errors.generationFailed',
  'context too long': 'errors.contextTooLong',
  'streaming error': 'errors.streamingError',
};

/**
 * Messages d'erreur par code HTTP
 */
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'errors.badRequest',
  401: 'errors.unauthorized',
  403: 'errors.forbidden',
  404: 'errors.notFound',
  408: 'errors.timeout',
  409: 'errors.conflict',
  413: 'errors.fileTooLarge',
  422: 'errors.validationError',
  429: 'errors.rateLimitExceeded',
  500: 'errors.serverError',
  502: 'errors.serverError',
  503: 'errors.serviceUnavailable',
  504: 'errors.timeout',
};

/**
 * Trouve une clé de traduction correspondant au message d'erreur
 */
function findErrorPattern(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  for (const [pattern, translationKey] of Object.entries(ERROR_PATTERNS)) {
    if (lowerMessage.includes(pattern)) {
      return translationKey;
    }
  }

  return null;
}

/**
 * Extrait le message d'erreur d'une réponse API
 */
function extractApiErrorMessage(data: ApiErrorResponse | string | null | undefined): string | null {
  if (!data) return null;

  if (typeof data === 'string') {
    return data;
  }

  // Essayer différents formats de réponse d'erreur
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  if (data.error) return data.error;

  // Gestion des erreurs de validation multiples
  if (data.errors && typeof data.errors === 'object') {
    const firstField = Object.keys(data.errors)[0];
    if (firstField && data.errors[firstField]?.[0]) {
      return `${firstField}: ${data.errors[firstField][0]}`;
    }
  }

  return null;
}

/**
 * Obtient un message d'erreur traduit et lisible
 */
export function getErrorMessage(error: unknown): string {
  const t = i18n.t.bind(i18n);

  // Erreur Axios
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // Erreur réseau (pas de réponse)
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout')) {
        return t('errors.timeout');
      }
      return t('errors.network');
    }

    const { status, data } = axiosError.response;
    const apiMessage = extractApiErrorMessage(data);

    // Chercher un pattern correspondant dans le message
    if (apiMessage) {
      const patternKey = findErrorPattern(apiMessage);
      if (patternKey) {
        return t(patternKey);
      }
    }

    // Fallback sur le code HTTP
    const httpMessageKey = HTTP_STATUS_MESSAGES[status];
    if (httpMessageKey) {
      return t(httpMessageKey);
    }

    // Si on a un message API mais pas de pattern, l'utiliser tel quel
    if (apiMessage) {
      return apiMessage;
    }

    return t('errors.generic');
  }

  // Erreur JavaScript standard
  if (error instanceof Error) {
    const patternKey = findErrorPattern(error.message);
    if (patternKey) {
      return t(patternKey);
    }
    return error.message || t('errors.generic');
  }

  // Chaîne de caractères
  if (typeof error === 'string') {
    const patternKey = findErrorPattern(error);
    if (patternKey) {
      return t(patternKey);
    }
    return error;
  }

  return t('errors.generic');
}

/**
 * Affiche un toast d'erreur avec le message approprié
 */
export function showErrorToast(error: unknown, customMessage?: string): void {
  const message = customMessage || getErrorMessage(error);
  toast.error(message);
}

/**
 * Affiche un toast de succès
 */
export function showSuccessToast(message: string): void {
  toast.success(message);
}

/**
 * Gestionnaire d'erreur pour les mutations React Query
 */
export function handleMutationError(error: unknown): void {
  showErrorToast(error);
}

/**
 * Crée un gestionnaire d'erreur contextualisé pour une opération spécifique
 */
export function createErrorHandler(context: string) {
  return (error: unknown): void => {
    console.error(`[${context}]`, error);
    showErrorToast(error);
  };
}

/**
 * Vérifie si l'erreur est une erreur d'authentification
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 401;
  }
  return false;
}

/**
 * Vérifie si l'erreur est une erreur de permission
 */
export function isPermissionError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 403;
  }
  return false;
}

/**
 * Vérifie si l'erreur est une erreur de validation
 */
export function isValidationError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 422 || axiosError.response?.status === 400;
  }
  return false;
}

/**
 * Vérifie si l'erreur est une erreur réseau
 */
export function isNetworkError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    return !axiosError.response;
  }
  return false;
}
