"use client";

import React, { useState } from "react";
import { FileText, CheckCircle, X } from "lucide-react";

interface FileUploaderProps {
  onFileChange: (files: FileList | null) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileChange }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFiles(Array.from(event.target.files));
      onFileChange(event.target.files);
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    onFileChange(null);
    // Reset input
    const input = document.getElementById("pdf-upload") as HTMLInputElement;
    if (input) input.value = "";
  };

  const hasFiles = selectedFiles.length > 0;

  return (
    <div
      className={`upload-section border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
        hasFiles
          ? "border-green-400 bg-green-50"
          : "border-gray-300 hover:border-blue-500 hover:bg-gray-50"
      }`}
    >
      <input
        type="file"
        id="pdf-upload"
        className="hidden"
        accept="application/pdf"
        multiple
        onChange={handleFileUpload}
      />

      {!hasFiles ? (
        /* Chưa chọn file */
        <label htmlFor="pdf-upload" className="cursor-pointer">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-lg font-medium text-blue-600">
            Nhấn để chọn tệp PDF
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Chưa có tệp nào được chọn
          </p>
        </label>
      ) : (
        /* Đã chọn file - hiển thị danh sách */
        <div>
          <CheckCircle className="mx-auto h-10 w-10 text-green-500 mb-2" />
          <p className="text-sm font-medium text-green-700 mb-3">
            Đã chọn {selectedFiles.length} tệp PDF
          </p>

          <div className="space-y-1 max-w-md mx-auto">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 bg-white rounded border border-green-200 text-sm"
              >
                <FileText className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-gray-700 truncate flex-1 text-left">
                  {file.name}
                </span>
                <span className="text-gray-400 text-xs flex-shrink-0">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-center gap-3">
            <label
              htmlFor="pdf-upload"
              className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer underline"
            >
              Chọn lại
            </label>
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Xóa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
