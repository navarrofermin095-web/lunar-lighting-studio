/* =====================================================================
   Lunar Lighting Studio — Recruitment data
   All roles + 5 business screening questions per role.
   Edit this file to update counts, add roles, or refine questions.
   ===================================================================== */

const STUDIO = {
  name: "Lunar Lighting Studio",
  owner: "OG_LEO",
  tagline: "Building high-quality, front-page experiences with deep mechanics.",
  resultEmail: "navarrofermin095@gmail.com", // where AI evaluations are sent (backend)
  discordUrl: "#", // TODO: replace with your real Discord invite
};

/* Each role:
   id      – unique slug used by the form
   name    – display name
   icon    – emoji (offline-safe, no external assets)
   filled  – spots already filled
   total   – total spots
   blurb   – short pitch shown on the card
   skills  – tag chips
   questions – 5 business screening questions
*/
const ROLES = [
  {
    id: "discord-handler",
    name: "Discord Handler",
    icon: "💬",
    filled: 1,
    total: 1,
    blurb: "Keep the community organized, safe, and active.",
    skills: ["Moderation", "Community", "Bots"],
    questions: [
      "Describe your experience moderating or managing Discord servers (server size, member count, and your exact role).",
      "How do you de-escalate a live conflict or rule-break between members in real time?",
      "Which bots and tools have you configured (MEE6, Dyno, Carl-bot, custom)? Describe a setup you built.",
      "How would you structure channels and roles for a Roblox dev studio to keep it organized?",
      "How many hours per day can you actively monitor the server, and across which timezones?",
    ],
  },
  {
    id: "content-creator",
    name: "Content Creators",
    icon: "✍️",
    filled: 1,
    total: 2,
    blurb: "Shape how the world sees our games.",
    skills: ["Strategy", "Social", "Copy"],
    questions: [
      "What type of content do you create (short-form, long-form, graphics, written), and for which platforms?",
      "Share links to your best-performing content along with its reach and engagement metrics.",
      "How would you build hype and a content calendar around a Roblox game launch?",
      "Which tools do you use for creation and scheduling?",
      "How do you measure whether a piece of content succeeded?",
    ],
  },
  {
    id: "video-maker",
    name: "Video Makers",
    icon: "🎬",
    filled: 0,
    total: 2,
    blurb: "Turn our gameplay into scroll-stopping trailers.",
    skills: ["Editing", "Motion", "Trailers"],
    questions: [
      "Which editing software do you use (Premiere, After Effects, DaVinci, CapCut) and at what level?",
      "Share 2–3 videos you edited and describe your exact contribution to each.",
      "What is your typical turnaround time for a 60-second promotional trailer edit?",
      "How do you approach editing a Roblox game trailer to maximize plays and retention?",
      "Can you produce both short-form (TikTok/Shorts) and long-form (YouTube) edits?",
    ],
  },
  {
    id: "scripter",
    name: "Scripters",
    icon: "💻",
    filled: 10,
    total: 18,
    blurb: "Engineer deep, secure, optimized game systems in Luau.",
    skills: ["Luau", "Systems", "Optimization"],
    questions: [
      "How many years have you scripted in Luau, and what systems have you built (datastores, combat, economy, etc.)?",
      "Describe how you optimize a game running at low FPS or high server memory.",
      "How do you structure code for a team (ModuleScripts, OOP, frameworks like Knit/ProfileService)?",
      "Share a game, GitHub, or portfolio where we can see your scripting.",
      "Walk us through how you would secure a RemoteEvent against exploiters.",
    ],
  },
  {
    id: "bug-fixer",
    name: "Bug Fixers",
    icon: "🐛",
    filled: 1,
    total: 6,
    blurb: "Hunt down the hard-to-reproduce and keep builds stable.",
    skills: ["Debugging", "QA", "Luau"],
    questions: [
      "Describe your debugging workflow when a bug cannot be reproduced consistently.",
      "What tools do you use to profile and diagnose performance issues in Roblox Studio?",
      "Give an example of a hard bug you fixed and how you found the root cause.",
      "How do you document and report bugs so scripters can act on them quickly?",
      "How comfortable are you reading and navigating someone else's Luau codebase?",
    ],
  },
  {
    id: "builder",
    name: "Builders",
    icon: "🧱",
    filled: 16,
    total: 18,
    blurb: "Craft optimized, atmospheric worlds players remember.",
    skills: ["Studio", "Level Design", "Optimization"],
    questions: [
      "What build styles are you strongest in (realistic, low-poly, stylized, sci-fi)?",
      "Share a portfolio of maps or builds you have made in Studio.",
      "How do you optimize builds for performance (part count, streaming, unions vs meshes)?",
      "Do you build to grid or modular standards for team collaboration?",
      "How long would a medium-detail lobby (~50×50 studs) take you?",
    ],
  },
  {
    id: "modeler",
    name: "Modelers",
    icon: "🧊",
    filled: 6,
    total: 12,
    blurb: "Model clean, game-ready assets that ship.",
    skills: ["Blender", "3D", "PBR"],
    questions: [
      "Which 3D software do you use (Blender, Maya, 3ds Max) and for how long?",
      "Share your modeling portfolio (props, characters, environment assets).",
      "What is your typical poly-count discipline for real-time Roblox assets?",
      "Do you handle UV unwrapping, texturing, and PBR maps yourself?",
      "How do you keep triangle counts and file sizes optimized for mobile?",
    ],
  },
  {
    id: "vfx",
    name: "VFX",
    icon: "✨",
    filled: 5,
    total: 6,
    blurb: "Make abilities and moments feel spectacular.",
    skills: ["Particles", "Shaders", "Beams"],
    questions: [
      "What VFX have you made in Roblox (particles, beams, trails, shaders)? Share examples.",
      "How do you balance visual impact against performance cost?",
      "Do you create your own textures and flipbooks or use packs?",
      "Describe a complex effect (e.g., an ability or spell) and how you built it.",
      "What references or art styles inspire your effects?",
    ],
  },
  {
    id: "gfx",
    name: "GFX",
    icon: "🎨",
    filled: 3,
    total: 6,
    blurb: "Design thumbnails and branding that win the front page.",
    skills: ["Photoshop", "Renders", "Branding"],
    questions: [
      "Which tools do you use (Photoshop, Blender for renders, Illustrator, Figma)?",
      "Share your best game thumbnails, icons, and logos, with click-through rates if known.",
      "How do you design a thumbnail that maximizes click-through on the Roblox front page?",
      "Can you match and maintain a consistent brand style guide?",
      "What is your turnaround for a polished thumbnail?",
    ],
  },
  {
    id: "ui-ux",
    name: "UI/UX",
    icon: "📱",
    filled: 5,
    total: 12,
    blurb: "Design interfaces that feel effortless on every device.",
    skills: ["UI", "UX", "Figma"],
    questions: [
      "Share UI/UX work you have designed and, ideally, implemented in Roblox.",
      "How do you design UI that scales across PC, mobile, and console?",
      "Walk through your process from wireframe to final in-game UI.",
      "How do you approach usability and player onboarding flows?",
      "Do you hand off assets to scripters, or implement the UI yourself?",
    ],
  },
  {
    id: "animator",
    name: "Animators",
    icon: "🎞️",
    filled: 5,
    total: 6,
    blurb: "Bring characters and combat to life.",
    skills: ["Moon Animator", "Rigging", "Combat"],
    questions: [
      "Which animation tools do you use (Moon Animator, Blender, built-in)?",
      "Share animations you have made (combat, emotes, cutscenes, locomotion).",
      "Do you rig custom characters, or work with R6/R15?",
      "How do you keep animations smooth while staying performant?",
      "What is your turnaround for a basic attack combo (3–4 swings)?",
    ],
  },
  {
    id: "clothing",
    name: "Clothing",
    icon: "👕",
    filled: 0,
    total: 6,
    blurb: "Dress our worlds with standout UGC and outfits.",
    skills: ["UGC", "Layered", "Design"],
    questions: [
      "What clothing or UGC have you designed? Share your catalog or portfolio.",
      "Which tools do you use (Photoshop, templates, Blender for layered/3D clothing)?",
      "Are you familiar with Roblox's current layered clothing / UGC pipeline?",
      "Can you match a studio's art direction across a full outfit set?",
      "What is your turnaround for a complete outfit?",
    ],
  },
  {
    id: "sfx",
    name: "SFX",
    icon: "🔊",
    filled: 1,
    total: 6,
    blurb: "Give every action weight with sound.",
    skills: ["Sound Design", "DAW", "Mixing"],
    questions: [
      "What sound design have you done (UI sounds, ability SFX, ambience, music)?",
      "Which DAW or tools do you use (FL Studio, Ableton, Audacity)?",
      "Share a portfolio or reel of your sound work.",
      "How do you source or create royalty-free / original audio to avoid copyright issues?",
      "How do you implement and mix audio for game feel?",
    ],
  },
  {
    id: "investor",
    name: "Investors",
    icon: "💼",
    filled: 1,
    total: 15,
    blurb: "Back an ambitious studio and share the upside.",
    skills: ["Capital", "Growth", "Network"],
    isInvestor: true,
    questions: [
      "What is your intended investment range and preferred structure (revenue-share %, milestone-based)?",
      "What is your background — are you an active or passive investor, and in what sectors?",
      "What return and timeline expectations do you have?",
      "Beyond capital, what can you contribute (network, marketing, publishing contacts)?",
      "What due-diligence materials would you need before committing?",
    ],
  },
  {
    id: "web-dev",
    name: "Web Dev",
    icon: "🌐",
    filled: 2,
    total: 2,
    blurb: "Build the studio's web presence and tools.",
    skills: ["Frontend", "Backend", "APIs"],
    questions: [
      "What is your stack (front-end frameworks, back-end, databases)?",
      "Share sites or apps you have built (live links or repositories).",
      "Have you integrated APIs, auth, and databases in production?",
      "Any Roblox-adjacent web work (Open Cloud API, verification portals, leaderboards)?",
      "What is your availability? This role is currently full — join the waitlist?",
    ],
  },
];

/* Age ranges — drives the age-gate (guardian consent for under 18)
   and the "under 28 exam marksheet" verification logic. */
const AGE_RANGES = [
  { value: "under-16", label: "Under 16", minor: true, under28: true },
  { value: "16-17", label: "16–17", minor: true, under28: true },
  { value: "18-20", label: "18–20", minor: false, under28: true },
  { value: "21-24", label: "21–24", minor: false, under28: true },
  { value: "25-27", label: "25–27", minor: false, under28: true },
  { value: "28-plus", label: "28 or older", minor: false, under28: false },
];

const DOCUMENT_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "national-id", label: "National ID card" },
  { value: "driving-license", label: "Driving license" },
  { value: "pan-card", label: "PAN card" },
  { value: "exam-marksheet", label: "Exam marksheet (applicants under 28)" },
];

const roleById = (id) => ROLES.find((r) => r.id === id);
const isRoleFull = (r) => r.filled >= r.total;
