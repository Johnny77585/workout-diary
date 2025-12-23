export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

// Key is date string YYYY-MM-DD
export type WorkoutLog = Record<string, Exercise[]>;

export enum AppView {
  CALENDAR = 'CALENDAR',
  EDITOR = 'EDITOR',
  STATS = 'STATS'
}