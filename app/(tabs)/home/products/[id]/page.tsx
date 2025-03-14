import db from "@/lib/db";
import { UserIcon } from "@heroicons/react/24/solid";
import CloseButton from "@/app/components/CloseButton";

async function getProduct(id: number) {
  const product = await db.product.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
  });
  return product;
}

export default async function Page({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const product = !isNaN(id) ? await getProduct(id) : null;

  return (
    <div className="absolute w-full h-full z-50 flex justify-center items-center bg-black bg-opacity-60 left-0 top-0">
      <CloseButton />
      <div className="max-w-screen-sm h-1/2 flex justify-center w-full">
        {product ? (
          <div className="aspect-square bg-neutral-700 text-neutral-200 rounded-md p-4">
            <div className="relative w-full h-2/3 mb-4">
              <img
                src={`${product.photo}/width=500,height=500`}
                alt={product.title}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                {product.user.avatar ? (
                  <img
                    src={product.user.avatar}
                    alt={product.user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-600 flex items-center justify-center">
                    <UserIcon className="w-6 h-6" />
                  </div>
                )}
              </div>
              <span className="text-sm">{product.user.username}</span>
            </div>
            <h2 className="text-xl font-bold mb-2">{product.title}</h2>
            <p className="text-sm text-neutral-300">{product.description}</p>
            <p className="text-lg font-bold mt-2">
              {product.price.toLocaleString()}원
            </p>
          </div>
        ) : (
          <div className="aspect-square bg-neutral-700 text-neutral-200 rounded-md flex items-center justify-center">
            <p>상품을 찾을 수 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
