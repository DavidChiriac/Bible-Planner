export type NoteTag = 'rugăciune' | 'promisiune' | 'întrebare' | 'insight' | 'important';

export const NOTE_TAGS: { label: string; value: NoteTag; icon: string; color: string }[] = [
  { label: 'Rugăciune', value: 'rugăciune', icon: 'pi pi-heart', color: '#A46447' },
  { label: 'Promisiune', value: 'promisiune', icon: 'pi pi-star', color: '#88937B' },
  { label: 'Întrebare', value: 'întrebare', icon: 'pi pi-question-circle', color: '#C3B59E' },
  { label: 'Insight', value: 'insight', icon: 'pi pi-lightbulb', color: '#6B5A45' },
  { label: 'Important', value: 'important', icon: 'pi pi-exclamation-triangle', color: '#4C362D' },
];

export interface NoteItem {
  key: string;
  text: string;
  createdDate: string;

  book: string;
  chapter: number;
  chapterLabel: string;

  tags?: NoteTag[];
}
