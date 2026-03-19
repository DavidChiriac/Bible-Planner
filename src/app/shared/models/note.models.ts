export type NoteTag = 'rugăciune' | 'promisiune' | 'întrebare' | 'insight' | 'important' | 'profetie' | 'aplicare' | 'mulțumire';

export const NOTE_TAGS: { label: string; value: NoteTag; icon: string; color: string }[] = [
  { label: 'Rugăciune', value: 'rugăciune', icon: 'pi pi-heart', color: '#A46447' },
  { label: 'Promisiune', value: 'promisiune', icon: 'pi pi-star', color: '#88937B' },
  { label: 'Întrebare', value: 'întrebare', icon: 'pi pi-question-circle', color: '#B8860B' },
  { label: 'Insight', value: 'insight', icon: 'pi pi-lightbulb', color: '#6B5A45' },
  { label: 'Important', value: 'important', icon: 'pi pi-exclamation-triangle', color: '#4C362D' },
  { label: 'Profeție', value: 'profetie', icon: 'pi pi-eye', color: '#5B6E8A' },
  { label: 'Aplicare', value: 'aplicare', icon: 'pi pi-check-circle', color: '#7A8B6F' },
  { label: 'Mulțumire', value: 'mulțumire', icon: 'pi pi-sun', color: '#C4924A' },
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
