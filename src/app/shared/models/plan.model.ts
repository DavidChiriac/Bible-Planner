export interface IPlan {
  week: number;
  label: string;
  book?: string;
  days: { chapters: string[]; label: string; }[];
}
