"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CloseButton() {
  const router = useRouter();

  useEffect(() => {
    // 스크롤 방지
    document.body.style.overflow = "hidden";

    // ESC 키 이벤트 핸들러
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.back();
      }
    };
    window.addEventListener("keydown", handleEsc);

    // 클린업
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [router]);

  const onCloseClick = () => {
    router.back();
  };

  return (
    <button onClick={onCloseClick} className="absolute right-5 top-5">
      <XMarkIcon className="size-10" />
    </button>
  );
}
