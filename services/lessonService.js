// services/lessonService.js
import "server-only";
import { lessonRepository } from "@/repositories/lessonRepository";

// Whitelist, never blacklist. videoUrl is exposed ONLY for preview lessons; resources never.
const toPublicLesson = (l) => ({
  id: l.id,
  title: l.title,
  slug: l.slug,
  description: l.description ?? "",
  duration: l.duration ?? 0,
  order: l.order,
  isPreview: !!l.isPreview,
  sectionTitle: l.sectionTitle || "Course content",
  sectionOrder: l.sectionOrder ?? 0,
  videoUrl: l.isPreview ? (l.videoUrl ?? null) : null,
});

export function groupBySection(lessons) {
  const map = new Map();
  for (const l of lessons) {
    const key = `${l.sectionOrder}:${l.sectionTitle}`;
    if (!map.has(key))
      map.set(key, {
        title: l.sectionTitle,
        order: l.sectionOrder,
        lessons: [],
        duration: 0,
      });
    const s = map.get(key);
    s.lessons.push(l);
    s.duration += l.duration;
  }
  return [...map.values()].sort((a, b) => a.order - b.order);
}

export const lessonService = {
  getLessonsByCourse: async (courseId) =>
    (await lessonRepository.findPublishedByCourse(courseId)).map(
      toPublicLesson,
    ),
  async getPublicCurriculum(courseId) {
    return groupBySection(await this.getLessonsByCourse(courseId));
  },
  // Full lesson data for enrolled students (enrollment-checked) arrives in Batch 5.
  
};

