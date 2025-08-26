// Sample data used by supervisor tools to simulate a real student profile

export const studentProfile = {
  id: "stu_12345",
  name: "Aisha Khan",
  email: "aisha.khan@example.com",
  level: "B1", // CEFR
  timezone: "America/Los_Angeles",
  preferences: {
    targetAccent: "American",
    dailyMinutesTarget: 15,
    focusAreas: ["past simple", "pronunciation"],
  },
  streak: {
    current: 12,
    longest: 21,
    lastStudyAt: "2025-08-20T18:30:00.000Z",
  },
  goals: [
    { id: "goal_1", title: "Speak 5 minutes daily", progress: 0.7 },
    { id: "goal_2", title: "Master past simple", progress: 0.4 },
    { id: "goal_3", title: "Add 50 new words this month", progress: 0.5 },
  ],
  achievements: [
    { id: "achv_1", name: "7-Day Streak", earnedAt: "2025-08-15" },
    { id: "achv_2", name: "First Quiz", earnedAt: "2025-08-02" },
  ],
} as const;

export const lessonHistory = [
  {
    id: "lesson_1001",
    date: "2025-08-20",
    topic: "Daily routine",
    type: "conversation",
    durationMinutes: 12,
    notes: "Practiced present simple; minor third-person -s errors",
  },
  {
    id: "lesson_1000",
    date: "2025-08-19",
    topic: "Past weekend",
    type: "roleplay",
    durationMinutes: 10,
    notes: "Corrected 'buyed' -> 'bought'",
  },
  {
    id: "lesson_0999",
    date: "2025-08-18",
    topic: "Travel planning",
    type: "conversation",
    durationMinutes: 15,
    notes: "Question forms: where/when/how",
  },
  {
    id: "lesson_0998",
    date: "2025-08-17",
    topic: "Ordering food",
    type: "roleplay",
    durationMinutes: 14,
    notes: "Polite requests: I'd like / Could I have",
  },
  {
    id: "lesson_0997",
    date: "2025-08-16",
    topic: "Pronunciation /ɪ/ vs /iː/",
    type: "drill",
    durationMinutes: 9,
    notes: "Minimal pairs: ship/sheep",
  },
] as const;

export const quizHistory = [
  {
    id: "quiz_501",
    date: "2025-08-19",
    level: "B1",
    topic: "Past simple",
    scorePercent: 80,
    items: 5,
  },
  {
    id: "quiz_500",
    date: "2025-08-12",
    level: "A2",
    topic: "Food and drink vocab",
    scorePercent: 92,
    items: 6,
  },
] as const;

export const progressSummary = {
  totalMinutesThisWeek: 60,
  totalMinutesThisMonth: 220,
  wordsLearnedThisMonth: 28,
  grammarFocusCounts: {
    pastSimple: 3,
    presentSimple: 1,
    questionForms: 2,
  },
  nextReviewDue: "2025-08-21",
} as const;