// Notes (Vault) Types
export type NoteCategory =
  | "reference"
  | "idea"
  | "guide"
  | "journal"
  | "finance"
  | "health"
  | "work"
  | "personal"
  | "archive"
  | "other";

export interface Note {
  id: string;
  owner_id: string;
  title: string;
  content_md: string | null;
  tags: string[];
  category: NoteCategory;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export type NoteInsert = Omit<Note, "id" | "owner_id" | "created_at" | "updated_at"> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type NoteUpdate = Partial<Omit<Note, "id" | "owner_id" | "created_at">>;
