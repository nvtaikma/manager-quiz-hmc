import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/contants/api";

interface Product {
  _id: string;
  name: string;
}

export const useProduct = (productId: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm lấy thông tin sản phẩm
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);

      if (!response.ok) {
        throw new Error(
          `Không thể tải thông tin sản phẩm. Mã lỗi: ${response.status}`
        );
      }

      const data = await response.json();
      setProduct(data.data);
    } catch (error) {
      console.error("Lỗi khi tải thông tin sản phẩm:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tải thông tin sản phẩm"
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Tự động fetch sản phẩm khi component được mount
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
  };
};

export default useProduct;
