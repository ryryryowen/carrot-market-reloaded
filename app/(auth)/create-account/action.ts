"use server";
import bcrypt from "bcrypt";
import { z } from "zod";
import {
  PASSWORD_REGEX,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import { saveUserSession } from "@/lib/session";

const checkUsername = (username: string) => !username.includes("potato");

const checkPasswords = ({
  password,
  confirm_password,
}: {
  password: string;
  confirm_password: string;
}) => password === confirm_password;

const formSchema = z
  .object({
    username: z
      .string({
        invalid_type_error: "닉네임은 글자만 가능합니다.",
        required_error: "닉네임은 필수 입력 항목입니다.",
      })
      .toLowerCase()
      .trim()
      .transform((username) => `${username}`)
      .refine(checkUsername, "potato는 사용할 수 없습니다."),
    email: z.string().email().toLowerCase(),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH)
      .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirm_password: z.string().min(PASSWORD_MIN_LENGTH),
  })

  .superRefine(async ({ username }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });

    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "이미 사용중인 닉네임입니다.",
        path: ["username"],
        fatal: true,
      });
      return z.NEVER;
    }
  })
  .superRefine(async ({ email }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "이미 사용중인 이메일입니다.",
        path: ["email"],
        fatal: true,
      });
      return z.NEVER;
    }
  })

  .refine(checkPasswords, {
    message: "두 비밀번호가 동일하지 않습니다.",
    path: ["confirm_password"],
  });

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };
  const result = await formSchema.spa(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    const hashedPassword = await bcrypt.hash(result.data.password, 12);
    const user = await db.user.create({
      data: {
        username: result.data.username,
        email: result.data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
      },
    });
    // log the user in
    await saveUserSession(user.id);
    return redirect("/profile");
  }
}
