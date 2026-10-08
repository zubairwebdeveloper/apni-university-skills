import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});
const db = getFirestore();

async function seed(collection, docs) {
  let created = 0;
  for (const d of docs) {
    try {
      await db
        .collection(collection)
        .doc(d.slug)
        .create({
          ...d,
          status: "published",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      created++;
    } catch (e) {
      if (e.code !== 6) throw e;
    } // 6 = ALREADY_EXISTS
  }
  console.log(
    `${collection}: ${created} created, ${docs.length - created} already existed`,
  );
}

// ---------- categories ----------
const cat = (name, slug, icon, description) => ({
  name,
  slug,
  icon,
  description,
});
const categories = [
  cat(
    "Web Development",
    "web-development",
    "code",
    "Build websites and web apps with HTML, CSS, JavaScript, React, and Next.js.",
  ),
  cat(
    "AI & Machine Learning",
    "ai-and-machine-learning",
    "ai",
    "Generative AI, machine learning, agents, and automation.",
  ),
  cat(
    "Data Science",
    "data-science",
    "data",
    "Analyze data, build models, and communicate insights.",
  ),
  cat(
    "Cybersecurity",
    "cybersecurity",
    "security",
    "Protect systems and data, and understand how attacks work.",
  ),
  cat(
    "Cloud Computing",
    "cloud-computing",
    "cloud",
    "Deploy and run applications on modern cloud platforms.",
  ),
  cat(
    "DevOps",
    "devops",
    "devops",
    "Automate builds, deployments, and infrastructure.",
  ),
  cat(
    "UI/UX Design",
    "ui-ux-design",
    "design",
    "Design interfaces that are usable, accessible, and beautiful.",
  ),
  cat(
    "Mobile Development",
    "mobile-development",
    "mobile",
    "Build apps for phones and tablets.",
  ),
  cat(
    "SaaS Development",
    "saas-development",
    "saas",
    "Design, build, and launch software-as-a-service products.",
  ),
  cat(
    "Business & Technology",
    "business-and-technology",
    "business",
    "Where technology meets strategy, product, and operations.",
  ),
  cat(
    "Freelancing",
    "freelancing",
    "career",
    "Find clients, price your work, and run a freelance practice.",
  ),
  cat(
    "Career Development",
    "career-development",
    "career",
    "Interviews, portfolios, and long-term growth in tech.",
  ),
].map((c, i) => ({ ...c, order: i + 1 }));

// ---------- technologies ----------
const tech = (
  slug,
  title,
  icon,
  order,
  summary,
  whatItIs,
  whyItMatters,
  skills,
  careerSlugs,
  categorySlug,
  jobSkill,
) => ({
  slug,
  title,
  icon,
  order,
  summary,
  whatItIs,
  whyItMatters,
  skills,
  careerSlugs,
  categorySlug,
  jobSkill,
  articleTag: slug,
});
const technologies = [
  tech(
    "web-development",
    "Web Development",
    "code",
    1,
    "Building the websites and web applications people use every day.",
    "Web development is the practice of building software that runs in a browser. It spans the interface people see (frontend), the servers and databases behind it (backend), and the tools that connect them.",
    "Almost every business needs a web presence, and many products are web apps first. Skills in this area transfer to freelancing, startups, and large companies.",
    ["HTML & CSS", "JavaScript", "React", "Node.js", "Databases", "Git"],
    ["frontend-developer", "backend-developer", "full-stack-developer"],
    "web-development",
    "JavaScript",
  ),
  tech(
    "cloud",
    "Cloud",
    "cloud",
    2,
    "Running applications on infrastructure you rent instead of own.",
    "Cloud computing delivers servers, storage, databases, and networking over the internet, so teams can launch and scale applications without buying hardware.",
    "Most modern software is deployed on cloud platforms. Understanding them helps you ship reliably, control costs, and design for failure.",
    [
      "Linux",
      "Networking",
      "Cloud platforms",
      "Containers",
      "Infrastructure as code",
    ],
    ["cloud-engineer", "devops-engineer"],
    "cloud-computing",
    "Cloud",
  ),
  tech(
    "devops",
    "DevOps",
    "devops",
    3,
    "Practices and tools that help teams build, test, and release software faster and safer.",
    "DevOps combines development and operations. It uses automation such as CI/CD pipelines, containers, and monitoring so changes reach users quickly and reliably.",
    "Frequent, safe releases are a competitive advantage. DevOps skills reduce outages and manual work.",
    ["Linux", "Docker", "CI/CD", "Monitoring", "Scripting"],
    ["devops-engineer", "cloud-engineer"],
    "devops",
    "DevOps",
  ),
  tech(
    "cybersecurity",
    "Cybersecurity",
    "security",
    4,
    "Protecting systems, networks, and data from attack and misuse.",
    "Cybersecurity covers the practices and tools used to prevent, detect, and respond to threats, from securing code and accounts to monitoring networks.",
    "Breaches are costly and every organization with an online presence is a target, so demand for security awareness runs through every technical role.",
    [
      "Networking",
      "Operating systems",
      "Threat analysis",
      "Secure coding",
      "Incident response",
    ],
    ["cybersecurity-analyst"],
    "cybersecurity",
    "Security",
  ),
  tech(
    "saas",
    "SaaS",
    "saas",
    5,
    "Software delivered as a subscription service over the web.",
    "Software as a Service means customers use an application hosted by the provider instead of installing it. Building one involves authentication, billing, multi-user data, and ongoing delivery.",
    "SaaS is a dominant way software is sold and a common path for founders and product teams.",
    [
      "Full stack development",
      "Databases",
      "Payments",
      "Security",
      "Product thinking",
    ],
    ["full-stack-developer", "backend-developer"],
    "saas-development",
    "SaaS",
  ),
  tech(
    "developer-tools",
    "Developer Tools",
    "code",
    6,
    "The editors, version control, and automation that make developers effective.",
    "Developer tools include code editors, Git and code hosting, package managers, testing frameworks, debuggers, and increasingly AI-assisted tools.",
    "Strong tool habits speed up learning and make teamwork smoother. Employers notice them.",
    ["Git", "Command line", "Testing", "Debugging", "Code review"],
    ["frontend-developer", "backend-developer", "full-stack-developer"],
    "web-development",
    "Git",
  ),
].map((t) => ({ ...t, whatItIs: t.whatItIs, whyItMatters: t.whyItMatters }));

// ---------- careers ----------
const FREELANCE =
  "Build a public portfolio, start with small, clearly scoped projects, and communicate in writing as carefully as you code. These habits matter as much as technical skill for freelance and remote roles.";
const career = (
  slug,
  title,
  order,
  summary,
  description,
  skills,
  roadmap,
  interviewPrep,
  portfolioIdeas,
  categorySlug,
  jobSkill,
) => ({
  slug,
  title,
  order,
  summary,
  description,
  skills,
  roadmap: roadmap.map(([t, text]) => ({ title: t, text })),
  interviewPrep,
  portfolioIdeas,
  categorySlug,
  jobSkill,
  freelanceNotes: FREELANCE,
});
const careers = [
  career(
    "frontend-developer",
    "Frontend Developer",
    1,
    "Build the interfaces people see and use in the browser.",
    "Frontend developers turn designs into fast, accessible, responsive web interfaces and connect them to APIs.",
    ["HTML & CSS", "JavaScript", "React", "Accessibility", "Git", "Testing"],
    [
      [
        "Web fundamentals",
        "Learn semantic HTML, modern CSS, and core JavaScript.",
      ],
      ["A framework", "Build component-based apps with React and Next.js."],
      [
        "Data and state",
        "Fetch from APIs and handle loading and error states.",
      ],
      [
        "Quality and shipping",
        "Add tests and accessibility checks, then deploy a real project.",
      ],
    ],
    [
      "Explain how a browser renders a page",
      "Build a small component live",
      "Discuss accessibility and performance trade-offs",
    ],
    [
      "A responsive personal site",
      "A dashboard using a public API",
      "A recreation of a real product's key flow",
    ],
    "web-development",
    "JavaScript",
  ),
  career(
    "backend-developer",
    "Backend Developer",
    2,
    "Build the servers, APIs, and databases behind applications.",
    "Backend developers design APIs, model data, handle authentication, and make sure systems are reliable and secure.",
    [
      "Node.js or Python",
      "Databases",
      "APIs",
      "Authentication",
      "Testing",
      "Git",
    ],
    [
      ["A language", "Learn one backend language and its ecosystem well."],
      ["Databases", "Model data in SQL and NoSQL and understand indexes."],
      ["APIs", "Build REST APIs with validation, auth, and error handling."],
      ["Operations", "Add logging, tests, and deploy to the cloud."],
    ],
    [
      "Design a simple API",
      "Explain database indexing",
      "Discuss authentication and security basics",
    ],
    [
      "A REST API with auth",
      "A small SaaS backend with payments",
      "A background job processor",
    ],
    "web-development",
    "Node.js",
  ),
  career(
    "full-stack-developer",
    "Full Stack Developer",
    3,
    "Work across the interface, the API, and the database.",
    "Full stack developers build complete features end to end, which makes them valuable in startups and small teams.",
    [
      "JavaScript",
      "React & Next.js",
      "Node.js",
      "Databases",
      "APIs",
      "Deployment",
    ],
    [
      ["Frontend foundations", "HTML, CSS, JavaScript, and React."],
      ["Backend foundations", "Node.js, APIs, and a database."],
      [
        "Full-stack framework",
        "Build features with Next.js, authentication, and payments.",
      ],
      ["Ship it", "Deploy, monitor, and iterate on a real product."],
    ],
    [
      "Walk through a feature you built end to end",
      "Discuss trade-offs in data modeling",
      "Debug a small full-stack issue",
    ],
    [
      "A full-stack SaaS app",
      "A marketplace with payments",
      "A learning or booking platform",
    ],
    "web-development",
    "JavaScript",
  ),
  career(
    "ai-engineer",
    "AI Engineer",
    4,
    "Build products and workflows powered by AI models.",
    "AI engineers integrate models into applications: calling model APIs, grounding answers in company data, building agents and automations, and evaluating quality and safety.",
    [
      "Python or JavaScript",
      "Model APIs",
      "Prompting",
      "Retrieval",
      "Evaluation",
      "Software engineering",
    ],
    [
      [
        "Programming foundations",
        "Become comfortable in Python or JavaScript and APIs.",
      ],
      [
        "ML basics",
        "Understand what models learn, their limits, and how to evaluate them.",
      ],
      [
        "Generative AI & agents",
        "Build with model APIs, tool calling, and retrieval.",
      ],
      [
        "Deploy and evaluate",
        "Ship an AI app with tests, monitoring, and guardrails.",
      ],
    ],
    [
      "Explain model limitations such as hallucination",
      "Design a retrieval-based Q&A system",
      "Describe how you would evaluate output quality",
    ],
    [
      "A document Q&A chatbot",
      "An AI workflow automation",
      "A small agent with tool calling",
    ],
    "ai-and-machine-learning",
    "AI",
  ),
  career(
    "ml-engineer",
    "Machine Learning Engineer",
    5,
    "Train, evaluate, and deploy machine learning systems.",
    "ML engineers prepare data, train and evaluate models, and put them into production reliably.",
    [
      "Python",
      "Statistics",
      "Machine learning",
      "Data preparation",
      "Model deployment",
      "SQL",
    ],
    [
      [
        "Python and math",
        "Python, probability, statistics, and linear algebra basics.",
      ],
      [
        "Core ML",
        "Supervised and unsupervised learning, evaluation, and overfitting.",
      ],
      ["Deep learning", "Neural networks with a modern framework."],
      ["Production", "Deploy a model and monitor it."],
    ],
    [
      "Explain overfitting and how to detect it",
      "Choose metrics for a given problem",
      "Walk through an end-to-end ML project",
    ],
    [
      "A prediction model with a clear write-up",
      "An image or text classifier",
      "A deployed model behind an API",
    ],
    "ai-and-machine-learning",
    "Machine Learning",
  ),
  career(
    "data-analyst",
    "Data Analyst",
    6,
    "Turn data into clear insights that guide decisions.",
    "Data analysts query, clean, and visualize data and explain what it means to decision makers.",
    [
      "SQL",
      "Spreadsheets",
      "Python",
      "Data visualization",
      "Statistics",
      "Communication",
    ],
    [
      ["Spreadsheets & SQL", "Query and summarize data confidently."],
      ["Python basics", "Clean and analyze data with common libraries."],
      ["Visualization", "Build clear charts and dashboards."],
      ["Storytelling", "Present findings and recommendations."],
    ],
    [
      "Write a SQL query live",
      "Interpret a chart",
      "Explain an analysis to a non-technical audience",
    ],
    [
      "A dashboard on a public dataset",
      "An analysis with written recommendations",
      "A cleaned and documented dataset",
    ],
    "data-science",
    "SQL",
  ),
  career(
    "devops-engineer",
    "DevOps Engineer",
    7,
    "Automate how software is built, tested, and released.",
    "DevOps engineers build CI/CD pipelines, manage infrastructure, and monitor systems so releases are fast and safe.",
    [
      "Linux",
      "Docker",
      "CI/CD",
      "Cloud platforms",
      "Infrastructure as code",
      "Monitoring",
    ],
    [
      [
        "Linux & networking",
        "Shell, processes, permissions, and networking basics.",
      ],
      [
        "Containers & CI/CD",
        "Docker and automated build and deploy pipelines.",
      ],
      ["Cloud & IaC", "Provision infrastructure with code."],
      ["Reliability & security", "Monitoring, alerting, and secure defaults."],
    ],
    [
      "Explain what happens in a CI/CD pipeline",
      "Debug a failing container",
      "Discuss monitoring and incident response",
    ],
    [
      "A containerized app with CI/CD",
      "Infrastructure defined as code",
      "A monitoring dashboard with alerts",
    ],
    "devops",
    "DevOps",
  ),
  career(
    "cloud-engineer",
    "Cloud Engineer",
    8,
    "Design and run applications on cloud platforms.",
    "Cloud engineers design reliable, secure, cost-aware infrastructure and migrate or run workloads in the cloud.",
    [
      "Cloud platforms",
      "Networking",
      "Linux",
      "Security",
      "Infrastructure as code",
      "Cost management",
    ],
    [
      ["Fundamentals", "Networking, Linux, and core cloud services."],
      [
        "Compute & storage",
        "Run apps with virtual machines, containers, and managed databases.",
      ],
      ["Security & identity", "Access control, secrets, and network design."],
      ["Automation", "Infrastructure as code and cost monitoring."],
    ],
    [
      "Design a simple highly available architecture",
      "Explain identity and access management",
      "Discuss cost trade-offs",
    ],
    [
      "A deployed app with documented architecture",
      "Infrastructure as code repository",
      "A cost and security review write-up",
    ],
    "cloud-computing",
    "Cloud",
  ),
  career(
    "cybersecurity-analyst",
    "Cybersecurity Analyst",
    9,
    "Detect, investigate, and respond to security threats.",
    "Security analysts monitor systems, investigate alerts, assess vulnerabilities, and help teams respond to incidents.",
    [
      "Networking",
      "Operating systems",
      "Threat analysis",
      "Security tools",
      "Incident response",
      "Communication",
    ],
    [
      [
        "IT fundamentals",
        "Networking, operating systems, and how the web works.",
      ],
      [
        "Security basics",
        "Common attacks, defenses, and the principle of least privilege.",
      ],
      [
        "Tools & practice",
        "Log analysis, vulnerability scanning, and hands-on labs.",
      ],
      ["Response & reporting", "Incident handling and clear written reports."],
    ],
    [
      "Explain common attack types and defenses",
      "Walk through investigating an alert",
      "Discuss risk and prioritization",
    ],
    [
      "Documented home-lab exercises",
      "A vulnerability assessment report",
      "Write-ups of practice challenges",
    ],
    "cybersecurity",
    "Security",
  ),
  career(
    "ui-ux-designer",
    "UI/UX Designer",
    10,
    "Design products that are easy, accessible, and enjoyable to use.",
    "UI/UX designers research user needs, design flows and interfaces, prototype, and test with real people.",
    [
      "Design fundamentals",
      "Figma",
      "User research",
      "Prototyping",
      "Accessibility",
      "Communication",
    ],
    [
      ["Design fundamentals", "Layout, typography, color, and hierarchy."],
      ["Tools", "Build interfaces and components in Figma."],
      ["Research & testing", "Interview users and test prototypes."],
      ["Portfolio", "Publish case studies that show your process."],
    ],
    [
      "Walk through a case study",
      "Critique an existing interface",
      "Explain how you handle feedback",
    ],
    [
      "Two or three end-to-end case studies",
      "A redesign with before and after",
      "An accessible design system starter",
    ],
    "ui-ux-design",
    "Figma",
  ),
];

await seed("categories", categories);
await seed("technologies", technologies);
await seed("careers", careers);
console.log("Done.");
