export type UserRole = 'child' | 'parent' | 'educator';

export type LearningTier = 'beginner' | 'emerging' | 'expanding' | 'independent';

export type CalmPalette = 'gentle-sage' | 'soft-sky' | 'warm-sand' | 'muted-lavender';

export type FontSizeScale = 'normal' | 'large' | 'extra-large';

export interface SensoryPreferences {
  soundVolumePercent: number; // 0 - 100
  soundEffectsEnabled: boolean;
  voiceGuidanceEnabled: boolean;
  voiceSpeed: number; // 0.7 - 1.2
  highContrastMode: boolean;
  reducedMotion: boolean;
  calmPalette: CalmPalette;
  fontSizeScale: FontSizeScale;
  allowTimerDisplays: boolean;
}

export interface ChildProfile {
  id: string;
  name: string;
  displayName: string;
  avatarKey: 'fox' | 'owl' | 'koala' | 'bear' | 'cat' | 'turtle';
  ageYears: number;
  primaryLanguage: string;
  learningTier: LearningTier;
  currentStreakDays: number;
  notes?: string;
  sensoryPreferences: SensoryPreferences;
}

export interface ActivityDefinition {
  id: string;
  title: string;
  category: 'socio-emotional' | 'daily-living' | 'cognitive-sensory' | 'regulation';
  description: string;
  difficultyLevel: 1 | 2 | 3;
  iconName: string;
  gameEngine: 'react' | 'phaser' | 'canvas';
  estimatedMinutes: number;
}

export interface SessionRecord {
  id: string;
  childId: string;
  activityId: string;
  activityTitle: string;
  timestamp: string;
  durationSeconds: number;
  completed: boolean;
  promptsNeeded: number;
  accuracyRate: number; // 0 - 1
  sensoryFatigueFlag: boolean;
  childMood: 'calm' | 'happy' | 'tired' | 'overwhelmed' | 'focused';
}

export interface IEPRecord {
  id: string;
  childId: string;
  educatorId: string;
  studentName: string;
  iepGoal: string;
  progressPercent: number;
  supportTier: string;
  lastSessionDate: string;
  accommodations: string[];
}

export interface LearningInsight {
  id: string;
  childId: string;
  headline: string;
  summary: string;
  suggestedAction: string;
  sensoryAdjustmentAdvice: string;
  dateGenerated: string;
  confidenceScore: number;
}

export interface RoutineTask {
  id: string;
  label: string;
  icon: string;
  completed: boolean;
  timeEstimate: string;
}
