import db from "@/lib/db";
import { getGithubAccessToken, getGithubUserData } from "@/lib/github";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { saveUserSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("Code not found", { status: 400 });
  }

  const accessToken = await getGithubAccessToken(code);
  const githubUser = await getGithubUserData(accessToken);

  const existingUser = await db.user.findFirst({
    where: {
      username: githubUser.login,
    },
  });

  const username = existingUser
    ? `${githubUser.login}_Github`
    : githubUser.login;

  const user = await db.user.findUnique({
    where: {
      github_id: githubUser.id + "",
    },
    select: {
      id: true,
    },
  });

  if (user) {
    await saveUserSession(user.id);
    return redirect("/profile");
  }

  const newUser = await db.user.create({
    data: {
      username,
      github_id: githubUser.id + "",
      avatar: githubUser.avatar_url,
      email: githubUser.email,
    },
    select: {
      id: true,
    },
  });

  await saveUserSession(newUser.id);
  return redirect("/profile");
}
