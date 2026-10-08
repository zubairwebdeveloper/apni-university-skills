import { courseService } from "@/services/courseService";
import { categoryService } from "@/services/categoryService";
import { instructorService } from "@/services/instructorService";
import { jobService } from "@/services/jobService";
import { reviewService } from "@/services/reviewService";
import { blogService } from "@/services/blogService";
import { statsService } from "@/services/statsService";
import { safe } from "@/lib/utils/safe";
import { HeroSection } from "@/components/public/home/HeroSection";
import { TechStrip } from "@/components/public/home/TechStrip";
import {
  PopularCategories,
  FeaturedCourses,
  JobsSection,
  FeaturedInstructors,
  Testimonials,
  BlogSection,
} from "@/components/public/home/DataSections";
import {
  WhyApni,
  LearningPaths,
  TechnologyAISection,
  CareerSection,
  FreeResources,
  FAQSection,
  NewsletterSection,
} from "@/components/public/home/EditorialSections";
import { Newsletter } from "@/components/public/Newsletter";
import { CTASection } from "@/components/public/CTASection";
import {
  TechMarquee,
  LearningPaths as TechLearningPaths,
} from "@/components/public/home/TechSections";
import { HowItWorks } from "@/components/public/home/DataSections";
export const revalidate = 300; // ISR: fresh every 5 minutes, served statically in between

export const metadata = {
  title: { absolute: "Apni University: Learn Skills. Build Your Future." },
  alternates: { canonical: "/" },
  openGraph: { title: "Apni University", url: "/" },
};

export default async function HomePage() {
  const [
    stats,
    categories,
    courses,
    instructors,
    jobs,
    reviews,
    posts,
    techPosts,
  ] = await Promise.all([
    safe(statsService.getPublicStats()),
    safe(categoryService.getFeaturedCategories(8)),
    safe(courseService.getFeaturedCourses(8)),
    safe(instructorService.getFeaturedInstructors(4)),
    safe(jobService.getLatestJobs(4)),
    safe(reviewService.getLatestApproved(3)),
    safe(blogService.getLatestPosts(3)),
    safe(blogService.getLatestPosts(3, { tag: "technology" })),
  ]);

  return (
    <>
      <HeroSection stats={stats} featuredCourse={courses[0] ?? null} />
      <TechStrip />
      <TechMarquee />
      <PopularCategories categories={categories} />
      <FeaturedCourses courses={courses} />
      <LearningPaths />
      <HowItWorks />
      <WhyApni />
      <TechnologyAISection />
      <CareerSection />
      <JobsSection jobs={jobs} />
      <FeaturedInstructors instructors={instructors} />
      <Testimonials reviews={reviews} />
      <BlogSection
        id="blog-title"
        eyebrow="Blog"
        title="Latest from the blog"
        posts={posts}
      />
      <BlogSection
        id="techblog-title"
        eyebrow="Technology"
        title="Latest technology articles"
        description="Plain-language explainers on what's changing in tech."
        posts={techPosts}
        tinted
      />
      <FreeResources />
      <FAQSection />
      <NewsletterSection>
        <Newsletter />
      </NewsletterSection>
      <CTASection />
    </>
  );
}

