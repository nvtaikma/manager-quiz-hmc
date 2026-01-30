// Đây là server component
import { SyllabusManager } from "./components/SyllabusManager";

// Nhận params từ server và truyền xuống client component
export default async function ProductSyllabusPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const resolvedParams = await params;
  return <SyllabusManager productId={resolvedParams.productId} />;
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
    title: `Đề cương - ${resolvedParams.productId}`,
  };
}
