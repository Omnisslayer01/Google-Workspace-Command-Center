export interface GmailMessageStub {
  id: string;
  threadId?: string;
}

export interface GmailMessageListResponse {
  messages: GmailMessageStub[];
  next_page_token: string | null;
  result_size_estimate: number | null;
}

export interface GmailListParams {
  max_results?: number;
  page_token?: string;
}

export interface GmailSearchParams {
  q: string;
  max_results?: number;
  page_token?: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  historyId?: string;
  internalDate?: string;
  payload?: GmailMessagePart;
  sizeEstimate?: number;
  raw?: string;
}

export interface GmailMessagePart {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: Array<{
    name: string;
    value: string;
  }>;
  body?: {
    attachmentId?: string;
    size: number;
    data?: string;
  };
  parts?: GmailMessagePart[];
}

export interface GmailComposeRequest {
  to: string;
  subject: string;
  body: string;
}

export interface GmailSendResponse {
  message_id: string;
  thread_id: string | null;
}

export interface GmailDraftResponse {
  draft_id: string;
  message_id: string | null;
}