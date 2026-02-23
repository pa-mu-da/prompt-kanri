export type Category = 'style' | 'subject';

export interface PromptVersion {
  id: string;
  name: string;
  prompt: string;
}

export interface PromptItem {
  id: string;
  category: Category;
  title: string;
  tags: string[];
  thumbnail: string; // base64 or blob URL
  versions: PromptVersion[];
  createdAt: number;
}

export interface AppSettings {
  autoInsertPosition: 'start' | 'end';
  theme: 'light' | 'dark';
}

export interface AppState {
  variable: string;
  items: PromptItem[];
  settings: AppSettings;
}
