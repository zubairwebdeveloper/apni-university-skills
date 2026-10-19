"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  ThumbsUp,
  Search,
  TrendingUp,
  Users,
  PlusCircle,
  Pin,
  Trophy,
  X,
} from "lucide-react";
import CommunityScene from "@/components/three/scene-community";

// ---------------------------------------------------------------------------
// TEMP DATA — replace with real posts/categories from Firestore (e.g. a
// `communityPosts` collection) once wired into the existing data layer.
// ---------------------------------------------------------------------------
const CATEGORIES = [
  "All",
  "AI & Machine Learning",
  "Software Engineering",
  "Cloud Computing",
  "Career Advice",
  "Projects",
];

const TRENDING_TOPICS = [
  { label: "Resume reviews", count: 34 },
  { label: "LLM fine-tuning", count: 21 },
  { label: "Internship hunt 2026", count: 19 },
  { label: "Next.js vs Remix", count: 12 },
];

const TOP_CONTRIBUTORS = [
  { name: "Usman Farooq", initials: "UF", points: 1280 },
  { name: "Zara Malik", initials: "ZM", points: 960 },
  { name: "Hina Siddiqui", initials: "HS", points: 740 },
];

const PINNED_POST = {
  id: "pinned_1",
  author: "Apni University Team",
  initials: "AU",
  title: "Welcome — read before posting",
  excerpt:
    "A quick rundown of how categories work, how to format code in your posts, and what gets a thread removed.",
};

const POSTS = [
  {
    id: "p1",
    author: "Zara Malik",
    initials: "ZM",
    category: "AI & Machine Learning",
    title: "What helped you finally understand attention mechanisms?",
    excerpt:
      "I've gone through three tutorials and the math still isn't clicking the way the intuition should. Looking for explanations or analogies that worked for you.",
    replies: 18,
    likes: 42,
    time: "2h ago",
  },
  {
    id: "p2",
    author: "Usman Farooq",
    initials: "UF",
    category: "Career Advice",
    title: "Landed my first dev job — happy to answer questions",
    excerpt:
      "Six months ago I was stuck on tutorials. Posting my project list and interview prep approach in case it helps someone else here.",
    replies: 31,
    likes: 97,
    time: "5h ago",
  },
  {
    id: "p3",
    author: "Hina Siddiqui",
    initials: "HS",
    category: "Projects",
    title: "Built a small CLI tool for tracking study streaks",
    excerpt:
      "Nothing fancy, just scratched my own itch. Open to feedback on the code structure if anyone has a minute to look.",
    replies: 9,
    likes: 26,
    time: "1d ago",
  },
  {
    id: "p4",
    author: "Ali Raza",
    initials: "AR",
    category: "Cloud Computing",
    title: "Free-tier AWS vs GCP for a learning project — which lasted longer?",
    excerpt:
      "Trying to avoid an unexpected bill while I practice deploying things. Curious what others have run into.",
    replies: 14,
    likes: 20,
    time: "1d ago",
  },
];

const SORTS = [
  { id: "latest", label: "Latest" },
  { id: "top", label: "Top" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [likedPosts, setLikedPosts] = useState(new Set());
  const reduceMotion = useReducedMotion();

  const filteredPosts = useMemo(() => {
    let list = POSTS.filter((post) => {
      const matchesCategory =
        activeCategory === "All" || post.category === activeCategory;
      const matchesQuery = post.title
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
    if (sort === "top") {
      list = [...list].sort((a, b) => b.likes - a.likes);
    }
    return list;
  }, [activeCategory, query, sort]);

  const categoryCounts = useMemo(() => {
    const counts = { All: POSTS.length };
    POSTS.forEach((p) => {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    });
    return counts;
  }, []);

  const hasFilters = activeCategory !== "All" || query.trim() !== "";

  function toggleLike(id) {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function clearFilters() {
    setActiveCategory("All");
    setQuery("");
  }

  const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.06 } },
  };
  const itemVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.01 : 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, transition: { duration: reduceMotion ? 0.01 : 0.15 } },
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* 3D banner */}
      <header className="relative h-[260px] overflow-hidden sm:h-[320px]">
        <CommunityScene className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <h1 className="max-w-2xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Community
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                Ask questions, share what you&apos;re building, and learn
                alongside other students.
              </p>
            </div>
            <Button
              onClick={() => setComposerOpen((v) => !v)}
              aria-expanded={composerOpen}
              aria-controls="post-composer"
              className="group min-h-11 gap-2 self-start bg-yellow-400 px-5 font-semibold text-neutral-900 shadow-sm hover:bg-yellow-300 sm:self-auto"
            >
              <PlusCircle
                className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${
                  composerOpen ? "rotate-45" : ""
                }`}
                aria-hidden="true"
              />
              {composerOpen ? "Close composer" : "New Post"}
            </Button>
          </motion.div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
          {/* Main column */}
          <div className="min-w-0">
            <AnimatePresence initial={false}>
              {composerOpen && (
                <motion.section
                  id="post-composer"
                  aria-label="Create a post"
                  initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: reduceMotion ? 0.01 : 0.25 }}
                  className="overflow-hidden"
                >
                  <Card className="mb-6 border-border bg-card shadow-sm">
                    <CardContent className="space-y-3 p-5">
                      <Textarea
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        aria-label="Post content"
                        placeholder="What do you want to ask or share?"
                        className="min-h-[110px] resize-y"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-muted-foreground">
                          Search first to avoid duplicate threads.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setComposerOpen(false);
                              setDraft("");
                            }}
                          >
                            Cancel
                          </Button>
                          {/* Wire this up to the real post-creation mutation */}
                          <Button
                            disabled={!draft.trim()}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            Post
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Pinned post */}
            <section aria-label="Pinned announcement">
              <Card className="mb-6 border-violet-500/30 bg-violet-500/[0.06]">
                <CardContent className="flex items-start gap-3.5 p-5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-600 ring-1 ring-inset ring-violet-500/25 dark:text-violet-400">
                    <Pin className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <h2 className="text-sm font-semibold text-card-foreground">
                        {PINNED_POST.title}
                      </h2>
                      <span className="text-xs text-muted-foreground">
                        Pinned by {PINNED_POST.author}
                      </span>
                    </div>
                    <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
                      {PINNED_POST.excerpt}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Search + sort */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search discussions by title"
                  placeholder="Search discussions..."
                  className="h-11 pl-9"
                />
              </div>
              <div
                role="group"
                aria-label="Sort discussions"
                className="flex gap-1 self-start rounded-lg border border-border bg-card p-1 text-sm sm:self-auto"
              >
                {SORTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSort(s.id)}
                    aria-pressed={sort === s.id}
                    className={`min-h-9 rounded-md px-4 py-1.5 font-medium transition-colors ${focusRing} ${
                      sort === s.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category chips */}
            <div
              role="group"
              aria-label="Filter by category"
              className="mt-4 flex flex-wrap gap-2"
            >
              {CATEGORIES.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    aria-pressed={active}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${focusRing} ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {cat}
                    <span
                      className={`tabular-nums ${
                        active
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground/80"
                      }`}
                    >
                      {categoryCounts[cat] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Result summary */}
            <div
              aria-live="polite"
              className="mt-6 flex items-center justify-between gap-3 text-sm text-muted-foreground"
            >
              <p>
                <span className="font-medium tabular-nums text-foreground">
                  {filteredPosts.length}
                </span>{" "}
                {filteredPosts.length === 1 ? "discussion" : "discussions"}
                {sort === "top" ? ", most liked first" : ", latest first"}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-500/10 dark:text-violet-400 ${focusRing}`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                  Clear filters
                </button>
              )}
            </div>

            {/* Posts list */}
            {filteredPosts.length > 0 ? (
              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="mt-4 space-y-4"
              >
                <AnimatePresence mode="popLayout">
                  {filteredPosts.map((post) => (
                    <motion.li
                      key={post.id}
                      variants={itemVariants}
                      exit="exit"
                      layout={!reduceMotion}
                    >
                      <PostCard
                        post={post}
                        liked={likedPosts.has(post.id)}
                        onToggleLike={() => toggleLike(post.id)}
                        reduceMotion={reduceMotion}
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            ) : (
              <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
                <MessageSquare
                  className="h-8 w-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  No discussions match your filters
                </p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Try a different keyword or category, or start the conversation
                  yourself.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                  <Button size="sm" onClick={() => setComposerOpen(true)}>
                    New Post
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <Trophy
                    className="h-4 w-4 text-yellow-500"
                    aria-hidden="true"
                  />
                  Top Contributors
                </h2>
                <ol className="mt-4 space-y-1">
                  {TOP_CONTRIBUTORS.map((person, i) => (
                    <li
                      key={person.name}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted/50"
                    >
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums ${
                          i === 0
                            ? "bg-yellow-400 text-neutral-900"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-accent text-[11px] text-accent-foreground">
                          {person.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1 truncate text-card-foreground">
                        {person.name}
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {person.points.toLocaleString("en-US")} pts
                      </span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <TrendingUp
                    className="h-4 w-4 text-violet-500"
                    aria-hidden="true"
                  />
                  Trending
                </h2>
                <ul className="mt-3 space-y-0.5">
                  {TRENDING_TOPICS.map((topic) => (
                    <li
                      key={topic.label}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted/50"
                    >
                      <span className="min-w-0 truncate text-card-foreground">
                        {topic.label}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                        {topic.count}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <Users
                    className="h-4 w-4 text-violet-500"
                    aria-hidden="true"
                  />
                  Community Guidelines
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Be respectful, search before posting duplicates, and keep
                  feedback constructive. Off-topic promotion isn&apos;t allowed.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

function PostCard({ post, liked, onToggleLike, reduceMotion }) {
  const likeCount = post.likes + (liked ? 1 : 0);

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-border bg-card transition-[box-shadow,border-color] hover:border-violet-500/30 hover:shadow-md">
        <CardContent className="flex gap-4 p-5">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src="" alt="" />
            <AvatarFallback className="bg-accent text-xs text-accent-foreground">
              {post.initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-medium text-card-foreground">
                {post.author}
              </span>
              <span className="text-xs text-muted-foreground">{post.time}</span>
              <Badge
                variant="secondary"
                className="ml-auto bg-violet-500/10 text-[11px] font-medium text-violet-700 hover:bg-violet-500/10 dark:text-violet-300 sm:ml-0"
              >
                {post.category}
              </Badge>
            </div>

            <h3 className="mt-2 text-pretty text-base font-semibold leading-snug tracking-tight text-card-foreground sm:text-lg">
              {post.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={onToggleLike}
                aria-pressed={liked}
                aria-label={`${liked ? "Unlike" : "Like"} this post, ${likeCount} likes`}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium tabular-nums transition-colors ${focusRing} ${
                  liked
                    ? "bg-violet-500/10 text-violet-700 dark:text-violet-300"
                    : "hover:bg-muted hover:text-foreground"
                }`}
              >
                <ThumbsUp
                  className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`}
                  aria-hidden="true"
                />
                {likeCount}
              </button>
              <span className="inline-flex min-h-9 items-center gap-1.5 px-2.5 tabular-nums">
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                {post.replies} replies
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.article>
  );
}
