import type { CheckIn, Client, Rating } from "./types";

export const CLIENTS: Client[] = [
  {
    id: "c1",
    name: "Maya Chen",
    goal: "Add 20 lb to squat, compete local meet",
    startDate: "2025-11-03",
    notes: "Competes powerlifting. Prefers morning sessions.",
    pageBody:
      "## Current block\nPeaking for local meet — intensity week next.\n\n## Focus cues\n- Brace before every squat\n- Keep bar path vertical on bench",
  },
  {
    id: "c2",
    name: "Jordan Blake",
    goal: "Recomp — lose fat, keep strength",
    startDate: "2025-12-15",
    notes: "Travel weeks every other month.",
    pageBody:
      "## Nutrition\nProtein target 180g. Travel weeks: hotel gym + bodyweight fallback.\n\n## Strength hold\nKeep main lifts at RPE 7–8 while cutting.",
  },
  {
    id: "c3",
    name: "Sam Okonkwo",
    goal: "Return from knee injury, rebuild base",
    startDate: "2026-01-06",
    notes: "No deep knee flexion past RPE 7 yet.",
    pageBody:
      "## Rehab notes\nCleared for deeper squat next block. Still avoid bouncing out of the hole.\n\n## PT liaison\nCheck in with physio every 4 weeks.",
  },
  {
    id: "c4",
    name: "Alex Rivera",
    goal: "Hypertrophy — upper body focus",
    startDate: "2025-10-20",
    pageBody:
      "## Volume bias\nPush pull volume; squat maintained 1x/week.\n\n## Sleep\nWatch late nights — form drops when under-recovered.",
  },
  {
    id: "c5",
    name: "Taylor Kim",
    goal: "General strength + consistency",
    startDate: "2026-02-02",
    notes: "New to structured programming.",
    pageBody:
      "## Onboarding\nLearning squat/hinge cues. Aim for 3 sessions/week before adding a 4th.",
  },
];

export const SEED_LINKS = [
  {
    id: "link-m1",
    clientId: "c1",
    label: "Training sheet",
    url: "https://docs.google.com/spreadsheets/d/example-maya-program",
    sortOrder: 0,
  },
  {
    id: "link-m2",
    clientId: "c1",
    label: "Meet registration",
    url: "https://example.com/local-meet",
    sortOrder: 1,
  },
  {
    id: "link-j1",
    clientId: "c2",
    label: "Training sheet",
    url: "https://docs.google.com/spreadsheets/d/example-jordan-program",
    sortOrder: 0,
  },
  {
    id: "link-s1",
    clientId: "c3",
    label: "Rehab + training sheet",
    url: "https://docs.google.com/spreadsheets/d/example-sam-program",
    sortOrder: 0,
  },
  {
    id: "link-a1",
    clientId: "c4",
    label: "Hypertrophy block",
    url: "https://docs.google.com/spreadsheets/d/example-alex-program",
    sortOrder: 0,
  },
  {
    id: "link-t1",
    clientId: "c5",
    label: "Starter program",
    url: "https://docs.google.com/spreadsheets/d/example-taylor-program",
    sortOrder: 0,
  },
];

export const SEED_NOTES = [
  {
    id: "note-m1",
    clientId: "c1",
    title: "Session cue — squat brace",
    body: "Remind Maya to breathe into belt before unracking. Helped last intensity day.",
  },
  {
    id: "note-m2",
    clientId: "c1",
    title: "Meet timeline",
    body: "Target meet in ~10 weeks. Lock date once registration opens.",
  },
  {
    id: "note-j1",
    clientId: "c2",
    title: "Travel week protocol",
    body: "Hotel gym: goblet squat, DB press, RDLs. Keep steps high.",
  },
  {
    id: "note-s1",
    clientId: "c3",
    title: "Knee status",
    body: "No flare after belt squat. Physio happy with current range.",
  },
  {
    id: "note-a1",
    clientId: "c4",
    title: "Pull volume bump",
    body: "Add one more row variation next block. Alex asked for more back work.",
  },
  {
    id: "note-t1",
    clientId: "c5",
    title: "Form progress",
    body: "Hinge pattern cleaner. Still coaching knee tracking on squat.",
  },
];

function mondayOfWeeksAgo(weeksAgo: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday - weeksAgo * 7);
  return d.toISOString().slice(0, 10);
}

function checkIn(
  id: string,
  clientId: string,
  weeksAgo: number,
  bodyWeightLbs: number,
  energy: Rating,
  sleep: Rating,
  notes: string,
  squatEst1rm?: number
): CheckIn {
  const weekOf = mondayOfWeeksAgo(weeksAgo);
  return {
    id,
    clientId,
    weekOf,
    bodyWeightLbs,
    energy,
    sleep,
    notes,
    squatEst1rm,
    createdAt: `${weekOf}T18:00:00.000Z`,
  };
}

/** Seed check-ins: 6–8 weeks per client so charts look real. */
export const SEED_CHECK_INS: CheckIn[] = [
  // Maya — progressive squat, slight weight gain
  checkIn("ci-m1", "c1", 7, 138, 4, 4, "Solid week. Squat felt crisp.", 225),
  checkIn("ci-m2", "c1", 6, 139, 3, 3, "Travel day mid-week, energy dipped.", 230),
  checkIn("ci-m3", "c1", 5, 139, 4, 4, "Back on track. Deadlift PR attempt next block.", 235),
  checkIn("ci-m4", "c1", 4, 140, 5, 4, "Best session of the month.", 240),
  checkIn("ci-m5", "c1", 3, 140, 4, 5, "Sleep on point. Ready for intensity week.", 245),
  checkIn("ci-m6", "c1", 2, 141, 3, 3, "Slight knee twinge — kept RPE lower.", 245),
  checkIn("ci-m7", "c1", 1, 141, 4, 4, "Felt recovered. Want competition date locked.", 250),

  // Jordan — recomp, weight drifting down, strength holding
  checkIn("ci-j1", "c2", 7, 192, 3, 3, "Diet adherence ~80%. Bench holding.", 275),
  checkIn("ci-j2", "c2", 6, 190, 4, 4, "Travel week handled with hotel gym.", 275),
  checkIn("ci-j3", "c2", 5, 189, 4, 3, "Missed one session — still down 3 lb.", 280),
  checkIn("ci-j4", "c2", 4, 188, 3, 4, "Hungry on cut days. Strength ok.", 280),
  checkIn("ci-j5", "c2", 3, 187, 4, 4, "Clothes fitting better. Keep macros.", 285),
  checkIn("ci-j6", "c2", 2, 186, 5, 5, "Great week. Energy surprisingly high.", 285),
  checkIn("ci-j7", "c2", 1, 185, 4, 4, "Near goal weight. May hold for 2 weeks.", 285),

  // Sam — rehab, cautious squat numbers climbing slowly
  checkIn("ci-s1", "c3", 6, 178, 3, 4, "Knee ok after light goblet work.", 135),
  checkIn("ci-s2", "c3", 5, 177, 4, 4, "Added belt squat — no flare.", 145),
  checkIn("ci-s3", "c3", 4, 177, 4, 3, "Soreness normal. Range improving.", 155),
  checkIn("ci-s4", "c3", 3, 176, 3, 3, "Pushed too hard Tue — scaled Wed.", 155),
  checkIn("ci-s5", "c3", 2, 176, 4, 4, "Confidence returning on hinge patterns.", 165),
  checkIn("ci-s6", "c3", 1, 175, 4, 5, "Cleared for deeper squat next block.", 175),

  // Alex — hypertrophy, weight up slowly, squat secondary
  checkIn("ci-a1", "c4", 7, 165, 4, 3, "Arms responding well. Sleep short.", 205),
  checkIn("ci-a2", "c4", 6, 166, 4, 4, "Volume week felt productive.", 210),
  checkIn("ci-a3", "c4", 5, 166, 3, 2, "Poor sleep — cut accessories.", 210),
  checkIn("ci-a4", "c4", 4, 167, 5, 4, "Pump city. Want more pull volume.", 215),
  checkIn("ci-a5", "c4", 3, 168, 4, 4, "Steady. Tracking protein better.", 215),
  checkIn("ci-a6", "c4", 2, 168, 4, 5, "Deload felt good.", 210),
  checkIn("ci-a7", "c4", 1, 169, 5, 4, "Back to accumulation. Excited.", 220),

  // Taylor — newer, fewer weeks, building habit
  checkIn("ci-t1", "c5", 5, 152, 3, 3, "First structured week. Learning cues.", 135),
  checkIn("ci-t2", "c5", 4, 151, 4, 4, "Hit all 3 sessions. Form improving.", 140),
  checkIn("ci-t3", "c5", 3, 151, 3, 2, "Late nights hurt energy.", 140),
  checkIn("ci-t4", "c5", 2, 150, 4, 4, "Better sleep. Squats feel stronger.", 145),
  checkIn("ci-t5", "c5", 1, 150, 4, 3, "Want to add a 4th session soon.", 150),
];
