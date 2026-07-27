import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminPinEntry } from "@/components/AdminPinEntry";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — LearnHub PH" },
      { name: "description", content: "Admin login." },
      { property: "og:title", content: "Admin — LearnHub PH" },
      { property: "og:description", content: "Admin login." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <AdminPinEntry onSuccess={() => navigate({ to: "/admin/dashboard", replace: true })} />
    </div>
  );
}
