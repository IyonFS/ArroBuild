import { notFound, redirect } from "next/navigation";
import { getPath } from "@/lib/learn-content";
import { getFirstLessonHref } from "@/lib/learn-nav";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ path: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path: pathSlug } = await params;
  const path = getPath(pathSlug);
  if (!path) return { title: "Not Found" };
  return {
    title: `${path.title} — Learn Hub · ArroBuild`,
    description: path.description,
  };
}

export default async function LearnPathPage({ params }: Props) {
  const { path: pathSlug } = await params;
  const path = getPath(pathSlug);
  if (!path) notFound();

  redirect(getFirstLessonHref(path));
}
