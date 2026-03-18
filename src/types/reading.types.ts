// Reading Tracker Types
export type BookStatus = "planned" | "reading" | "finished" | "on_hold" | "dropped";
export type BookFormat = "physical" | "ebook" | "audiobook";

export interface Book {
  id: string;
  owner_id: string;
  title: string;
  author: string | null;
  status: BookStatus;
  started_at: string | null;
  finished_at: string | null;
  rating: number | null;
  current_page: number | null;
  total_pages: number | null;
  format: BookFormat | null;
  notes: string | null;
  highlights: Array<{ location: string; text: string; created_at: string }> | null;
  created_at: string;
  updated_at: string;
}

export interface ReadingLog {
  id: string;
  owner_id: string;
  book_id: string;
  log_date: string;
  pages: number | null;
  minutes: number | null;
  note: string | null;
  created_at: string;
}

export type BookInsert = Omit<Book, "id" | "created_at" | "updated_at">;
export type BookUpdate = Partial<Omit<Book, "id" | "owner_id" | "created_at">>;

export type ReadingLogInsert = Omit<ReadingLog, "id" | "owner_id" | "created_at"> & {
  owner_id?: string;
};
export type ReadingLogUpdate = Partial<Omit<ReadingLog, "id" | "owner_id" | "created_at">>;

export interface Highlight {
  location: string;
  text: string;
  created_at: string;
}
