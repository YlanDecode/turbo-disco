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
  api_key?: string | null; // Seulement lors de la création
  api_key_masked: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  config: Record<string, unknown>;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
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
