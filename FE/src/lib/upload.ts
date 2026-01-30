import { toast } from "@/components/ui/use-toast";

const handleImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
  onSuccess?: (imageUrl: string) => void,
  setUploading?: (uploading: boolean) => void
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

    // Đọc file thành base64
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.addEventListener("load", async () => {
      try {
        const data = reader.result?.toString().split(",")[1];
        if (!data) {
          throw new Error("Không thể đọc dữ liệu ảnh");
        }

        const postData = {
          name: file.name,
          type: file.type,
          data: data,
        };

        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbwvWbfkZhCzHxru2euDalTHdjvtgKn4vOYEDFlwiyHS6nj53_WKKLf3x_XGHsa1Bj1gHA/exec",
          {
            method: "POST",
            body: JSON.stringify(postData),
          }
        );

        if (!response.ok) {
          throw new Error("Không thể tải lên ảnh");
        }

        const responseData = await response.json();
        console.log(responseData);

        if (responseData.link) {
          onSuccess?.(responseData.link);
          toast({
            title: "Thành công",
            description: "Tải lên ảnh thành công",
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
    });

    reader.addEventListener("error", () => {
      toast({
        title: "Lỗi",
        description: "Không thể đọc file ảnh",
        variant: "destructive",
      });
      setUploading?.(false);
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Lỗi không xác định";
    console.error("Lỗi khi xử lý ảnh:", errorMessage);
    toast({
      title: "Lỗi",
      description: "Không thể xử lý ảnh. Vui lòng thử lại.",
      variant: "destructive",
    });
    setUploading?.(false);
  }
};

export { handleImageUpload };
