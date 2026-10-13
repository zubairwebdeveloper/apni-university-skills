"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [likedPosts, setLikedPosts] = useState(new Set());

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

  function toggleLike(id) {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 3D banner */}
      <div className="relative h-[240px] overflow-hidden sm:h-[300px]">
        <CommunityScene className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Community
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                Ask questions, share what you&apos;re building, and learn
                alongside other students.
              </p>
            </div>
            <Button
              onClick={() => setComposerOpen((v) => !v)}
              className="gap-2 self-start bg-primary text-primary-foreground hover:bg-primary/90 sm:self-auto"
            >
              <PlusCircle className="h-4 w-4" />
              New Post
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main column */}
          <div>
            <AnimatePresence>
              {composerOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="mb-5 border-border bg-card">
                    <CardContent className="space-y-3 p-5">
                      <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="What do you want to ask or share?"
                        className="min-h-[90px]"
                      />
                      <div className="flex justify-end gap-2">
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
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pinned post */}
            <Card className="mb-5 border-primary/30 bg-primary/5">
              <CardContent className="flex items-start gap-3 p-5">
                <Pin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-card-foreground">
                    {PINNED_POST.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {PINNED_POST.excerpt}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Search + sort */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search discussions..."
                  className="pl-9"
                />
              </div>
              <div className="flex gap-1 rounded-md border border-border bg-card p-1 text-sm">
                {["latest", "top"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSort(s)}
                    className={`rounded px-3 py-1 capitalize transition-colors ${
                      sort === s
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Category chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    activeCategory === cat
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Posts list */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="mt-6 space-y-4"
            >
              {filteredPosts.map((post) => (
                <motion.div key={post.id} variants={item}>
                  <PostCard
                    post={post}
                    liked={likedPosts.has(post.id)}
                    onToggleLike={() => toggleLike(post.id)}
                  />
                </motion.div>
              ))}

              {filteredPosts.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No discussions match that search yet.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <Card className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <Trophy className="h-4 w-4 text-primary" />
                  Top Contributors
                </div>
                <ul className="mt-4 space-y-3">
                  {TOP_CONTRIBUTORS.map((person, i) => (
                    <li
                      key={person.name}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="w-4 text-xs font-medium text-muted-foreground">
                        {i + 1}
                      </span>
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-accent text-[10px] text-accent-foreground">
                          {person.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-card-foreground">
                        {person.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {person.points} pts
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Trending
                </div>
                <ul className="mt-4 space-y-3">
                  {TRENDING_TOPICS.map((topic) => (
                    <li
                      key={topic.label}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {topic.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {topic.count}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Community Guidelines
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Be respectful, search before posting duplicates, and keep
                  feedback constructive. Off-topic promotion isn&apos;t allowed.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, liked, onToggleLike }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="border-border bg-card transition-shadow hover:shadow-md">
        <CardContent className="flex gap-4 p-5">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src="" alt={post.author} />
            <AvatarFallback className="bg-accent text-xs text-accent-foreground">
              {post.initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-card-foreground">
                {post.author}
              </span>
              <span className="text-xs text-muted-foreground">
                · {post.time}
              </span>
              <Badge
                variant="secondary"
                className="ml-auto bg-accent text-[11px] text-accent-foreground sm:ml-0"
              >
                {post.category}
              </Badge>
            </div>

            <h3 className="mt-1.5 text-base font-semibold leading-snug text-card-foreground">
              {post.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {post.excerpt}
            </p>

            <div className="mt-3 flex items-center gap-5 text-xs text-muted-foreground">
              <button
                onClick={onToggleLike}
                className={`flex items-center gap-1.5 transition-colors ${
                  liked ? "text-primary" : "hover:text-foreground"
                }`}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                {post.likes + (liked ? 1 : 0)}
              </button>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                {post.replies} replies
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
