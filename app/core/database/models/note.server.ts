import { db, getResults } from "../database.server";
import type { Result } from 'surrealdb.js';
import type { User } from "./user.server";

type Note = {
  id: string;
  title: string;
  body: string;
  user: User['id'];
}

export async function getNoteById(id: string): Promise<Note> {
  const [note] = await db.select<Note>(`note:${id}`);
  return note;
}

export async function getNoteListItems({ userId }: { userId: User["id"] }) {
  const [response] = await db.query<Array<Result<Note[]>>>("SELECT * FROM type::table($table) WHERE user = $userId;", {
    table: "note",
    userId,
  });
  if (response.error) {
    console.error(response.error);
    return [];
  }
  return response.result;
}

export async function createNote({
  body,
  title,
  userId,
}: {
  body: string;
  title: string;
  userId: string;
}) {
  return db.create<Omit<Note,'id'>>("note", {
    body,
    title,
    user: userId,
  });
}

export function deleteNote(id: string) {
  if (id === "note") {
    throw new Error('Delete all notes using deleteNotes (not implemented :)');
  }
  return db.delete(`note:${id}`);
}
