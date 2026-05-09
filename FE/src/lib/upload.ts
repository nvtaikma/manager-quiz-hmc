import { toast } from "@/components/ui/use-toast";
import { fetchApi } from "@/lib/api";

const handleImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
  onSuccess?: (imageUrl: string) => void,
  setUploading?: (uploading: boolean) => void,
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

    // Gửi file qua Backend API để chèn watermark trước khi upload lên cloud
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetchApi("/upload/image", {
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
        description: "Tải lên ảnh thành công (đã chèn watermark)",
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
