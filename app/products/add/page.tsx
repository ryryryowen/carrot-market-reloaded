"use client";

import Button from "@/app/components/button";
import Input from "@/app/components/input";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { getUploadUrl, uploadProduct } from "./actions";
import { useFormState } from "react-dom";

export default function AddProduct() {
  const [preview, setPreview] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [photoId, setPhotoId] = useState("");
  const [isPhotoSelected, setIsPhotoSelected] = useState(false);

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = e;
    if (!files) return;

    const file = files[0];

    // 이미지 파일 타입 체크
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    // 파일 크기 체크 (5MB = 5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    setIsPhotoSelected(true);
    const { success, result } = await getUploadUrl();
    if (success) {
      const { id, uploadURL } = result;
      setUploadUrl(uploadURL);
      setPhotoId(id);
    }
  };
  const interceptAction = async (_: any, formData: FormData) => {
    const file = formData.get("photo");
    if (!file) {
      return;
    }
    const cloudflareForm = new FormData();
    cloudflareForm.append("file", file);
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: cloudflareForm,
    });
    if (response.status !== 200) {
      return;
    }
    const photoUrl = `https://imagedelivery.net/iTlzOVP8sPi2ihy4eEbwmA/${photoId}`;
    formData.set("photo", photoUrl);
    return uploadProduct(_, formData);
  };
  const [state, action] = useFormState(interceptAction, null);
  return (
    <div>
      <form action={action} className="p-5 flex flex-col gap-5">
        <label
          htmlFor="photo"
          className="border-2 aspect-square flex items-center justify-center flex-col gap-2 text-neutral-300 border-neutral-300 rounded-md cursor-pointer bg-cover bg-center"
          style={{
            backgroundImage: `url(${preview})`,
          }}
        >
          {preview === "" ? (
            <>
              <PhotoIcon className="w-20" />
              <div className="text-neutral-400 text-sm">
                사진을 추가해주세요.
                {state?.fieldErrors?.photo && (
                  <span className="text-red-500 ml-1">
                    {state.fieldErrors.photo}
                  </span>
                )}
              </div>
            </>
          ) : null}
        </label>
        <input
          onChange={onImageChange}
          type="file"
          id="photo"
          name="photo"
          accept="image/*"
          className="hidden"
        />
        <Input
          name="title"
          required
          placeholder="상품 제목을 입력해주세요"
          type="text"
          errors={state?.fieldErrors.title}
        />
        <Input
          name="price"
          required
          placeholder="상품 가격을 입력해주세요"
          type="number"
          errors={state?.fieldErrors.price}
        />
        <Input
          name="description"
          required
          placeholder="상품 설명을 입력해주세요"
          type="text"
          errors={state?.fieldErrors.description}
        />
        <Button text="상품 등록" disabled={!isPhotoSelected} />
        {!isPhotoSelected && (
          <p className="text-red-500 text-center text-sm">
            상품 등록을 위해서는 사진 등록이 필수입니다.
          </p>
        )}
      </form>
    </div>
  );
}

// 여기서 유저가 다른 것 말고 이미지를 업로드했는지 확인.
//  const {
//   target: { files },
// } = e;
// if (!files) {
//   return;
// }
// const file = files[0];
// const url = URL.createObjectURL(file);
// setPreview(url);

// 이미지 사이즈 체크 최대 이미지 5mb 이하
