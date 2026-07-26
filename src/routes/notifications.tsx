import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, BellOff, CreditCard, ClipboardList, MessageSquare } from "lucide-react";
import { gasCall, getToken } from "@/lib/api";
import { SessionGuard } from "@/components/SessionGuard";
import { StudentShell } from "@/components/StudentShell";
import { Spinner } from "@/components/Spinner";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — LearnHub PH" },
      { name: "description", content: "Your notifications and updates." },
      { property: "og:title", content: "Notifications — LearnHub PH" },
      { property: "og:description", content: "Your notifications and updates." },
    ],
  }),
  component: () => (
    <SessionGuard>
      <NotificationsPage />
    </SessionGuard>
  ),
});

type Notif = { notifId: string; type: string; title: string; body: string; createdAt: string; read: boolean };

function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await gasCall("getNotifications", getToken());
        setItems(res.items || []);
        setUnread(res.unread || 0);
        gasCall("markNotificationsRead", getToken()).catch(() => {});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <StudentShell unread={unread}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <Bell size={24} className="text-purple-600" />
          <h1 className="text-2xl font-extrabold">Notifications</h1>
          {unread > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread} new</span>
          )}
        </div>

        {loading ? (
          <div className="mt-10 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 text-center">
            <BellOff size={48} className="text-gray-300 mx-auto" />
            <p className="mt-2 text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {items.map((n) => (
              <NotifCard key={n.notifId} n={n} />
            ))}
          </ul>
        )}
      </div>
    </StudentShell>
  );
}

function NotifCard({ n }: { n: Notif }) {
  const border =
    n.type === "payment"
      ? "border-l-4 border-green-500"
      : n.type === "quiz"
        ? "border-l-4 border-purple-500"
        : n.type === "reply"
          ? "border-l-4 border-blue-500"
          : "border-l-4 border-gray-400";
  const Icon =
    n.type === "payment" ? CreditCard : n.type === "quiz" ? ClipboardList : n.type === "reply" ? MessageSquare : Bell;
  return (
    <li className={`rounded-xl p-4 shadow-sm flex gap-3 ${border} ${n.read ? "bg-white" : "bg-purple-50"}`}>
      <Icon size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <p className="font-bold text-sm text-gray-900">{n.title}</p>
          <span className="text-[10px] text-gray-400 flex-shrink-0">{n.createdAt}</span>
        </div>
        <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{n.body}</p>
      </div>
    </li>
  );
}
