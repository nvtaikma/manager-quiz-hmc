import { useCallback } from "react";
import { saveAs } from "file-saver";
import { QuestionData } from "./useQuestions";

export const useExportFunctions = () => {
  // Export to JSON
  const exportToJson = useCallback((jsonData: QuestionData[]) => {
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    saveAs(blob, "cac-cau-hoi.json");
    return true;
  }, []);

  // Export to Word
  const exportToWord = useCallback((extractedQuestions: string[]) => {
    if (typeof window === "undefined" || !window.docx) {
      console.error("docx library not available");
      return false;
    }

    try {
      const { Document, Packer, Paragraph, TextRun } = window.docx;
      const children = extractedQuestions.flatMap((qText) => {
        const questionParagraphs = [];
        const parts = qText
          .split("#")
          .map((p) => p.trim())
          .filter((p) => p);

        if (parts.length < 2) {
          // Use docx classes safely
          return [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            new (window as any).docx.Paragraph(qText),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            new (window as any).docx.Paragraph(""),
          ];
        }

        const [questionContent, ...answers] = parts;
        questionParagraphs.push(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          new (window as any).docx.Paragraph({
            children: [
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              new (window as any).docx.TextRun({
                text: questionContent,
                bold: true,
              }),
            ],
            spacing: { after: 200 },
          })
        );

        answers.forEach((answerText) => {
          const isCorrect = answerText.includes("►");
          const cleanAnswer = answerText.replace("►", "").trim();
          if (cleanAnswer.length > 0) {
            const letter = cleanAnswer.charAt(0);
            const text = cleanAnswer.substring(1).trim();
            questionParagraphs.push(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              new (window as any).docx.Paragraph({
                children: [
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  new (window as any).docx.TextRun({
                    text: `${letter}. ${text}`,
                    bold: isCorrect,
                  }),
                ],
                indent: { left: 720 },
                spacing: { after: 100 },
              })
            );
          }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        questionParagraphs.push(new (window as any).docx.Paragraph(""));
        return questionParagraphs;
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = new (window as any).docx.Document({
        sections: [{ children }],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).docx.Packer.toBlob(doc).then((blob: Blob) =>
        saveAs(blob, "cac-cau-hoi-trac-nghiem.docx")
      );

      return true;
    } catch (error) {
      console.error("Error exporting to Word:", error);
      return false;
    }
  }, []);

  // Export unmatched questions to Word
  const exportUnmatchedToWord = useCallback(
    (questionsToExport: QuestionData[]) => {
      if (typeof window === "undefined" || !window.docx) {
        console.error("docx library not available");
        return false;
      }

      try {
        if (questionsToExport.length === 0) {
          return false;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Document = (window as any).docx.Document;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Packer = (window as any).docx.Packer;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Paragraph = (window as any).docx.Paragraph;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const TextRun = (window as any).docx.TextRun;
        const children = questionsToExport.flatMap((question, index) => {
          const questionParagraphs = [];

          // Title for each question
          questionParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Câu hỏi ${index + 1}: ${question.question}`,
                  bold: true,
                }),
              ],
              spacing: { after: 200 },
            })
          );

          // Add options if they exist
          const options = question.options;
          if (options) {
            Object.entries(options).forEach(([key, value]) => {
              const isCorrect = question.correct_answer === key;

              questionParagraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${key}. ${value}`,
                      bold: isCorrect,
                    }),
                  ],
                  indent: { left: 720 },
                  spacing: { after: 100 },
                })
              );
            });
          }

          questionParagraphs.push(new Paragraph(""));
          return questionParagraphs;
        });

        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `CÁC CÂU HỎI KHÔNG CÓ TRONG ĐỀ CƯƠNG (${questionsToExport.length} câu)`,
                      bold: true,
                      size: 28,
                    }),
                  ],
                  spacing: { after: 400 },
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  alignment: (window as any).docx.AlignmentType.CENTER,
                }),
                ...children,
              ],
            },
          ],
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).docx.Packer.toBlob(doc).then((blob: Blob) =>
          saveAs(blob, "cau-hoi-khong-co-trong-de-cuong.docx")
        );

        return true;
      } catch (error) {
        console.error("Error exporting unmatched questions to Word:", error);
        return false;
      }
    },
    []
  );

  // Export detailed deduplication report
  const exportDetailedReport = useCallback(
    (deduplicationState: {
      originalUnmatchedCount: number;
      duplicatesCount: number;
      finalCount: number;
      duplicateGroups: {
        originalIndex: number;
        originalQuestion: QuestionData;
        duplicates: Array<{
          index: number;
          question: QuestionData;
          similarityScore: number;
        }>;
      }[];
    }) => {
      if (typeof window === "undefined" || !window.docx) {
        console.error("docx library not available");
        return false;
      }

      try {
        if (deduplicationState.duplicateGroups.length === 0) {
          return false;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Document = (window as any).docx.Document;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Packer = (window as any).docx.Packer;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Paragraph = (window as any).docx.Paragraph;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const TextRun = (window as any).docx.TextRun;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AlignmentType = (window as any).docx.AlignmentType;
        const children = [];

        // Thêm tiêu đề báo cáo
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `BÁO CÁO CHI TIẾT PHÁT HIỆN TRÙNG LẶP`,
                bold: true,
                size: 32,
              }),
            ],
            spacing: { after: 300 },
            alignment: AlignmentType.CENTER,
          })
        );

        // Thêm thông tin tóm tắt
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Tổng số câu hỏi ban đầu: ${deduplicationState.originalUnmatchedCount}`,
                bold: true,
                size: 24,
              }),
            ],
            spacing: { after: 200 },
          })
        );

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Số lượng câu hỏi trùng lặp đã loại bỏ: ${deduplicationState.duplicatesCount}`,
                bold: true,
                size: 24,
              }),
            ],
            spacing: { after: 200 },
          })
        );

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Số lượng câu hỏi còn lại sau khi loại bỏ trùng lặp: ${deduplicationState.finalCount}`,
                bold: true,
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          })
        );

        // Thêm chi tiết về các nhóm câu hỏi trùng lặp
        deduplicationState.duplicateGroups.forEach((group, groupIndex) => {
          // Tiêu đề nhóm
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `NHÓM ${groupIndex + 1}`,
                  bold: true,
                  size: 28,
                  color: "2E7D32", // Màu xanh lá
                }),
              ],
              spacing: { before: 400, after: 200 },
            })
          );

          // Câu hỏi gốc
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Câu hỏi được giữ lại:`,
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 100 },
            })
          );

          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: group.originalQuestion.question,
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            })
          );

          // Thêm các lựa chọn của câu hỏi gốc nếu có
          if (Object.keys(group.originalQuestion.options || {}).length > 0) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Các đáp án:",
                    bold: true,
                  }),
                ],
                spacing: { after: 100 },
              })
            );

            Object.entries(group.originalQuestion.options).forEach(
              ([key, value]) => {
                const isCorrect = group.originalQuestion.correct_answer === key;
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${key}. ${value}`,
                        bold: isCorrect,
                      }),
                      isCorrect
                        ? new TextRun({
                            text: " (Đáp án đúng)",
                            bold: true,
                            color: "2E7D32", // Màu xanh lá
                          })
                        : new TextRun({ text: "" }),
                    ],
                    indent: { left: 720 },
                    spacing: { after: 100 },
                  })
                );
              }
            );
          }

          // Câu hỏi trùng lặp
          if (group.duplicates.length > 0) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Các câu hỏi trùng lặp (${group.duplicates.length}):`,
                    bold: true,
                    size: 24,
                    color: "C62828", // Màu đỏ
                  }),
                ],
                spacing: { before: 200, after: 100 },
              })
            );

            group.duplicates.forEach((duplicate, idx) => {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Trùng lặp #${idx + 1} (Độ tương đồng: ${
                        duplicate.similarityScore
                      }%):`,
                      bold: true,
                      color: "C62828", // Màu đỏ
                    }),
                  ],
                  spacing: { after: 100 },
                })
              );

              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: duplicate.question.question,
                    }),
                  ],
                  spacing: { after: 200 },
                })
              );

              // Thêm các lựa chọn của câu hỏi trùng lặp nếu có
              if (Object.keys(duplicate.question.options || {}).length > 0) {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Các đáp án:",
                        bold: true,
                      }),
                    ],
                    spacing: { after: 100 },
                  })
                );

                Object.entries(duplicate.question.options).forEach(
                  ([key, value]) => {
                    const isCorrect = duplicate.question.correct_answer === key;
                    children.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${key}. ${value}`,
                            bold: isCorrect,
                          }),
                          isCorrect
                            ? new TextRun({
                                text: " (Đáp án đúng)",
                                bold: true,
                                color: "C62828", // Màu đỏ
                              })
                            : new TextRun({ text: "" }),
                        ],
                        indent: { left: 720 },
                        spacing: { after: 100 },
                      })
                    );
                  }
                );
              }
            });
          }

          // Thêm dòng phân cách giữa các nhóm
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "─".repeat(50),
                  color: "BDBDBD", // Màu xám nhạt
                }),
              ],
              spacing: { before: 200, after: 200 },
              alignment: AlignmentType.CENTER,
            })
          );
        });

        // Tạo document và xuất ra file
        const doc = new Document({ sections: [{ children }] });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).docx.Packer.toBlob(doc).then((blob: Blob) =>
          saveAs(blob, "bao-cao-chi-tiet-trung-lap.docx")
        );

        return true;
      } catch (error) {
        console.error("Error exporting detailed report:", error);
        return false;
      }
    },
    []
  );

  return {
    exportToJson,
    exportToWord,
    exportUnmatchedToWord,
    exportDetailedReport,
  };
};

export default useExportFunctions;
