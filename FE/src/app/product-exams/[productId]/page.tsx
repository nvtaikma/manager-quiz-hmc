// Đây là server component
import { ExamManager } from "./components/ExamManager";

// Nhận params từ server và truyền xuống client component
export default async function ProductExamsPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const resolvedParams = await params;
  return <ExamManager productId={resolvedParams.productId} />;
}

// Đảm bảo trang này là một server component bằng cách thêm generateMetadata
// để NextJS biết rằng đây là server component
export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const resolvedParams = await params;
  return {
    title: `Quản lý đề thi - ${resolvedParams.productId}`,
  };
}
