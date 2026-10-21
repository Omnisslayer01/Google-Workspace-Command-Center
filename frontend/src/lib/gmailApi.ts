import { apiFetch } from "./apiClient";

import type {
  GmailComposeRequest,
  GmailDraftResponse,
  GmailListParams,
  GmailMessage,
  GmailMessageListResponse,
  GmailSearchParams,
  GmailSendResponse,
} from "../types/gmail";

type GmailListApiResponse =
  | GmailMessageListResponse
  | {
      success: boolean;
      message: string;
      data: GmailMessageListResponse;
    };

function unwrapGmailListResponse(
  response: GmailListApiResponse
): GmailMessageListResponse {
  const envelope = response as {
    data?: GmailMessageListResponse;
  };

  return envelope.data ?? (response as GmailMessageListResponse);
}

export async function listGmailMessages(
  params: GmailListParams = {}
): Promise<GmailMessageListResponse> {
  const query = new URLSearchParams();

  if (params.max_results !== undefined) {
    query.set("max_results", String(params.max_results));
  }

  if (params.page_token) {
    query.set("page_token", params.page_token);
  }

  const response = await apiFetch<
    | GmailMessageListResponse
    | { success: boolean; message: string; data: GmailMessageListResponse }
  >(`/api/gmail/messages/?${query.toString()}`);

  return unwrapGmailListResponse(response);
}


type GmailMessageApiResponse =
  | GmailMessage
  | {
      success: boolean;
      message: string;
      data: GmailMessage;
    };

export async function getGmailMessage(
  messageId: string
): Promise<GmailMessage> {
  const response = await apiFetch<GmailMessageApiResponse>(
    `/api/gmail/messages/${messageId}/`
  );

  if ("data" in response) {
    return response.data;
  }

  return response;
}

export async function searchGmailMessages(
  params: GmailSearchParams
): Promise<GmailMessageListResponse> {
  const query = new URLSearchParams();

  query.set("q", params.q);

  if (params.max_results !== undefined) {
    query.set("max_results", String(params.max_results));
  }

  if (params.page_token) {
    query.set("page_token", params.page_token);
  }

  const response = await apiFetch<
    | GmailMessageListResponse
    | { success: boolean; message: string; data: GmailMessageListResponse }
  >(`/api/gmail/search/?${query.toString()}`);

  return unwrapGmailListResponse(response);
}

export async function sendGmailMessage(
  payload: GmailComposeRequest
): Promise<GmailSendResponse> {
  return apiFetch<GmailSendResponse>(
    "/api/gmail/send/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createGmailDraft(
  payload: GmailComposeRequest
): Promise<GmailDraftResponse> {
  return apiFetch<GmailDraftResponse>(
    "/api/gmail/drafts/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function downloadGmailAttachment(
  messageId: string,
  attachmentId: string
): Promise<Blob> {
  return apiFetch<Blob>(
    `/api/gmail/attachments/${messageId}/${attachmentId}/`
  );
}