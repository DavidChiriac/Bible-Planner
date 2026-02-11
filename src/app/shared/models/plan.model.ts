export interface IPlan {
    week: number;
    label: string;
    days: {
        label: string;
        chapters: string[];
    }[];
}
