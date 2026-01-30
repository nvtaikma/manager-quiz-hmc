"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";

interface ExportButtonsProps {
  questions: string[];
  onExportWord: () => void;
  onExportJson: () => void;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  questions,
  onExportWord,
  onExportJson,
}) => {
  return (
    <div className="flex space-x-2">
      <Button
        id="export-word-btn"
        variant="default"
        className="bg-green-600"
        disabled={questions.length === 0}
        onClick={onExportWord}
      >
        Xuất ra Word
      </Button>
      <Button
        id="export-json-btn"
        variant="default"
        className="bg-orange-500"
        disabled={questions.length === 0}
        onClick={onExportJson}
      >
        Xuất ra JSON
      </Button>
    </div>
  );
};

export default ExportButtons;
