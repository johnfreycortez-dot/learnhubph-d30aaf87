import { useState } from "react";
import { BookOpen, ClipboardList, Plus, Trash2, X } from "lucide-react";
import { gasCall } from "@/lib/api";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";
import { EmptyState, LoadState, SearchInput, SectionHeading, TableShell, rowCls, thCls, useAdminQuery } from "./shared";

export default function CoursesTab() {
  const [sub, setSub] = useState<"lessons" | "quizzes">("lessons");
  return (
    <div>
      <SectionHeading title="Courses" />
      <div className="mt-4 inline-flex rounded-full border border-gray-100 bg-white p-1 shadow-sm">
        <button onClick={() => setSub("lessons")}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${sub === "lessons" ? "bg-purple-700 text-white shadow-sm" : "text-gray-500 hover:text-purple-700"}`}>
          <BookOpen size={16} /> Lessons
        </button>
        <button onClick={() => setSub("quizzes")}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${sub === "quizzes" ? "bg-purple-700 text-white shadow-sm" : "text-gray-500 hover:text-purple-700"}`}>
          <ClipboardList size={16} /> Quizzes
        </button>
      </div>
      <div className="mt-6">{sub === "lessons" ? <LessonsSub /> : <QuizzesSub />}</div>
    </div>
  );
}

function LessonsSub() {
  const { showToast } = useToast();
  const q = useAdminQuery("adminGetAllLessons");
  const rows: any[] = (q.data as any)?.rows || [];
  const [search, setSearch] = useState("");
  const filtered = rows.filter((r) =>
    !search ||
    r.lessonId?.toLowerCase().includes(search.toLowerCase()) ||
    r.moduleName?.toLowerCase().includes(search.toLowerCase()) ||
    r.title?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="max-w-sm"><SearchInput value={search} onChange={setSearch} placeholder="Search lessons..." /></div>
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {!q.loading && filtered.length === 0 && (
        <TableShell>
          <EmptyState icon={<BookOpen size={26} />} title="No lessons found" />
        </TableShell>
      )}
      {!q.loading && filtered.length > 0 && (
        <TableShell>
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80">
              <tr>{["Lesson ID", "Module", "Title", "Video URL", ""].map((h) => (
                <th key={h} className={`${thCls} px-3`}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map((r) => <LessonRow key={r.rowIndex} r={r} showToast={showToast} />)}
            </tbody>
          </table>
        </TableShell>
      )}
    </div>
  );
}

function LessonRow({ r, showToast }: { r: any; showToast: (m: string, v?: any) => void }) {
  const [title, setTitle] = useState(r.title || "");
  const [video, setVideo] = useState(r.videoUrl || "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await gasCall("adminSaveLessonEdit", r.rowIndex, title, video);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      } else showToast(res.msg || "Failed", "error");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-purple-500";

  return (
    <tr className={rowCls}>
      <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-gray-900">{r.lessonId}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-gray-600">{r.moduleName}</td>
      <td className="px-3 py-2.5"><input value={title} onChange={(e) => setTitle(e.target.value)} className={inp} /></td>
      <td className="px-3 py-2.5"><input value={video} onChange={(e) => setVideo(e.target.value)} className={inp} /></td>
      <td className="px-3 py-2.5">
        <button onClick={save} disabled={saving}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors ${saved ? "bg-green-600" : "bg-purple-700 hover:bg-purple-800"}`}>
          {saved ? "✓ Saved" : "Save"}
        </button>
      </td>
    </tr>
  );
}

function QuizzesSub() {
  const { showToast } = useToast();
  const q = useAdminQuery("adminGetAllQuizzes");
  const lessonsQ = useAdminQuery("adminGetAllLessons");
  const rows: any[] = (q.data as any)?.rows || [];
  const lessons: any[] = (lessonsQ.data as any)?.rows || [];
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [del, setDel] = useState<number | null>(null);

  const filtered = rows.filter((r) =>
    !search ||
    r.lessonId?.toLowerCase().includes(search.toLowerCase()) ||
    r.question?.toLowerCase().includes(search.toLowerCase()),
  );

  async function doDelete() {
    if (del === null) return;
    const res = await gasCall("adminDeleteQuiz", del);
    if (res.ok) {
      showToast("Question deleted.", "info");
      q.reload();
    } else showToast(res.msg || "Failed", "error");
    setDel(null);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap justify-between gap-3">
        <div className="max-w-sm flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search quizzes..." /></div>
        <button onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-purple-800">
          <Plus size={16} /> Add Question
        </button>
      </div>
      <LoadState loading={q.loading} error={q.error} onRetry={q.reload} />
      {!q.loading && filtered.length === 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <EmptyState icon={<ClipboardList size={26} />} title="No quiz questions found" />
        </div>
      )}
      {!q.loading && filtered.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50/80">
                <tr>{["Quiz ID", "Lesson", "Question", "A", "B", "C", "D", "Correct", ""].map((h) => (
                  <th key={h} className={`${thCls} px-2 normal-case`}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.map((r) => <QuizRow key={r.rowIndex} r={r} showToast={showToast} onDelete={() => setDel(r.rowIndex)} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {addOpen && <AddQuizModal lessons={lessons} onClose={() => setAddOpen(false)} onAdded={() => { q.reload(); setAddOpen(false); }} />}
      <ConfirmModal isOpen={del !== null} title="Delete Question" message="Delete this quiz question?" confirmLabel="Delete" confirmVariant="danger" onConfirm={doDelete} onCancel={() => setDel(null)} />
    </div>
  );
}

function QuizRow({ r, showToast, onDelete }: { r: any; showToast: (m: string, v?: any) => void; onDelete: () => void }) {
  const [q, setQ] = useState(r.question || "");
  const [a, setA] = useState(r.optionA || "");
  const [b, setB] = useState(r.optionB || "");
  const [c, setC] = useState(r.optionC || "");
  const [d, setD] = useState(r.optionD || "");
  const [correct, setCorrect] = useState(r.correctAnswer || "");
  const [saved, setSaved] = useState(false);

  async function save() {
    const res = await gasCall("adminSaveQuizEdit", r.rowIndex, q, a, b, c, d, correct);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } else showToast(res.msg || "Failed", "error");
  }

  const inp = "w-full rounded-md border border-gray-200 px-2 py-1 outline-none transition-shadow focus:ring-2 focus:ring-purple-500";

  return (
    <tr className={rowCls}>
      <td className="whitespace-nowrap px-2 py-2 font-semibold text-gray-900">{r.quizId}</td>
      <td className="whitespace-nowrap px-2 py-2 text-gray-600">{r.lessonId}</td>
      <td className="min-w-[220px] px-2 py-2"><input value={q} onChange={(e) => setQ(e.target.value)} className={inp} /></td>
      <td className="px-2 py-2"><input value={a} onChange={(e) => setA(e.target.value)} className={inp} /></td>
      <td className="px-2 py-2"><input value={b} onChange={(e) => setB(e.target.value)} className={inp} /></td>
      <td className="px-2 py-2"><input value={c} onChange={(e) => setC(e.target.value)} className={inp} /></td>
      <td className="px-2 py-2"><input value={d} onChange={(e) => setD(e.target.value)} className={inp} /></td>
      <td className="px-2 py-2"><input value={correct} onChange={(e) => setCorrect(e.target.value)} className={inp} /></td>
      <td className="whitespace-nowrap px-2 py-2">
        <div className="flex gap-1">
          <button onClick={save} className={`rounded-md px-2 py-1 font-bold text-white shadow-sm ${saved ? "bg-green-600" : "bg-purple-700 hover:bg-purple-800"}`}>{saved ? "✓" : "Save"}</button>
          <button onClick={onDelete} className="rounded-md bg-red-600 px-2 py-1 text-white shadow-sm hover:bg-red-700"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );
}

function AddQuizModal({ lessons, onClose, onAdded }: { lessons: any[]; onClose: () => void; onAdded: () => void }) {
  const { showToast } = useToast();
  const [lessonId, setLessonId] = useState("");
  const [question, setQuestion] = useState("");
  const [a, setA] = useState(""); const [b, setB] = useState(""); const [c, setC] = useState(""); const [d, setD] = useState("");
  const [correct, setCorrect] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    try {
      const res = await gasCall("adminAddQuiz", lessonId, question, a, b, c, d, correct);
      if (res.ok) {
        showToast("Question added!", "success");
        onAdded();
      } else showToast(res.msg || "Failed", "error");
    } finally {
      setBusy(false);
    }
  }

  const inp = "w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500";

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg animate-in fade-in zoom-in-95 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl duration-150">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900">Add Question</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className={inp}>
            <option value="">Select Lesson</option>
            {lessons.map((l) => <option key={l.rowIndex} value={l.lessonId}>{l.lessonId} — {l.title}</option>)}
          </select>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Question" className={`${inp} min-h-[80px]`} />
          <input value={a} onChange={(e) => setA(e.target.value)} placeholder="Option A" className={inp} />
          <input value={b} onChange={(e) => setB(e.target.value)} placeholder="Option B" className={inp} />
          <input value={c} onChange={(e) => setC(e.target.value)} placeholder="Option C" className={inp} />
          <input value={d} onChange={(e) => setD(e.target.value)} placeholder="Option D" className={inp} />
          <input value={correct} onChange={(e) => setCorrect(e.target.value)} placeholder="Correct Answer (must match one option)" className={inp} />
          <button onClick={add} disabled={busy || !lessonId || !question || !correct}
            className="w-full rounded-xl bg-purple-700 px-5 py-2.5 font-bold text-white shadow-sm transition-colors hover:bg-purple-800 disabled:opacity-60">
            {busy ? "Adding..." : "Add Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
