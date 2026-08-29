import { notFound } from "next/navigation";
import { getLesson, LEARNING_PATHS } from "@/lib/learn-content";
import LessonContent from "@/components/learn/LessonContent";
import LearnLessonDashboard from "@/components/learn/LearnLessonDashboard";
import LearnLessonNav from "@/components/learn/LearnLessonNav";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ path: string; lesson: string }>;
}

export async function generateStaticParams() {
  return LEARNING_PATHS.flatMap((path) =>
    path.lessons.map((lesson) => ({
      path: path.slug,
      lesson: lesson.slug,
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path: pathSlug, lesson: lessonSlug } = await params;
  const result = getLesson(pathSlug, lessonSlug);
  if (!result) return { title: "Not Found" };
  return {
    title: `${result.lesson.title} — ${result.path.title} · ArroBuild`,
    description: `Pelajari ${result.lesson.title} dalam ${result.lesson.estimasi}.`,
  };
}

export default async function LearnLessonPage({ params }: Props) {
  const { path: pathSlug, lesson: lessonSlug } = await params;
  const result = getLesson(pathSlug, lessonSlug);
  if (!result) notFound();

  const { path, lesson, index } = result;
  const prevLesson = index > 0 ? path.lessons[index - 1] : null;
  const nextLesson =
    index < path.lessons.length - 1 ? path.lessons[index + 1] : null;

  return (
    <LearnLessonDashboard
      path={path}
      lesson={lesson}
      index={index}
      footer={
        <LearnLessonNav
          pathSlug={path.slug}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
        />
      }
    >
      <LessonContent blocks={lesson.blocks} />
    </LearnLessonDashboard>
  );
}
