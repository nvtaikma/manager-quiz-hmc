"use client";

import React from "react";
import { FileText } from "lucide-react";

interface FileUploaderProps {
  onFileChange: (files: FileList) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileChange }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileChange(event.target.files);
    }
  };

  return (
    <div className="upload-section border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-all duration-300 hover:border-blue-500 hover:bg-gray-50">
      <input
        type="file"
        id="pdf-upload"
        className="hidden"
        accept="application/pdf"
        multiple
        onChange={handleFileUpload}
      />
      <label htmlFor="pdf-upload" className="cursor-pointer">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-lg font-medium text-blue-600">
          Nhấn để chọn tệp PDF
        </p>
        <p id="file-name" className="mt-1 text-sm text-gray-500">
          Chưa có tệp nào được chọn
        </p>
      </label>
    </div>
  );
};

export default FileUploader;
