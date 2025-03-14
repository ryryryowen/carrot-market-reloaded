"use client";

import { useFormStatus } from "react-dom";

interface ButtonProps {
  text: string;
  disabled?: boolean;
}

export default function Button({ text, disabled }: ButtonProps) {
  // useFormStatus 이 hook 은 form의 자식요소에서 사용해야함
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending || disabled}
      className={`
        w-full 
        bg-orange-500 
        hover:bg-orange-600 
        text-white 
        py-2.5 
        rounded-md
        font-medium
        disabled:bg-neutral-400
        transition-colors
      `}
    >
      {pending ? "로딩 중..." : text}
    </button>
  );
}
