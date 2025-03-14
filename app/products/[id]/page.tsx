import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToWon } from "@/lib/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

async function getIsOwner(userId: number) {
  const session = await getSession();
  if (session.id) {
    return session.id === userId;
  }
  return false;
}

async function getProduct(id: number) {
  const product = await db.product.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
    },
  });
  return product;
}

// deleteProduct server action 추가
const deleteProduct = async (id: number) => {
  "use server";

  const session = await getSession();
  if (!session.id) {
    return redirect("/login");
  }

  await db.product.delete({
    where: {
      id,
      userId: session.id,
    },
  });

  redirect("/products");
};

export default async function ProductDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const product = await getProduct(id);
  if (!product) {
    return notFound();
  }
  const isOwner = await getIsOwner(product.userId);
  return (
    <div>
      <div className="fixed top-0 left-0 p-5 z-10">
        <Link
          href="/"
          className="inline-block bg-neutral-800 px-4 py-2 rounded-md hover:bg-neutral-700 transition-colors"
        >
          ← 홈으로
        </Link>
      </div>
      <div className="relative aspect-square">
        <Image
          fill
          src={`${product.photo}/width=500,height=500`}
          alt={product.title}
          className="object-cover"
        />
      </div>
      <div className="p-5 flex items-center gap-3 border-b border-neutral-700">
        <div className="size-10 overflow-hidden rounded-full">
          {product.user.avatar !== null ? (
            <Image
              src={product.user.avatar}
              width={40}
              height={40}
              alt={product.user.username}
            />
          ) : (
            <UserIcon />
          )}
        </div>
        <div>
          <h3>{product.user.username}</h3>
        </div>
      </div>
      <div className="p-5">
        <h1 className="text-2xl font-semibold">{product.title}</h1>
        <p>{product.description}</p>
      </div>
      <div className="fixed w-full bottom-0 left-0 p-5 pb-10 bg-neutral-800 flex justify-between items-center">
        <span className="font-semibold text-xl">
          {formatToWon(product.price)}원
        </span>
        {isOwner && (
          <div className="flex gap-2">
            <Link
              href={`/products/${id}/edit`}
              className="bg-orange-500 px-5 py-2.5 rounded-md text-white font-semibold hover:bg-orange-600 transition-colors"
            >
              수정하기
            </Link>
            <form action={deleteProduct.bind(null, id)}>
              <button className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold hover:bg-red-600 transition-colors"></button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// NextJS의 Image는 이미지를 자동으로 최적화를 해 주어 성능을 향상시키고 빠른 로딩이 되도록 해 준다.
// 하지만 외부 호스트의 이미지(다른 사이트의 이미지 링크 등)를 불러올 때는 보안 상의 이유로 이 기능이 허용되지 않는다.
// 따라서 next.config.mjs에서 hostname들을 등록해 주어야 한다.
// (nextConfig > images > remotePatterns > hostname)
