// ─── Gmail API types ────────────────────────────────────────────────────────
// These match the response envelopes produced by backend/gmail_integration/views.py

/** A minimal Gmail message stub returned in list / search results. */
export interface GmailMessageStub {
  id: string;
  threadId?: string;
}

/** Response envelope for GET /api/gmail/messages/ and GET /api/gmail/search/ */
export interface GmailMessageListResponse {
  messages: GmailMessageStub[];
  next_page_token: string | null;
  result_size_estimate: number | null;
}

/** Query params accepted by the message list endpoint. */
export interface GmailListParams {
  max_results?: number;
  page_token?: string;
}

/** Query params accepted by the search endpoint. */
export interface GmailSearchParams {
  q: string;
  max_results?: number;
  page_token?: string;
}

/**
 * A Gmail message in full format as returned by
 * GET /api/gmail/messages/<id>/
 *
 * This mirrors the raw Gmail API `Message` resource.
 * See: https://developers.google.com/gmail/api/reference/rest/v1/users.messages
 */
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
  headers?: Array<{ name: string; value: string }>;
  body?: { attachmentId?: string; size: number; data?: string };
  parts?: GmailMessagePart[];
}

/** Request body for POST /api/gmail/send/ and POST /api/gmail/drafts/ */
export interface GmailComposeRequest {
  to: string;
  subject: string;
  body: string;
}

/** Response from POST /api/gmail/send/ */
export interface GmailSendResponse {
  message_id: string;
  thread_id: string | null;
}

/** Response from POST /api/gmail/drafts/ */
export interface GmailDraftResponse {
  draft_id: string;
  message_id: string | null;
}
