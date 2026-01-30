// Đây là server component
import { QuestionManager } from "./components/QuestionManager";

// Nhận params từ server và truyền xuống client component
export default async function ExamQuestionsPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  // Await params trước khi sử dụng
  const resolvedParams = await params;
  return <QuestionManager examId={resolvedParams.examId} />;
}

// Đảm bảo trang này là một server component bằng cách thêm generateMetadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  // Await params trước khi sử dụng
  const resolvedParams = await params;
  return {
    title: `Quản lý câu hỏi - ${resolvedParams.examId}`,
  };
}
