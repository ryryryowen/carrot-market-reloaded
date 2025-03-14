import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidateTag, revalidatePath } from "next/cache";

async function getProduct(id: number) {
  const session = await getSession();
  if (!session.id) {
    return redirect("/login");
  }

  const product = await db.product.findUnique({
    where: {
      id,
      userId: session.id, // 본인 상품만 수정 가능
    },
  });

  if (!product) {
    return redirect("/products");
  }

  return product;
}

export default async function EditProduct({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(Number(params.id));

  const updateProduct = async (formData: FormData) => {
    "use server";

    const session = await getSession();
    if (!session.id) {
      return redirect("/login");
    }

    const title = formData.get("title") as string;
    const price = Number(formData.get("price"));
    const description = formData.get("description") as string;

    await db.product.update({
      where: {
        id: product.id,
        userId: session.id,
      },
      data: {
        title,
        price,
        description,
      },
    });

    // 캐시 무효화
    revalidatePath("/home");
    revalidatePath(`/products/${product.id}`);
    revalidateTag("product");
    revalidateTag("product-detail");
    revalidateTag("product-title");

    // 홈페이지로 리다이렉트 변경
    redirect("/");
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-5">상품 수정</h1>
      <form action={updateProduct} className="flex flex-col gap-5">
        <div>
          <label htmlFor="title" className="block mb-2">
            제목
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={product.title}
            className="w-full p-2 border rounded bg-neutral-800 border-neutral-700"
          />
        </div>

        <div>
          <label htmlFor="price" className="block mb-2">
            가격
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            defaultValue={product.price}
            className="w-full p-2 border rounded bg-neutral-800 border-neutral-700"
          />
        </div>

        <div>
          <label htmlFor="description" className="block mb-2">
            설명
          </label>
          <textarea
            id="description"
            name="description"
            required
            defaultValue={product.description || ""}
            className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 h-32"
          />
        </div>

        <button
          type="submit"
          className="bg-orange-500 text-white py-2.5 px-5 rounded hover:bg-orange-600 transition-colors"
        >
          수정하기
        </button>
      </form>
    </div>
  );
}
