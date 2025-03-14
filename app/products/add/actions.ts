"use server";

import { z } from "zod";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";

const productSchema = z.object({
  photo: z.string({
    required_error: "상품사진은 필수입니다",
  }),
  title: z
    .string({
      required_error: "상품제목은 필수입니다",
    })
    .min(1, {
      message: "상품제목은 최소 1글자 이상이어야 합니다",
    })
    .refine((val) => val.trim().length > 0, {
      message: "공백만으로는 상품제목을 등록할 수 없습니다",
    }),
  description: z
    .string({
      required_error: "상품설명은 필수입니다",
    })
    .min(1, {
      message: "상품설명은 최소 1글자 이상이어야 합니다",
    })
    .refine((val) => val.trim().length > 0, {
      message: "공백만으로는 상품설명을 등록할 수 없습니다",
    }),
  price: z.coerce.number({
    required_error: "가격은 필수입니다",
  }),
});

export async function uploadProduct(_: any, formData: FormData) {
  const data = {
    title: formData.get("title"),
    photo: formData.get("photo"),
    price: formData.get("price"),
    description: formData.get("description"),
  };
  const results = productSchema.safeParse(data);
  if (!results.success) {
    return results.error.flatten();
  } else {
    const session = await getSession();
    if (session.id) {
      const product = await db.product.create({
        data: {
          title: results.data.title,
          description: results.data.description,
          price: results.data.price,
          photo: results.data.photo,
          user: {
            connect: {
              id: session.id,
            },
          },
        },
        select: {
          id: true,
        },
      });
      redirect(`/products/${product.id}`);
    }
  }
}

// 클라우드플레이어 이미지 업로드 요청
export async function getUploadUrl() {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
    }
  );
  const data = await response.json();
  return data;
}
