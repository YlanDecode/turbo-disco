// Types manuels basés sur l'OpenAPI spec
// En production, exécuter: npm run generate-types

export interface CreateProjectRequest {
  name: string;
  slug?: string | null;
  description?: string | null;
  assistant_name?: string;
  company_name?: string;
  assistant_role?: string;
  assistant_tone?: string;
  max_context_messages?: number;
  contact_email?: string;
  contact_phone?: string;
  contact_website?: string;
}

export interface UpdateProjectRequest {
  name?: string | null;
  description?: string | null;
  assistant_name?: string | null;
  company_name?: string | null;
  assistant_role?: string | null;
  assistant_tone?: string | null;
  max_context_messages?: number | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_website?: string | null;
}

export interface ProjectResponse {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  api_key?: string | null;
  api_key_masked: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  config: Record<string, unknown>;
  owner_id?: string;
  owner_username?: string;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_more?: boolean;
}

export interface ProjectListResponse {
  projects: ProjectResponse[];
  pagination: PaginationMetadata;
}

export interface RotateKeyResponse {
  project_id: string;
  new_api_key: string;
  warning: string;
  rotated_at: string;
}

// Reveal API Key response
export interface RevealKeyResponse {
  project_id: string;
  api_key: string;
  warning: string;
}

// Revoke API Key response
export interface RevokeKeyResponse {
  project_id: string;
  message: string;
  revoked_at: string;
}

// Regenerate API Key response
export interface RegenerateKeyResponse {
  project_id: string;
  new_api_key: string;
  message: string;
  regenerated_at: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string | null;
  k?: number;
  use_web_search?: boolean;
  max_tokens?: number | null;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  message_id: string;
  contexts?: string[];
  metadata?: Record<string, unknown>;
}

export interface IngestBody {
  texts: string[];
  metadata?: Array<Record<string, unknown>> | null;
}

export interface RebuildBody {
  reset_faiss?: boolean;
}

export interface IngestDirBody {
  dir_path?: string;
  glob_pattern?: string;
  recursive?: boolean;
  limit?: number | null;
}

export interface RAGDebugResponse {
  has_retriever: boolean;
  doc_count: number;
  use_langchain: boolean;
  tfidf_index_files: {
    vectorizer_exists: boolean;
    matrix_exists: boolean;
  };
  faiss_dir_exists: boolean;
  id: number;
}

export interface ConversationResponse {
  id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  // Informations sur l'utilisateur (si disponibles)
  user_id?: string;
  username?: string;
}

export interface MessageResponse {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface ConversationDetailResponse {
  id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  messages: MessageResponse[];
}

export interface ConversationListResponse {
  conversations: ConversationResponse[];
  pagination: PaginationMetadata;
}

export interface CreateConversationBody {
  session_id?: string | null;
}

export interface Error {
  detail: string;
}

export interface FileInfo {
  filename: string;
  size_bytes: number | null;
}

export interface FileListResponse {
  files: FileInfo[];
}

// ==================== Authentication ====================

export interface UserCreate {
  username: string;
  password: string;
}

export interface UserRead {
  id: string;
  username: string;
  role?: UserRole;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  access_token?: string;
  refresh_token?: string;
}

export interface LogoutResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

// ==================== Users / Profile ====================

export type UserRole = 'user' | 'super_admin';

export interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  display_name?: string;
  avatar_url?: string;
  role: UserRole;
  is_active?: boolean;
  is_approved: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
}

export interface UpdateProfileRequest {
  email?: string;
  display_name?: string;
  avatar_url?: string;
  password?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface DeleteAccountRequest {
  password: string;
  confirmation: string; // Must be "DELETE MY ACCOUNT"
}

export type ConsentType = 'terms' | 'privacy' | 'marketing' | 'analytics';

export interface Consent {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  granted: boolean;
  created_at: string;
}

export interface CreateConsentRequest {
  consent_type: ConsentType;
  granted: boolean;
}

export interface UserDataExport {
  user: UserProfile;
  projects: ProjectResponse[];
  conversations: ConversationResponse[];
  consents: Consent[];
  exported_at: string;
}

// ==================== Admin ====================

export interface PendingUser {
  id: string;
  username: string;
  email: string;
  display_name?: string;
  created_at: string;
  requested_at?: string;
}

export interface AdminUserListParams {
  role?: UserRole;
  is_approved?: boolean;
  limit?: number;
  offset?: number;
}

export interface ApproveUserRequest {
  approved: boolean;
  send_email?: boolean;
}

export interface RejectUserRequest {
  reason?: string;
  send_email?: boolean;
}

export interface UpdateRoleRequest {
  role: UserRole;
}

// Admin - Create user
export interface AdminCreateUserRequest {
  email: string;
  password: string;
  display_name?: string;
  avatar_url?: string;
  role?: UserRole;
  is_active?: boolean;
}

// Admin - Update user
export interface AdminUpdateUserRequest {
  email?: string;
  display_name?: string;
  avatar_url?: string;
  is_active?: boolean;
}

// Admin - Change user password
export interface AdminChangePasswordRequest {
  new_password: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  timestamp?: string;
  created_at: string;
}

export interface AuditLogListParams {
  user_id?: string;
  action?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogListResponse {
  logs: AuditLog[];
  pagination: PaginationMetadata;
}

// ==================== API Keys ====================

export interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  usage_count: number;
  created_at: string;
}

export interface APIKeyWithSecret extends APIKey {
  key: string; // Full key, only returned on creation
}

export interface CreateAPIKeyRequest {
  name: string;
  scopes: ('chat' | 'rag' | 'conversations' | 'analytics')[];
  expires_in_days?: number;
}

export interface UpdateAPIKeyRequest {
  name?: string;
  scopes?: string[];
  is_active?: boolean;
}

export interface RotatedAPIKeyResponse {
  id: string;
  key: string;
  rotated_at: string;
}

export interface APIKeyUsage {
  total_requests: number;
  requests_today: number;
  requests_this_week: number;
  daily_usage: Array<{
    date: string;
    count: number;
  }>;
}

// ==================== Webhooks ====================

export type WebhookEventType =
  | 'message.created'
  | 'message.feedback'
  | 'conversation.started'
  | 'conversation.ended'
  | 'rag.context_updated'
  | 'rag.rebuild_completed'
  | 'api_key.created'
  | 'api_key.rotated'
  | 'rate_limit.exceeded'
  | 'error.occurred';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEventType[];
  is_active: boolean;
  secret?: string;
  headers?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface CreateWebhookRequest {
  name: string;
  url: string;
  events: WebhookEventType[];
  secret?: string;
  headers?: Record<string, string>;
}

export interface UpdateWebhookRequest {
  name?: string;
  url?: string;
  events?: WebhookEventType[];
  is_active?: boolean;
  secret?: string;
  headers?: Record<string, string>;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: WebhookEventType;
  status: 'success' | 'failed';
  response_status_code: number | null;
  response_time_ms: number | null;
  error_message: string | null;
  created_at: string;
}

export interface WebhookDeliveryListResponse {
  deliveries: WebhookDelivery[];
  pagination: PaginationMetadata;
}

export interface TestWebhookRequest {
  event_type: WebhookEventType;
  payload?: Record<string, unknown>;
}

// ==================== Widget Configuration ====================

export interface WidgetColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  user_message_bg: string;
  bot_message_bg: string;
}

export interface WidgetPosition {
  bottom: number;
  right: number;
}

export interface WidgetConfig {
  id: string;
  project_id: string;
  title: string;
  subtitle?: string;
  avatar_url?: string;
  colors: WidgetColors;
  position: WidgetPosition;
  width: number;
  height: number;
  border_radius: number;
  welcome_message: string;
  placeholder_text: string;
  fallback_message: string;
  error_message: string;
  timeout_message: string;
  auto_open: boolean;
  auto_open_delay_ms: number;
  show_typing_indicator: boolean;
  typing_delay_ms: number;
  persist_conversation: boolean;
  powered_by_text: string;
  powered_by_url: string;
  show_powered_by: boolean;
  custom_css?: string;
}

export interface UpdateWidgetRequest {
  title?: string;
  subtitle?: string;
  colors?: Partial<WidgetColors>;
  position?: Partial<WidgetPosition>;
  width?: number;
  height?: number;
  border_radius?: number;
  welcome_message?: string;
  placeholder_text?: string;
  fallback_message?: string;
  error_message?: string;
  timeout_message?: string;
  auto_open?: boolean;
  auto_open_delay_ms?: number;
  show_typing_indicator?: boolean;
  typing_delay_ms?: number;
  persist_conversation?: boolean;
  powered_by_text?: string;
  powered_by_url?: string;
  show_powered_by?: boolean;
  custom_css?: string;
}

export interface WidgetAvatarResponse {
  avatar_url: string;
  uploaded_at: string;
}

export interface WidgetPreview {
  config: WidgetConfig;
  css_variables: Record<string, string>;
  styles: Record<string, string>;
}

export interface IntegrationCode {
  script_tag: string;
  iframe: string;
  npm: {
    react: string;
    vue: string;
    vanilla: string;
  };
  api: {
    curl: string;
    python: string;
    javascript: string;
    php: string;
  };
}

// ==================== Analytics ====================

export interface AnalyticsOverview {
  total_conversations: number;
  total_messages: number;
  unique_users: number;
  avg_response_time_ms: number;
  avg_messages_per_conversation: number;
  satisfaction_rate: number;
  rag_usage_rate: number;
}

export interface AnalyticsTrend {
  date: string;
  conversations: number;
  messages: number;
  avg_response_time_ms: number;
}

export interface AnalyticsTrendParams {
  days?: number;
  granularity?: 'hour' | 'day' | 'week';
}

export interface TopQuestion {
  question: string;
  count: number;
  avg_satisfaction: number;
}

export interface FailedQuery {
  query: string;
  reason: string;
  count: number;
  last_occurrence: string;
}

export interface SatisfactionStats {
  total_feedback: number;
  positive: number;
  negative: number;
  satisfaction_rate: number;
  by_rating: {
    helpful: number;
    not_helpful: number;
    partially_helpful: number;
  };
}

export interface CostEstimate {
  period: {
    start: string;
    end: string;
  };
  tokens: {
    total: number;
    input: number;
    output: number;
  };
  cost: {
    total: number;
    currency: string;
  };
}

export interface CostEstimateParams {
  start_date: string;
  end_date: string;
  cost_per_1k_tokens?: number;
}

// ==================== Chat (updated) ====================

export interface ChatSource {
  content: string;
  score: number;
}

export interface ChatResponseUpdated {
  response: string;
  conversation_id: string;
  message_id: string;
  sources?: ChatSource[];
}

// ==================== RAG (updated) ====================

export interface RAGFile {
  id: string;
  filename: string;
  size_bytes: number;
  content_type: string;
  created_at: string;
}

export interface RAGFileListResponse {
  files: RAGFile[];
}

// ==================== Health ====================

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  database: 'ok' | 'error';
  redis: 'ok' | 'error';
  ollama: 'ok' | 'error';
}

// ==================== Analytics Dashboard ====================

export interface AnalyticsDashboard {
  // Full dashboard structure (when available)
  overview?: {
    total_conversations: number;
    total_messages: number;
    unique_users: number;
    avg_response_time_ms: number;
  };
  satisfaction?: {
    rate: number;
    total_feedback: number;
    trend: 'up' | 'down' | 'stable';
  };
  top_questions?: Array<{
    question: string;
    count: number;
    last_asked: string;
  }>;
  recent_trends?: Array<{
    date: string;
    conversations: number;
    messages: number;
  }>;
  // Alternative structure returned by some endpoints
  trends?: Array<{
    date: string;
    conversations: number;
    messages: number;
    avg_response_time_ms?: number;
    tokens_used?: number | null;
    satisfaction_rate?: number | null;
  }>;
  granularity?: string | null;
  period?: string;
  project_id?: string;
}

// ==================== WebSocket Notifications ====================

export type NotificationType =
  | 'user_signup'
  | 'user_approved'
  | 'user_rejected'
  | 'project_created'
  | 'file_uploaded'
  | 'conversation_started'
  | 'system_alert';

export interface WebSocketNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  created_at: string;
  read: boolean;
}

export interface WebSocketMessage {
  type: 'notification' | 'unread_count' | 'pong';
  payload: unknown;
}

// ==================== Activities ====================

export type ActivityType =
  | 'user_signup'
  | 'user_approved'
  | 'user_rejected'
  | 'user_login'
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  | 'file_uploaded'
  | 'file_deleted'
  | 'conversation_started'
  | 'conversation_ended'
  | 'webhook_created'
  | 'webhook_triggered'
  | 'api_key_created'
  | 'api_key_rotated'
  | 'system_alert'
  | 'rag_indexed'
  | 'rag_failed';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  user_id?: string;
  project_id?: string;
  created_at: string;
  read: boolean;
  read_at?: string | null;
}

export interface ActivityListParams {
  type?: ActivityType;
  read?: boolean;
  limit?: number;
  offset?: number;
}

export interface ActivityListResponse {
  activities: Activity[];
  pagination: PaginationMetadata;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkReadRequest {
  read: boolean;
}

// ==================== WebSocket Status ====================

export interface WebSocketStatus {
  status: 'online' | 'offline';
  connections: number;
  uptime_seconds: number;
}
