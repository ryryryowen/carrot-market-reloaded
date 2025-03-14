// GitHub API 관련 함수들을 모아두는 파일

interface GithubUser {
  id: number;
  login: string;
  avatar_url: string;
  email: string;
}

interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

export async function getGithubAccessToken(code: string): Promise<string> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

export async function getGithubUserData(
  accessToken: string
): Promise<GithubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("GitHub API 요청 실패");
  }

  const userData = await response.json();

  const emailResponse = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!emailResponse.ok) {
    throw new Error("GitHub 이메일 정보 가져오기 실패");
  }

  const emails: GithubEmail[] = await emailResponse.json();
  const primaryEmail =
    emails.find((email) => email.primary)?.email || userData.email;

  return {
    id: userData.id,
    login: userData.login,
    avatar_url: userData.avatar_url,
    email: primaryEmail,
  };
}
