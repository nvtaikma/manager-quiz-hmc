"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileJson,
  FileText,
  FilePlus2,
  ClipboardList,
} from "lucide-react";

interface ExportControlsProps {
  currentStep: number;
  hasExtractedQuestions: boolean;
  hasComparisonResults: boolean | null; // Allow null to match the actual usage pattern
  hasDeduplicationResults: boolean;
  duplicateGroupsCount: number;
  onExportWord: () => void;
  onExportJson: () => void;
  onExportUnmatchedWord: () => void;
  onExportDetailedReport: () => void;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  currentStep,
  hasExtractedQuestions,
  hasComparisonResults,
  hasDeduplicationResults,
  duplicateGroupsCount,
  onExportWord,
  onExportJson,
  onExportUnmatchedWord,
  onExportDetailedReport,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {/* Bước 2: Xuất tất cả câu hỏi */}
      {currentStep >= 2 && hasExtractedQuestions && (
        <>
          <Button
            variant="default"
            className="bg-green-600 flex gap-2 items-center"
            onClick={onExportWord}
          >
            <FileText className="h-4 w-4" />
            <span>Xuất tất cả câu hỏi (Word)</span>
          </Button>

          {/* <Button
            variant="default"
            className="bg-blue-600 flex gap-2 items-center"
            onClick={onExportJson}
          >
            <FileJson className="h-4 w-4" />
            <span>Xuất JSON</span>
          </Button> */}
        </>
      )}

      {/* Bước 3: Xuất câu hỏi chưa khớp */}
      {currentStep >= 3 && hasComparisonResults && (
        <Button
          variant="default"
          className="bg-amber-600 flex gap-2 items-center"
          onClick={onExportUnmatchedWord}
        >
          <FilePlus2 className="h-4 w-4" />
          <span>Xuất câu hỏi chưa khớp (Word)</span>
        </Button>
      )}

      {/* Bước 4: Xuất các báo cáo về trùng lặp */}
      {currentStep >= 4 && hasDeduplicationResults && (
        <>
          <Button
            variant="default"
            className="bg-green-600 flex gap-2 items-center"
            onClick={onExportUnmatchedWord}
          >
            <Download className="h-4 w-4" />
            <span>Xuất câu hỏi đã loại bỏ trùng lặp (Word)</span>
          </Button>

          <Button
            variant="default"
            className="bg-purple-600 flex gap-2 items-center"
            onClick={onExportDetailedReport}
            disabled={duplicateGroupsCount === 0}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Xuất báo cáo chi tiết trùng lặp (Word)</span>
          </Button>
        </>
      )}
    </div>
  );
};

export default ExportControls;
