"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

interface QuestionEditorProps {
  question: string;
  index: number;
  onQuestionChange: (index: number, newValue: string) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  onQuestionChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState<string>("");
  const [debouncedValue, setDebouncedValue] = useState<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Chỉ chuẩn hóa câu hỏi một lần khi component được tạo hoặc question thay đổi từ bên ngoài
  useEffect(() => {
    // Chuẩn hóa câu hỏi
    let normalizedQuestion = question.replace(/#{2,}/g, "#");
    normalizedQuestion = normalizedQuestion.replace(/(\S)#(\S)/g, "$1 # $2");
    normalizedQuestion = normalizedQuestion.replace(/(\S)#(\s)/g, "$1 # $2");
    normalizedQuestion = normalizedQuestion.replace(/(\s)#(\S)/g, "$1 # $2");
    setValue(normalizedQuestion);
    setDebouncedValue(normalizedQuestion);
  }, [question]);

  // Điều chỉnh chiều cao của textarea theo nội dung
  useEffect(() => {
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    adjustHeight();
  }, [value]);

  // Xử lý debounce: chỉ cập nhật sau khi người dùng ngừng gõ trong 2 giây
  useEffect(() => {
    if (value !== debouncedValue) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setDebouncedValue(value);
        onQuestionChange(index, value);
        console.log("Cập nhật sau 2s không thay đổi");
      }, 2000); // 2 giây debounce
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, debouncedValue, index, onQuestionChange]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    const newValue = textarea.value;

    // Lưu giá trị trực tiếp mà không chuẩn hóa và không gửi lên component cha ngay lập tức
    setValue(newValue);

    // Cập nhật chiều cao
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <textarea
      ref={textareaRef}
      className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 min-h-[150px]"
      value={value}
      data-question-index={index}
      onChange={handleInput}
      style={{
        resize: "vertical",
        overflowY: "hidden",
      }}
    />
  );
};

export default QuestionEditor;
