import { toast } from "@/components/ui/use-toast";
import { fetchApi } from "@/lib/api";

const handleImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
  onSuccess?: (imageUrl: string) => void,
  setUploading?: (uploading: boolean) => void,
  options?: { watermark?: boolean }
) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const file = files[0];

  // Kiểm tra kích thước file (giới hạn 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast({
      title: "Lỗi",
      description: "Kích thước ảnh không được vượt quá 5MB",
      variant: "destructive",
    });
    return;
  }

  // Kiểm tra định dạng file
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!validTypes.includes(file.type)) {
    toast({
      title: "Lỗi",
      description: "Chỉ hỗ trợ định dạng ảnh: JPG, PNG, GIF, WEBP",
      variant: "destructive",
    });
    return;
  }

  try {
    setUploading?.(true);

    const shouldWatermark = options?.watermark !== false;
    const uploadEndpoint = shouldWatermark
      ? "/upload/image"
      : "/upload/thumbnail";

    // Gửi file qua Backend API
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetchApi(uploadEndpoint, {
      method: "POST",
      body: formData,
      // Không set Content-Type header – fetchApi đã tự detect FormData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Không thể tải lên ảnh");
    }

    const responseData = await response.json();
    console.log(responseData);

    if (responseData.data?.link) {
      onSuccess?.(responseData.data.link);
      toast({
        title: "Thành công",
        description: shouldWatermark
          ? "Tải lên ảnh thành công (đã chèn watermark)"
          : "Tải lên ảnh thumbnail thành công",
      });
    } else {
      throw new Error("Không nhận được link ảnh từ server");
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Lỗi không xác định";
    console.error("Lỗi khi tải lên ảnh:", errorMessage);
    toast({
      title: "Lỗi",
      description: "Không thể tải lên ảnh. Vui lòng thử lại.",
      variant: "destructive",
    });
  } finally {
    setUploading?.(false);
  }
};

export { handleImageUpload };
