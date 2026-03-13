"use client";

import React from "react";
import { FileText, ClipboardPaste } from "lucide-react";

type InputMethod = "pdf" | "text";

interface InputMethodSelectorProps {
  value: InputMethod;
  onChange: (method: InputMethod) => void;
  disabled?: boolean;
}

const InputMethodSelector: React.FC<InputMethodSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const methods: {
    id: InputMethod;
    icon: React.ReactNode;
    title: string;
    description: string;
  }[] = [
    {
      id: "pdf",
      icon: <FileText className="h-8 w-8" />,
      title: "Upload PDF",
      description: "Tải lên file PDF đề thi để trích xuất câu hỏi tự động",
    },
    {
      id: "text",
      icon: <ClipboardPaste className="h-8 w-8" />,
      title: "Paste Text",
      description: "Dán trực tiếp nội dung câu hỏi từ clipboard",
    },
  ];

  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-gray-600 mb-3 text-center">
        Chọn cách nhập câu hỏi:
      </p>
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        {methods.map((method) => {
          const isActive = value === method.id;
          return (
            <button
              key={method.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(method.id)}
              className={`
                relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 
                transition-all duration-200 text-center
                ${
                  isActive
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md shadow-blue-100"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full" />
              )}

              <span className={isActive ? "text-blue-600" : "text-gray-400"}>
                {method.icon}
              </span>
              <span className="font-semibold text-sm">{method.title}</span>
              <span
                className={`text-xs leading-tight ${
                  isActive ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {method.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InputMethodSelector;
export type { InputMethod };
