import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ExternalLink, Loader2 } from 'lucide-react';
import { getGmailMessage } from '../../lib/gmailApi';
import type { GmailMessageStub } from '../../types/gmail';

interface EmailPreviewItem {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
}

interface RecentEmailsCardProps {
  messages: GmailMessageStub[];
  loading?: boolean;
  error?: string | null;
  totalEstimate?: number | null;
}

export const RecentEmailsCard: React.FC<RecentEmailsCardProps> = ({
  messages,
  loading = false,
  error = null,
  totalEstimate = null,
}) => {
  const [previews, setPreviews] = useState<EmailPreviewItem[]>([]);
  const [loadingPreviews, setLoadingPreviews] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadPreviews() {
      if (!messages || messages.length === 0) {
        setPreviews([]);
        return;
      }

      setLoadingPreviews(true);
      const topMessages = messages.slice(0, 4);

      try {
        const fetched = await Promise.all(
          topMessages.map(async (msg) => {
            try {
              const full = await getGmailMessage(msg.id);
              const headers = full.payload?.headers ?? [];
              const getH = (name: string) =>
                headers.find((h) => (h.name ?? '').toLowerCase() === name.toLowerCase())?.value ?? '';

              return {
                id: full.id,
                from: getH('From') || 'Unknown sender',
                subject: getH('Subject') || '(No subject)',
                snippet: full.snippet || '',
                date: getH('Date') || '',
              };
            } catch {
              return {
                id: msg.id,
                from: 'Google Workspace',
                subject: `Message #${msg.id.substring(0, 8)}`,
                snippet: 'Click to open in Gmail view',
                date: '',
              };
            }
          })
        );

        if (!isCancelled) {
          setPreviews(fetched);
        }
      } catch (err) {
        console.error('Failed to load email previews', err);
      } finally {
        if (!isCancelled) {
          setLoadingPreviews(false);
        }
      }
    }

    loadPreviews();

    return () => {
      isCancelled = true;
    };
  }, [messages]);

  const cleanSender = (sender: string) => {
    const match = sender.match(/^([^<]+)/);
    return match ? match[1].trim().replace(/^"|"$/g, '') : sender;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between h-full">
      {/* Top Gmail Red hairline */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#EA4335]" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-[#EA4335]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Emails</h3>
              <p className="text-xs text-slate-500">Inbox communications and alerts</p>
            </div>
          </div>
          <Link
            to="/gmail"
            className="text-xs font-semibold text-[#EA4335] hover:text-[#d93025] flex items-center gap-1 transition-colors group"
          >
            <span>Open Gmail</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {error ? (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
            {error}
          </div>
        ) : loading || loadingPreviews ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-[#EA4335]" />
            <span className="text-xs">Loading inbox messages...</span>
          </div>
        ) : previews.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No recent messages found in Gmail.
          </div>
        ) : (
          <div className="space-y-2.5">
            {previews.map((item) => (
              <Link
                key={item.id}
                to="/gmail"
                className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all flex items-center justify-between gap-3 group block"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-red-50/60 border border-red-100 flex items-center justify-center shrink-0 text-[#EA4335]">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {cleanSender(item.from)}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-700 truncate group-hover:text-[#EA4335] transition-colors">
                      {item.subject}
                    </div>
                    {item.snippet && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-md">
                        {item.snippet}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 p-1 rounded text-slate-400 group-hover:text-slate-700">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{totalEstimate ? `~${totalEstimate} messages in inbox` : `${messages.length} messages fetched`}</span>
        <Link to="/gmail" className="text-[11px] text-[#EA4335] font-medium hover:underline">
          View all in Gmail →
        </Link>
      </div>
    </div>
  );
};

export default RecentEmailsCard;
