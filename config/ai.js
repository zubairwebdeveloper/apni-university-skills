// config/ai.js: factual, non-promotional descriptions
export const AI_CATEGORY_SLUG = "ai-and-machine-learning";

export const aiTopics = [
  {
    title: "Generative AI",
    text: "Models that produce text, images, code, or audio from prompts. Learn what they do well, where they fail (including confident mistakes), and how to evaluate their output.",
    skills: ["Prompting", "Model APIs", "Output evaluation"],
  },
  {
    title: "AI Agents",
    text: "Systems where a model plans steps and calls tools to finish multi-step tasks. They need careful workflow design, permissions, and testing.",
    skills: ["Tool calling", "Workflow design", "Guardrails"],
  },
  {
    title: "AI Automation",
    text: "Using models inside everyday workflows such as classifying requests, extracting data from documents, or drafting replies, with humans reviewing the results.",
    skills: ["APIs", "Integrations", "Data privacy"],
  },
  {
    title: "Machine Learning",
    text: "Algorithms that learn patterns from data to predict or classify. The foundation behind recommendations, forecasting, and many AI products.",
    skills: ["Python", "Statistics", "Model evaluation"],
  },
  {
    title: "AI Chatbots",
    text: "Conversational interfaces that answer questions, often grounded in a company's own documents, with a clear handoff to a person when needed.",
    skills: ["Conversation design", "Retrieval", "Testing"],
  },
  {
    title: "Prompt Engineering",
    text: "Writing clear instructions, constraints, and examples, then testing and refining them. It is closer to specification writing than to tricks.",
    skills: ["Clear writing", "Structured outputs", "Evaluation"],
  },
  {
    title: "AI Developer Tools",
    text: "Coding assistants, SDKs, vector databases, and evaluation tools. Useful, but generated code still needs review, tests, and understanding.",
    skills: ["Code review", "SDKs", "Debugging"],
  },
];

export const aiPaths = [
  {
    title: "AI Engineer",
    href: "/careers/ai-engineer",
    text: "Build and ship products powered by models.",
  },
  {
    title: "Machine Learning Engineer",
    href: "/careers/ml-engineer",
    text: "Train, evaluate, and deploy ML systems.",
  },
  {
    title: "Data Analyst",
    href: "/careers/data-analyst",
    text: "Turn data into decisions, a common first step toward ML.",
  },
];

export const aiRoles = [
  ["AI Engineer", "Integrates models into applications and workflows."],
  ["Machine Learning Engineer", "Builds and deploys predictive models."],
  ["Data Scientist", "Analyzes data and builds statistical and ML models."],
  ["Data Analyst", "Reports and explains what the data shows."],
  ["Automation Specialist", "Designs AI-assisted business workflows."],
];

