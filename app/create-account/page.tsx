"use client";

import Button from "@/app/components/button";
import Input from "@/app/components/input";
import SocialLogin from "@/app/components/socia-login";
import { useFormState } from "react-dom";
import { createAccount } from "./action";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";
export default function CreateAccount() {
  const [state, dispatch] = useFormState(createAccount, null);
  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl">안녕하세요 !</h1>
        <h2 className="text-xl">아래 양식을 작성하여 가입하세요!</h2>
      </div>
      <form action={dispatch} className="flex flex-col gap-3">
        <Input
          name="username"
          type="text"
          placeholder="닉네임"
          required
          errors={state?.fieldErrors.username}
          minLength={3}
          maxLength={10}
        />
        <Input
          name="email"
          type="email"
          placeholder="이메일"
          required
          errors={state?.fieldErrors.email}
        />
        <Input
          name="password"
          type="password"
          placeholder="비밀번호"
          minLength={PASSWORD_MIN_LENGTH}
          required
          errors={state?.fieldErrors.password}
        />
        <Input
          name="confirm_password"
          type="password"
          placeholder="비밀번호 확인"
          minLength={PASSWORD_MIN_LENGTH}
          required
          errors={state?.fieldErrors.confirm_password}
        />
        <Button text="계정 생성하기" />
      </form>
      <SocialLogin />
    </div>
  );
}
