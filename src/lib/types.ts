export type Client = {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  notes?: string;
};

export type Rating = 1 | 2 | 3 | 4 | 5;

export type CheckIn = {
  id: string;
  clientId: string;
  weekOf: string;
  bodyWeightLbs: number;
  energy: Rating;
  sleep: Rating;
  notes: string;
  squatEst1rm?: number;
  createdAt: string;
};

export type CheckInInput = Omit<CheckIn, "id" | "createdAt">;
