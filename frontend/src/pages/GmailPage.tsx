import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  Mail,
  MailOpen,
  RefreshCw,
  Search,
  Paperclip,
  Inbox,
  AlertCircle,
  ChevronRight,
  X,
} from "lucide-react";

import { Header } from "../components/common/Header";
import {
  getGmailMessage,
  listGmailMessages,
  searchGmailMessages,
  downloadGmailAttachment,
} from "../lib/gmailApi";

import type {
  GmailMessage,
  GmailMessageStub,
} from "../types/gmail";

type GmailAttachment = {
  id: string;
  filename: string;
  mimeType: string;
};

type MessagePreview = {
  from: string;
  subject: string;
  snippet: string;
};

type MessageDetails = MessagePreview & {
  to: string;
  date: string;
  body: string;
  attachments: GmailAttachment[];
};

const getHeader = (
  message: GmailMessage,
  name: string
): string => {
  const headers = message.payload?.headers ?? [];

  return (
    headers.find(
      (header) =>
        (header.name ?? "").toLowerCase() === name.toLowerCase()
    )?.value ?? ""
  );
};

const decodeBase64Url = (value: string): string => {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded =
      normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

    const binary = atob(padded);
    const bytes = Uint8Array.from(
      binary,
      (character) => character.charCodeAt(0)
    );

    return new TextDecoder().decode(bytes);
  } catch {
    return "";
  }
};

const extractBody = (message: GmailMessage): string => {
  const payload = message.payload;

  if (!payload) {
    return message.snippet ?? "";
  }

  const findBody = (
    part: NonNullable<GmailMessage["payload"]>
  ): string => {
    if (part.mimeType === "text/plain" && part.body?.data) {
      return decodeBase64Url(part.body.data);
    }

    if (Array.isArray(part.parts)) {
      for (const child of part.parts) {
        const result = findBody(child);
        if (result) return result;
      }
    }

    if (part.mimeType === "text/html" && part.body?.data) {
      const html = decodeBase64Url(part.body.data);

      return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<\/(div|p|br|li|tr|h[1-6])\s*>/gi, "\n")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/[ \t]+\n/g, "\n")
        .trim();
    }

    return "";
  };

  return findBody(payload) || message.snippet || "";
};

const getAttachments = (
  message: GmailMessage
): GmailAttachment[] => {
  const attachments: GmailAttachment[] = [];

  const walk = (
    part: NonNullable<GmailMessage["payload"]>
  ): void => {
    if (part.filename?.trim() && part.body?.attachmentId) {
      attachments.push({
        id: part.body.attachmentId,
        filename: part.filename,
        mimeType: part.mimeType ?? "application/octet-stream",
      });
    }

    if (Array.isArray(part.parts)) {
      part.parts.forEach(walk);
    }
  };

  if (message.payload) walk(message.payload);

  return attachments;
};

const getPreview = (message: GmailMessage): MessagePreview => ({
  from: getHeader(message, "From") || "Unknown sender",
  subject: getHeader(message, "Subject") || "(No subject)",
  snippet: message.snippet ?? "",
});

const getMessageDetails = (
  message: GmailMessage
): MessageDetails => {
  let date = getHeader(message, "Date");

  if (!date && message.internalDate) {
    const timestamp = Number(message.internalDate);

    if (Number.isFinite(timestamp)) {
      date = new Date(timestamp).toLocaleString();
    }
  }

  return {
    ...getPreview(message),
    to: getHeader(message, "To"),
    date,
    body: extractBody(message),
    attachments: getAttachments(message),
  };
};

export const GmailPage: React.FC = () => {
  const [messages, setMessages] = useState<GmailMessageStub[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [selectedMessage, setSelectedMessage] =
    useState<GmailMessage | null>(null);

  const [messagePreviews, setMessagePreviews] = useState<
    Record<string, MessagePreview>
  >({});

  const [downloadingAttachment, setDownloadingAttachment] =
    useState<string | null>(null);

  const loadInbox = useCallback(
    async (pageToken?: string, append = false) => {
      try {
        setError(null);

        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setSelectedMessage(null);
        }

        const response = activeSearch
          ? await searchGmailMessages({
              q: activeSearch,
              max_results: 20,
              page_token: pageToken,
            })
          : await listGmailMessages({
              max_results: 20,
              page_token: pageToken,
            });

        const pageMessages = Array.isArray(response?.messages)
          ? response.messages
          : [];

        setMessages((previous) =>
          append ? [...previous, ...pageMessages] : pageMessages
        );

        setNextPageToken(response?.next_page_token ?? null);
      } catch (err: unknown) {
        console.error("Failed to load Gmail:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Gmail messages."
        );

        if (!append) {
          setMessages([]);
          setNextPageToken(null);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeSearch]
  );

  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  // Fetch sender, subject and snippet for messages in the current inbox.
  useEffect(() => {
    let cancelled = false;

    const loadPreviews = async () => {
      const missing = messages.filter(
        (message) => !messagePreviews[message.id]
      );

      // Fetch in small batches to avoid sending too many requests at once.
      for (let i = 0; i < missing.length; i += 5) {
        const batch = missing.slice(i, i + 5);

        const results = await Promise.all(
          batch.map(async (message) => {
            try {
              const fullMessage = await getGmailMessage(message.id);

              return {
                id: message.id,
                preview: getPreview(fullMessage),
              };
            } catch (err) {
              console.error(
                "Could not load message preview:",
                message.id,
                err
              );
              return null;
            }
          })
        );

        if (cancelled) return;

        setMessagePreviews((previous) => {
          const updated = { ...previous };

          for (const result of results) {
            if (result) updated[result.id] = result.preview;
          }

          return updated;
        });
      }
    };

    if (messages.length > 0) {
      void loadPreviews();
    }

    return () => {
      cancelled = true;
    };
    // Preview state is intentionally not a dependency: adding a preview
    // should not restart all of the requests for the same inbox.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const openMessage = async (
    message: GmailMessageStub
  ): Promise<void> => {
    try {
      setLoadingMessage(true);
      setError(null);
      setSelectedMessage(null);

      const fullMessage = await getGmailMessage(message.id);
      setSelectedMessage(fullMessage);

      setMessagePreviews((previous) => ({
        ...previous,
        [message.id]: getPreview(fullMessage),
      }));
    } catch (err: unknown) {
      console.error("Failed to load Gmail message:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to open this message."
      );
    } finally {
      setLoadingMessage(false);
    }
  };

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    setActiveSearch(search.trim());
  };

  const clearSearch = (): void => {
    setSearch("");
    setActiveSearch("");
  };

  const handleDownload = async (
    attachmentId: string,
    filename: string
  ): Promise<void> => {
    if (!selectedMessage) return;

    try {
      setDownloadingAttachment(attachmentId);
      setError(null);

      const blob = await downloadGmailAttachment(
        selectedMessage.id,
        attachmentId
      );

      if (!(blob instanceof Blob)) {
        throw new Error("The attachment response is invalid.");
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = filename || "attachment";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err: unknown) {
      console.error("Attachment download failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to download attachment."
      );
    } finally {
      setDownloadingAttachment(null);
    }
  };

  const messageDetails = selectedMessage
    ? getMessageDetails(selectedMessage)
    : null;

  const attachments = Array.isArray(messageDetails?.attachments)
    ? messageDetails.attachments
    : [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Header />

      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#EA4335]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#EA4335]">
                Gmail Workspace
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
            <p className="mt-1 text-sm text-slate-500">
              View and manage messages connected to your Google Workspace
              account.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadInbox()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="mt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search Gmail — e.g. from:alice subject:invoice"
                aria-label="Search Gmail"
                className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-[#4285F4] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3367d6]"
            >
              Search
            </button>

            {activeSearch && (
              <button
                type="button"
                onClick={clearSearch}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </form>

          {activeSearch && (
            <p className="mt-2 text-xs text-slate-500">
              Searching Gmail for:{" "}
              <span className="font-semibold text-slate-700">
                {activeSearch}
              </span>
            </p>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Gmail request failed</p>
              <p className="mt-1 break-words text-sm">{error}</p>
              <button
                type="button"
                onClick={() => void loadInbox()}
                className="mt-2 text-sm font-semibold underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {selectedMessage && messageDetails ? (
            <div>
              <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="rounded-lg p-2 hover:bg-slate-100"
                  aria-label="Back to inbox"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">
                    {messageDetails.subject}
                  </h2>
                  <p className="text-xs text-slate-500">Message details</p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <h3 className="break-words text-xl font-bold text-slate-900">
                  {messageDetails.subject}
                </h3>

                <div className="mt-5 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="break-words text-sm">
                    <span className="font-semibold">From: </span>
                    {messageDetails.from}
                  </p>
                  <p className="break-words text-sm">
                    <span className="font-semibold">To: </span>
                    {messageDetails.to || "Unknown recipient"}
                  </p>
                  {messageDetails.date && (
                    <p className="text-xs text-slate-500">
                      {messageDetails.date}
                    </p>
                  )}
                </div>

                <div className="mt-6 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                  {messageDetails.body || "This message has no readable body."}
                </div>

                {attachments.length > 0 && (
                  <div className="mt-8 border-t border-slate-200 pt-6">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Paperclip className="h-4 w-4" />
                      Attachments ({attachments.length})
                    </h3>

                    <div className="space-y-2">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {attachment.filename}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {attachment.mimeType}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={
                              downloadingAttachment === attachment.id
                            }
                            onClick={() =>
                              void handleDownload(
                                attachment.id,
                                attachment.filename
                              )
                            }
                            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                          >
                            <Download className="h-3.5 w-3.5" />
                            {downloadingAttachment === attachment.id
                              ? "Downloading..."
                              : "Download"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Inbox className="h-4 w-4 text-[#EA4335]" />
                  <h2 className="text-sm font-semibold">
                    {activeSearch ? "Search Results" : "Inbox"}
                  </h2>
                  {!loading && (
                    <span className="text-xs text-slate-400">
                      ({messages.length})
                    </span>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                  <p className="mt-3 text-sm text-slate-500">
                    Loading Gmail...
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="p-12 text-center">
                  {error ? (
                    <AlertCircle className="mx-auto h-10 w-10 text-red-300" />
                  ) : (
                    <MailOpen className="mx-auto h-10 w-10 text-slate-300" />
                  )}

                  <p className="mt-3 font-semibold text-slate-700">
                    {error ? "Unable to load messages" : "No messages found"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {error
                      ? "Check your connection and try again."
                      : activeSearch
                        ? "Try a different Gmail search."
                        : "Your inbox is empty."}
                  </p>

                  {error && (
                    <button
                      type="button"
                      onClick={() => void loadInbox()}
                      className="mt-4 rounded-lg bg-[#4285F4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3367d6]"
                    >
                      Retry
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  {messages.map((message) => {
                    const preview = messagePreviews[message.id];

                    return (
                      <button
                        key={message.id}
                        type="button"
                        onClick={() => void openMessage(message)}
                        disabled={loadingMessage}
                        className="w-full border-b border-slate-100 px-5 py-4 text-left transition-colors hover:bg-slate-50 disabled:opacity-60"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#EA4335]">
                            <Mail className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {preview?.from ?? "Loading sender..."}
                            </p>
                            <p className="mt-1 truncate text-sm text-slate-700">
                              {preview?.subject ?? "Loading subject..."}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {preview?.snippet ?? `Message ID: ${message.id}`}
                            </p>
                          </div>

                          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                        </div>
                      </button>
                    );
                  })}

                  {nextPageToken && (
                    <div className="p-5 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          void loadInbox(nextPageToken, true)
                        }
                        disabled={loadingMore}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                      >
                        {loadingMore && (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        )}
                        {loadingMore
                          ? "Loading..."
                          : "Load more messages"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default GmailPage;
