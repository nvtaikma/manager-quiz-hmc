import { CheckExamClient } from "./CheckExamClient";

// Server component - nhận params và truyền xuống client component
export default async function CheckExamPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const resolvedParams = await params;
  return <CheckExamClient productId={resolvedParams.productId} />;
}

// Metadata cho SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const resolvedParams = await params;
  return {
    title: `Check đề thi - ${resolvedParams.productId}`,
  };
}
