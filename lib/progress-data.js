export const PROGRESS_SORTS = [
  { value: "progress-desc", label: "Highest progress" },
  { value: "progress-asc", label: "Lowest progress" },
  { value: "title", label: "Title (A–Z)" },
];

export const MILESTONES = [25, 50, 75, 100];

// `check` receives: { total, completed, inProgress, notStarted, started, best, avg }
export const BADGES = [
  {
    id: "enrolled",
    icon: "rocket",
    title: "First Step",
    description: "Enroll in your first course.",
    check: (s) => s.total >= 1,
  },
  {
    id: "started",
    icon: "play",
    title: "Getting Started",
    description: "Make progress in any course.",
    check: (s) => s.started >= 1,
  },
  {
    id: "halfway",
    icon: "flag",
    title: "Halfway Hero",
    description: "Reach 50% in any course.",
    check: (s) => s.best >= 50,
  },
  {
    id: "finisher",
    icon: "trophy",
    title: "Course Completer",
    description: "Finish your first course.",
    check: (s) => s.completed >= 1,
  },
  {
    id: "multi",
    icon: "layers",
    title: "Multi-Tasker",
    description: "Be enrolled in 3 or more courses.",
    check: (s) => s.total >= 3,
  },
  {
    id: "champion",
    icon: "crown",
    title: "Tech Champion",
    description: "Complete 3 courses.",
    check: (s) => s.completed >= 3,
  },
];

export const PROGRESS_GUIDE = [
  {
    icon: "book",
    title: "Learn lesson by lesson",
    description:
      "Your progress grows as you complete lessons in each course. Pick up exactly where you stopped, any time.",
  },
  {
    icon: "flag",
    title: "Hit every milestone",
    description:
      "Each course has milestones at 25%, 50%, 75% and 100%, so you always know what to aim for next.",
  },
  {
    icon: "target",
    title: "Unlock achievements",
    description:
      "Enroll, make progress and complete courses to unlock badges that show how far you have come.",
  },
];

export const PROGRESS_TIPS = [
  {
    icon: "zap",
    title: "Little and often",
    description:
      "Thirty focused minutes every day builds more skill than one long weekend session.",
  },
  {
    icon: "flag",
    title: "Finish what you start",
    description:
      "Focus on one or two courses at a time. Reaching milestones keeps your motivation high.",
  },
  {
    icon: "book",
    title: "Review to remember",
    description:
      "Revisit completed courses and rebuild their projects from memory to lock in what you learned.",
  },
];
