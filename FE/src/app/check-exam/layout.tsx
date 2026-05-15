"use client";

import React from "react";
import Script from "next/script";
import { Toaster } from "@/components/ui/toaster";

// Giữ lại declare cho docx và saveAs (vẫn dùng CDN)
declare global {
  interface Window {
    docx: {
      Document: unknown;
      Packer: unknown;
      Paragraph: unknown;
      TextRun: unknown;
    };
    saveAs: (blob: Blob, filename: string) => void;
  }
}

export default function CheckExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* PDF.js đã chuyển sang import trực tiếp từ pdfjs-dist, không cần CDN nữa */}
      <Script
        src="https://unpkg.com/docx@7.3.0/build/index.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"
        strategy="afterInteractive"
      />

      <style jsx global>{`
        .loader {
          border-top-color: #3498db;
          -webkit-animation: spinner 1.5s linear infinite;
          animation: spinner 1.5s linear infinite;
        }
        @-webkit-keyframes spinner {
          0% {
            -webkit-transform: rotate(0deg);
          }
          100% {
            -webkit-transform: rotate(360deg);
          }
        }
        @keyframes spinner {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .highlight-red {
          background-color: #fef2f2;
          color: #991b1b;
        }
      `}</style>

      {children}
      <Toaster />
    </div>
  );
}
