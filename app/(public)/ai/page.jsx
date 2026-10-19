// app/(public)/ai/page.jsx
import Link from "next/link";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiBookOpen,
  FiBriefcase,
  FiCheck,
  FiChevronDown,
  FiCode,
  FiEdit3,
  FiEye,
  FiLock,
  FiRefreshCw,
  FiShield,
  FiSlash,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Container, Section } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { BlogCard } from "@/components/public/BlogCard";
import { CourseCard } from "@/components/public/CourseCard";
import { JobCard } from "@/components/public/JobCard";
import { CountUp, Reveal, ToolsMarquee } from "@/components/public/AIMotion";
import {
  CanCantToggle,
  ChatDemo,
  LevelRoadmap,
} from "@/components/public/AIExplorer";
import { courseService } from "@/services/courseService";
import { blogService } from "@/services/blogService";
import { jobService } from "@/services/jobService";
import { safe } from "@/lib/utils/safe";
import { AI_CATEGORY_SLUG, aiPaths, aiRoles, aiTopics } from "@/config/ai";

export const revalidate = 300;
export const metadata = {
  title: "Artificial Intelligence",
  description:
    "Learn generative AI, AI agents, automation, machine learning, chatbots, and prompt engineering, with learning paths, courses, and jobs.",
  alternates: { canonical: "/ai" },
};

/* ------------------------------------------------------------------ */
/* Design tokens + small building blocks                               */
/* ------------------------------------------------------------------ */
// `apni-landing` activates the shared colour tokens (#111318 surface, #FACC15
// primary, violet accent). HeroSection and TechStrip already emit that CSS.
// If this page is ever rendered without them, move THEME_CSS (see
// HeroSection.jsx) into globals.css.
const SCOPE = "apni-landing bg-background text-foreground";
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const VIOLET = "text-[color:var(--violet)]";
// Cards react with a border change only, so the page stays calm to scan.
const CARD =
  "rounded-2xl border border-border bg-card p-5 transition-colors duration-200 hover:border-primary/60 motion-reduce:transition-none";

// Alternating bands: tinted ones get a top and bottom border.
const band = (tinted) => (tinted ? "border-y border-border bg-muted/40" : "");

function Tile({ icon: Icon, tone = "primary" }) {
  return (
    <span
      className={`grid size-11 shrink-0 place-items-center rounded-xl ${
        tone === "violet"
          ? `bg-[color:var(--violet)]/10 ${VIOLET}`
          : "bg-primary/10 text-primary"
      }`}
    >
      <Icon aria-hidden="true" className="size-5" />
    </span>
  );
}

// One card pattern for every icon + title + text block on the page.
function Feature({ icon, title, text, tone, delay = 0 }) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className={`h-full ${CARD}`}>
        <Tile icon={icon} tone={tone} />
        <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
      </div>
    </Reveal>
  );
}

function FeatureList({ items, cols, tone }) {
  return (
    <ul className={`grid grid-cols-1 gap-4 ${cols}`}>
      {items.map((item, i) => (
        <li key={item.title} className="min-w-0">
          <Feature {...item} tone={tone} delay={Math.min(i * 0.07, 0.4)} />
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */
// Who this track is actually built for.
const audiences = [
  {
    icon: FiBookOpen,
    title: "Curious beginners",
    text: "No coding background needed to start. Learn what AI actually is before touching any code.",
  },
  {
    icon: FiCode,
    title: "Developers",
    text: "Add AI APIs, agents and automation to the skills you already have.",
  },
  {
    icon: FiRefreshCw,
    title: "Career switchers",
    text: "Move toward AI-adjacent roles with a path that builds real, demonstrable projects.",
  },
  {
    icon: FiBriefcase,
    title: "Working professionals",
    text: "Use AI tools to work faster in your current job, no matter the field.",
  },
];

const promptTips = [
  {
    title: "Give it a role",
    weak: "Explain APIs.",
    strong:
      "Act as a patient teacher. Explain APIs to a beginner with one real life example.",
  },
  {
    title: "Add context and limits",
    weak: "Write a blog post about AI.",
    strong:
      "Write a 300 word blog post about AI for students in Pakistan. Use simple words and 3 short headings.",
  },
  {
    title: "Ask for a format",
    weak: "Compare React and Vue.",
    strong:
      "Compare React and Vue in a table with 5 rows: learning curve, speed, jobs, ecosystem, best use.",
  },
  {
    title: "Iterate instead of restarting",
    weak: "That's wrong, try again.",
    strong:
      "That's close, but keep it under 100 words and remove the second example. Keep everything else the same.",
  },
];

// Short, beginner-facing glossary.
const glossary = [
  {
    term: "LLM",
    text: "A large language model. The kind of AI behind tools like ChatGPT and Claude, trained on huge amounts of text.",
  },
  {
    term: "Prompt",
    text: "The instruction or question you give an AI model. Better prompts generally lead to better answers.",
  },
  {
    term: "Token",
    text: "A small chunk of text, roughly a word or part of a word, that models read and generate one at a time.",
  },
  {
    term: "Fine-tuning",
    text: "Further training a model on a specific dataset so it performs better at a narrow task.",
  },
  {
    term: "AI agent",
    text: "A system that uses an AI model to take actions, like calling tools or APIs, not just answer questions.",
  },
  {
    term: "Hallucination",
    text: "When a model confidently produces an answer that sounds right but is actually false.",
  },
];

// Common early mistakes.
const mistakes = [
  {
    title: "Trusting every answer",
    text: "Treating AI output as fact without checking it against a real source.",
  },
  {
    title: "Vague prompts",
    text: "Asking broad, one-line questions and expecting a precise, usable answer back.",
  },
  {
    title: "One-shot thinking",
    text: "Giving up after one bad response instead of refining the prompt and trying again.",
  },
  {
    title: "Sharing sensitive data",
    text: "Pasting private, personal, or client information into a public AI tool.",
  },
];

const responsible = [
  {
    icon: FiShield,
    title: "Check the facts",
    text: "AI can sound sure and still be wrong. Verify important answers from trusted sources.",
  },
  {
    icon: FiLock,
    title: "Protect your data",
    text: "Never paste passwords, private files or client secrets into public AI tools.",
  },
  {
    icon: FiEye,
    title: "Watch for bias",
    text: "Models learn from human data, so they can repeat unfair patterns. Question the output.",
  },
  {
    icon: FiUsers,
    title: "Keep humans in charge",
    text: "Use AI to help you decide, not to decide for you, especially for work that affects people.",
  },
  {
    icon: FiEdit3,
    title: "Credit and disclose",
    text: "Be upfront when AI helped produce something, especially in academic or professional work.",
  },
  {
    icon: FiSlash,
    title: "Know when not to use it",
    text: "Some decisions, like medical, legal or financial ones, need a qualified human, not a model.",
  },
];

const faqs = [
  {
    q: "Do I need strong math to learn AI?",
    a: "Not to start. You can build useful apps with AI tools and APIs using basic Python. Math becomes more important later if you go deep into model training.",
  },
  {
    q: "Will AI take my job?",
    a: "AI changes tasks more than it removes whole jobs. People who know how to use AI well are in high demand, which is why learning it now helps your career.",
  },
  {
    q: "Which programming language should I learn first?",
    a: "Python. Almost every AI library and tutorial uses it, and it is easy to read for beginners.",
  },
  {
    q: "How long until I can build something real?",
    a: "Most beginners can build a simple chatbot or automation within the first month if they practice a little every day.",
  },
  {
    q: "What's the difference between using AI tools and building with AI?",
    a: "Using AI tools means working with products like chat assistants. Building with AI means writing code that calls AI models through an API to power your own app.",
  },
  {
    q: "Do I need a powerful computer to learn AI?",
    a: "No. Most beginner projects use hosted APIs, so the heavy computation happens on someone else's servers, not your laptop.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default async function AIPage() {
  const [courses, posts, jobs] = await Promise.all([
    safe(courseService.getCoursesByCategorySlug(AI_CATEGORY_SLUG, 4), []),
    safe(blogService.getLatestPosts(3, { tag: "ai" }), []),
    safe(jobService.getJobsBySkill("AI", 4), []),
  ]);

  // Figures come from the real config, so they stay true as content grows.
  const stats = [
    { value: aiTopics.length, label: "Core AI topics" },
    { value: aiPaths.length, label: "Learning paths" },
    { value: aiRoles.length, label: "Career roles" },
  ];

  return (
    <div className={SCOPE}>
      <PageHeader
        title="Artificial Intelligence"
        description="Understand what AI can and can't do, learn to build with it, and see where it leads in your career."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "AI" }]}
      >
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/categories/${AI_CATEGORY_SLUG}`}
            className={buttonVariants({ size: "lg" })}
          >
            Browse AI courses
          </Link>
          <Link
            href="/careers/ai-engineer"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            See the AI Engineer path
          </Link>
        </div>

        <dl className="mt-8 grid max-w-xl grid-cols-3 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-3 text-center sm:p-4"
            >
              <dd className="text-xl font-semibold tabular-nums tracking-tight text-primary sm:text-2xl">
                <CountUp to={s.value} suffix="" />
              </dd>
              <dt className="mt-1 text-xs text-muted-foreground">{s.label}</dt>
            </div>
          ))}
        </dl>
      </PageHeader>

      <div className="relative overflow-x-clip">
        {/* Live demo */}
        <Section labelledBy="demo">
          <SectionHeader
            id="demo"
            eyebrow="See it in action"
            title="Talk to AI in plain language"
            description="This is what working with a modern AI assistant feels like."
          />
          <Reveal>
            <ChatDemo />
          </Reveal>
        </Section>

        {/* Who it's for */}
        <Section labelledBy="who" className={band(true)}>
          <SectionHeader
            id="who"
            eyebrow="Who this is for"
            title="Built for more than one starting point"
            description="Wherever you're coming from, there's a way in."
          />
          <FeatureList items={audiences} cols="sm:grid-cols-2 lg:grid-cols-4" />
        </Section>

        {/* Learning paths */}
        <Section labelledBy="paths">
          <SectionHeader
            id="paths"
            eyebrow="Learning paths"
            title="Choose where to start"
          />
          <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {aiPaths.map((p) => (
              <StaggerItem key={p.href} className="min-w-0">
                <Link
                  href={p.href}
                  className={`group block h-full rounded-xl ${FOCUS}`}
                >
                  <Card className="h-full gap-2 border-border p-6 transition-colors duration-200 group-hover:border-primary/60 motion-reduce:transition-none">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                      {p.title}
                    </h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {p.text}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary">
                      View roadmap
                      <FiArrowRight
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                      />
                    </span>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Section>

        {/* Core topics */}
        <Section labelledBy="topics" className={band(true)}>
          <SectionHeader
            id="topics"
            eyebrow="Core topics"
            title="What you'll learn about"
            description="Each topic comes with the practical skills behind it."
          />
          <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {aiTopics.map((t) => (
              <StaggerItem key={t.title} className="min-w-0">
                <Card className="h-full gap-3 border-border p-6 transition-colors duration-200 hover:border-primary/60 motion-reduce:transition-none">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {t.title}
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {t.text}
                  </p>
                  <ul
                    className="mt-auto flex flex-wrap gap-1.5 pt-1"
                    aria-label={`${t.title} skills`}
                  >
                    {t.skills.map((s) => (
                      <li key={s}>
                        <Badge variant="outline">{s}</Badge>
                      </li>
                    ))}
                  </ul>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </Section>

        {/* Can / can't */}
        <Section labelledBy="reality">
          <SectionHeader
            id="reality"
            eyebrow="Reality check"
            title="What AI can and can't do"
            description="Knowing the limits makes you better at using it."
          />
          <Reveal>
            <CanCantToggle />
          </Reveal>
        </Section>

        {/* Roadmap by level */}
        <Section labelledBy="levels" className={band(true)}>
          <SectionHeader
            id="levels"
            eyebrow="Your roadmap"
            title="From first prompt to real project"
            description="Pick your level and follow the steps in order."
          />
          <Reveal>
            <LevelRoadmap />
          </Reveal>
        </Section>

        {/* Tools */}
        <section aria-labelledby="tools-title" className="py-8">
          <Container>
            <h2
              id="tools-title"
              className="mb-4 text-center text-sm font-medium text-muted-foreground"
            >
              Tools and libraries you will use
            </h2>
            <ToolsMarquee />
          </Container>
        </section>

        {/* Prompt tips */}
        <Section labelledBy="prompts" className={band(true)}>
          <SectionHeader
            id="prompts"
            eyebrow="Prompt engineering"
            title="Better prompts, better answers"
            description="Small changes in how you ask make a big difference."
          />
          <Stagger className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {promptTips.map((t) => (
              <StaggerItem key={t.title} className="min-w-0">
                <Card className="h-full gap-4 border-border p-6">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {t.title}
                  </h3>
                  {/* Icon and label carry the meaning, colour only supports it. */}
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm leading-6 text-foreground">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-destructive">
                      <FiX aria-hidden="true" className="size-3.5" />
                      Weak prompt
                    </p>
                    {t.weak}
                  </div>
                  <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm leading-6 text-foreground">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <FiCheck aria-hidden="true" className="size-3.5" />
                      Strong prompt
                    </p>
                    {t.strong}
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </Section>

        {/* Glossary */}
        <Section labelledBy="glossary">
          <SectionHeader
            id="glossary"
            eyebrow="Speak the language"
            title="AI terms worth knowing"
            description="Six words you'll see constantly once you start learning AI."
          />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {glossary.map(({ term, text }, i) => (
              <li key={term} className="min-w-0">
                <Reveal delay={Math.min(i * 0.06, 0.4)} className="h-full">
                  <div className={`h-full ${CARD} p-4`}>
                    <h3 className={`font-mono text-sm font-semibold ${VIOLET}`}>
                      {term}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                      {text}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>

        {/* Careers */}
        <Section labelledBy="roles" className={band(true)}>
          <SectionHeader
            id="roles"
            eyebrow="Careers"
            title="AI career opportunities"
          />
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {aiRoles.map(([role, text], i) => (
              <Reveal key={role} delay={(i % 2) * 0.08} className="min-w-0">
                <div className={`h-full ${CARD}`}>
                  <dt className="text-lg font-semibold tracking-tight text-foreground">
                    {role}
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-muted-foreground">
                    {text}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </Section>

        {/* Related courses */}
        <Section labelledBy="ai-courses">
          <SectionHeader
            id="ai-courses"
            title="Related courses"
            href={`/categories/${AI_CATEGORY_SLUG}`}
            hrefLabel="See more"
          />
          {courses.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="AI courses are coming soon"
              description="Create an account to be ready on day one."
              action={
                <Link
                  href="/register"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Create free account
                </Link>
              }
            />
          )}
        </Section>

        {/* Common mistakes */}
        <Section labelledBy="mistakes" className={band(true)}>
          <SectionHeader
            id="mistakes"
            eyebrow="Learn from others"
            title="Mistakes most beginners make"
            description="Avoiding these will save you time in your first few weeks."
          />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {mistakes.map(({ title, text }, i) => (
              <li key={title} className="min-w-0">
                <Reveal delay={i * 0.08} className="h-full">
                  <div className={`flex h-full items-start gap-3 ${CARD}`}>
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
                      <FiAlertTriangle aria-hidden="true" className="size-4" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold tracking-tight text-foreground">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>

        {/* Responsible AI */}
        <Section labelledBy="responsible">
          <SectionHeader
            id="responsible"
            eyebrow="Use it wisely"
            title="Responsible AI habits"
            description="Good AI skills include knowing when not to trust it."
          />
          <FeatureList
            items={responsible}
            cols="sm:grid-cols-2 lg:grid-cols-3"
            tone="violet"
          />
        </Section>

        {/* Related articles */}
        {posts.length > 0 && (
          <Section labelledBy="ai-posts" className={band(true)}>
            <SectionHeader
              id="ai-posts"
              title="Related articles"
              href="/blog?category=ai"
              hrefLabel="More on AI"
            />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {posts.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </Section>
        )}

        {/* Related jobs */}
        <Section labelledBy="ai-jobs" className={band(!posts.length)}>
          <SectionHeader
            id="ai-jobs"
            title="Related jobs"
            href="/jobs"
            hrefLabel="All jobs"
          />
          {jobs.length ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {jobs.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No AI openings right now"
              description="New roles are posted regularly."
              action={
                <Link
                  href="/jobs"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Browse all jobs
                </Link>
              }
            />
          )}
        </Section>

        {/* FAQ */}
        <Section labelledBy="faq" className={band(!!posts.length)}>
          <SectionHeader id="faq" title="Common questions" />
          <Reveal>
            <div className="mx-auto max-w-3xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {faqs.map(({ q, a }) => (
                <details key={q} className="group">
                  <summary
                    className={`flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 motion-reduce:transition-none sm:text-base [&::-webkit-details-marker]:hidden ${FOCUS} focus-visible:ring-inset focus-visible:ring-offset-0`}
                  >
                    {q}
                    <FiChevronDown
                      aria-hidden="true"
                      className="size-4 shrink-0 text-primary transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none"
                    />
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-7 text-muted-foreground">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </Reveal>
        </Section>

        {/* CTA */}
        <section className="py-12 sm:py-16">
          <Container>
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-center sm:p-10">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-primary"
                />
                <h2 className="text-balance text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
                  Start building with AI today
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-base leading-7 text-muted-foreground">
                  Create a free account, pick your first AI course and ship a
                  small project this week.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className={buttonVariants({ size: "lg" })}
                  >
                    Create free account
                    <FiArrowRight aria-hidden="true" />
                  </Link>
                  <Link
                    href={`/categories/${AI_CATEGORY_SLUG}`}
                    className={buttonVariants({
                      size: "lg",
                      variant: "outline",
                    })}
                  >
                    Browse AI courses
                  </Link>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>
      </div>
    </div>
  );
}
