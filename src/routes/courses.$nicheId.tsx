import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { gasCall, getToken } from "@/lib/api";
import { SessionGuard } from "@/components/SessionGuard";
import { StudentShell } from "@/components/StudentShell";
import { Spinner } from "@/components/Spinner";

export const Route = createFileRoute("/courses/$nicheId")({ component: () => <SessionGuard><CourseDetail /></SessionGuard> });
function CourseDetail() { const { nicheId } = Route.useParams(); const navigate = useNavigate(); const [data,setData]=useState<any>(null);
  useEffect(()=>{void (async()=>setData(await gasCall("getCourseAndProgress",getToken())))()},[]);
  const niche=useMemo(()=>data?.modules?.find((n:any)=>n.NicheID===nicheId),[data,nicheId]);
  if(!data)return <div className="flex min-h-screen items-center justify-center"><Spinner size="lg"/></div>;
  if(!niche)return <StudentShell title="Course"><p className="text-sm text-gray-500">This course is not available yet.</p></StudentShell>;
  const lessons=niche.courses.flatMap((c:any)=>c.modules.flatMap((m:any)=>m.lessons)); const done=lessons.filter((l:any)=>data.progress?.[l.LessonID]).length; const percent=lessons.length?Math.round(done/lessons.length*100):0;
  return <StudentShell title={niche.NicheTitle}><div className="mx-auto max-w-4xl"><button onClick={()=>navigate({to:"/courses"})} className="inline-flex items-center gap-2 text-sm font-bold text-purple-700"><ArrowLeft size={16}/>All courses</button><section className="mt-5 rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm font-bold text-purple-600">YOUR LEARNING PATH</p><h2 className="mt-2 text-3xl font-black">{niche.NicheTitle}</h2><p className="mt-2 text-sm text-gray-500">{done} of {lessons.length} lessons completed</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-purple-100"><div className="h-full rounded-full bg-purple-700" style={{width:`${percent}%`}}/></div></section><div className="mt-6 space-y-4">{niche.courses.flatMap((course:any)=>course.modules).map((module:any,index:number)=><section key={module.ModuleID} className="rounded-2xl bg-white p-5 shadow-sm"><h3 className="font-black">Module {index+1}: {module.Title}</h3><div className="mt-3 divide-y">{module.lessons.map((lesson:any)=><button key={lesson.LessonID} onClick={()=>navigate({to:"/lesson/$lessonId",params:{lessonId:lesson.LessonID},state:{modules:data.modules,niche:niche.NicheTitle} as any})} className="flex w-full items-center gap-3 py-3 text-left hover:text-purple-700">{data.progress?.[lesson.LessonID]?<CheckCircle2 size={19} className="text-emerald-500"/>:<Circle size={19} className="text-gray-300"/>}<span className="flex-1 text-sm font-semibold">{lesson.Title}</span><PlayCircle size={18}/></button>)}</div></section>)}</div></div></StudentShell>;
}
