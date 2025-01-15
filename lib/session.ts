import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

interface SessionContent {
  id?: number;
  save: () => Promise<void>;
  destroy: () => Promise<void>;
}

export default async function getSession(): Promise<SessionContent> {
  return getIronSession<SessionContent>(cookies(), {
    cookieName: "delicious-carrot",
    password: process.env.COOKIE_PASSWORD!,
  });
}
