export type ActivityId = 
  | 'object-matching'
  | 'memory-cards'
  | 'shape-sorting'
  | 'story-sequencing'
  | 'emotion-explorer'
  | 'find-difference'
  | 'what-comes-next'
  | 'routine-builder'
  | 'sound-match'
  | 'communication-choice'
  | 'everyday-objects'
  | 'safe-unsafe';

export type ActivityCategory = 
  | 'cognitive'
  | 'socio-emotional'
  | 'daily-living'
  | 'communication';

export type DifficultyLevel = 1 | 2 | 3;

export interface ActivityMeta {
  id: ActivityId;
  title: string;
  category: ActivityCategory;
  objective: string;
  shortDesc: string;
  icon: string; // lucide icon name
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    badge: string;
  };
  engine: 'react' | 'phaser' | 'canvas';
  estimatedMinutes: number;
}

export interface ActivityResultData {
  activityId: ActivityId;
  childId: string;
  difficulty: DifficultyLevel;
  durationSeconds: number;
  attempts: number;
  errors: number;
  score: number; // e.g. 100 max
  accuracyRate: number; // 0.0 - 1.0
  completed: boolean;
  timestamp: string;
}
