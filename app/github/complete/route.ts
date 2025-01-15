import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return new Response(null, {
      status: 400,
    });
  }
  const accessTokenParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  }).toString();
  const accessTokenURL = `https://github.com/login/oauth/access_token?${accessTokenParams}`;
  const accessTokenResponse = await fetch(accessTokenURL, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });
  const { error, access_token } = await accessTokenResponse.json();
  if (error) {
    return new Response(null, {
      status: 400,
    });
  }
  const userProfileResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: "no-cache",
  });
  const { id, avatar_url, login } = await userProfileResponse.json();
  const user = await db.user.findUnique({
    where: {
      github_id: id + "",
    },
    select: {
      id: true,
    },
  });
  if (user) {
    const session = await getSession();
    session.id = user.id;
    await session.save();
    return redirect("/profile");
  }
  const newUser = await db.user.create({
    data: {
      username: login,
      github_id: id + "",
      avatar: avatar_url,
    },
    select: {
      id: true,
    },
  });
  const session = await getSession();
  session.id = newUser.id;
  await session.save();
  return redirect("/profile");
}

// 네가지 코드 챌린지

// login, create account , github login  << 3개나 사용됌
// 이거는 함수를 만들어보자 재사용이 너무 많음. 
// const session = await getSession();
//   session.id = newUser.id;
//   await session.save();

// 우린 새 user를 만들고있는데, username이 여기있는 깃허브 유저네임과 같도록 생성중임
// 하지만 누군가 이 username을 가지고있을수 있어서, 이것을 방지하는것 
// 누군가 username을 사용하고있는지를 확인하는것 말그대로 중복방지

// 우리는 이거랑 비슷한 email 코드를 만들어보자
// user의 이메일을 가져오는것 이미 우린 scope 에 그권한이 존재함
// const userProfileResponse = await fetch("https://api.github.com/user", {
//   headers: {
//     Authorization: `Bearer ${access_token}`,
//   },
//   cache: "no-cache",
// });

// fetch request 가 많음 
// request 와 response 를 분리해보는것
// request를 보내는곳과 response를 JSON으로 바꾸는것을 
// 따로 function으로 만들어보자 

// 예시로 여기있는 이모든 코드들을
// ex:)) getAccessToken 이라는 새 function 에 넣어보는거지

// 이코드들을 개선하는 방법을 생각해보자

// 1.어디서든 재사용할 수 있는 새 function 만들기
// 2. username 중복 에러 처리
// 3. user의 email 가져오기
// 4. fetch 와 response 를 분리해보기
// 4.1 type, typeScript 추가하기