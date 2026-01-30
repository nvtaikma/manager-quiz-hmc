import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { StudentManager } from "./components/StudentManager";

import { API_BASE_URL } from "@/contants/api";

import { BackButton } from "./components/BackButton";

export default async function ProductStudentsPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const resolvedParams = await params;

  const fetchProduct = async () => {
    const response = await fetch(
      `${API_BASE_URL}/products/${resolvedParams.productId}`
    );
    const { data: product } = await response.json();
    return product;
  };
  const product = await fetchProduct();
  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">
          <div className="flex justify-between">
            <div className="mr-2"> danh sách sinh viên</div>
            <BackButton />
          </div>
          <div>{product.name}</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <StudentManager productId={resolvedParams.productId} />
      </CardContent>
    </Card>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const resolvedParams = await params;
  return {
    title: `Quản lý sinh viên - ${resolvedParams.productId}`,
  };
}
