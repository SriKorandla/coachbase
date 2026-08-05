export type Client = {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  notes?: string;
  pageBody?: string;
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

export type ClientLink = {
  id: string;
  clientId: string;
  label: string;
  url: string;
  sortOrder: number;
  createdAt: string;
};

export type ClientLinkInput = {
  label: string;
  url: string;
  sortOrder?: number;
};

export type ClientNote = {
  id: string;
  clientId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type ClientNoteInput = {
  title: string;
  body: string;
};
