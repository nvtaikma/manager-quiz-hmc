"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/useDebounce";
import { API_BASE_URL } from "@/contants/api";

const customerSchema = z.object({
  name: z.string().min(2, {
    message: "Tên phải có ít nhất 2 ký tự.",
  }),
  email: z.string().email({
    message: "Email không hợp lệ.",
  }),
});

interface Product {
  _id: string;
  name: string;
}

interface OrderItem {
  productId: string;
  selectedType: string;
}

export default function CreateOrder() {
  const [step, setStep] = useState<"customer" | "products">("customer");
  const [customerId, setCustomerId] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(
    null
  );

  // Debounce search term để cải thiện performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fuzzy search function - tìm kiếm tương đối
  const fuzzySearch = (text: string, searchTerm: string): boolean => {
    if (!searchTerm.trim()) return true;

    // Chuẩn hóa text và search term (bỏ dấu tiếng Việt)
    const normalizeText = (str: string) =>
      str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");

    const cleanText = normalizeText(text);
    const cleanSearchTerm = normalizeText(searchTerm);

    // 1. Kiểm tra exact match trước
    if (cleanText.includes(cleanSearchTerm)) {
      return true;
    }

    // 2. Kiểm tra match từng từ riêng lẻ
    const words = cleanText.split(/\s+/);
    for (const word of words) {
      if (word.startsWith(cleanSearchTerm)) {
        return true;
      }
    }

    // 3. Fuzzy match - kiểm tra sequence matching
    const searchChars = cleanSearchTerm.split("");
    let searchIndex = 0;

    for (const char of cleanText) {
      if (
        searchIndex < searchChars.length &&
        char === searchChars[searchIndex]
      ) {
        searchIndex++;
      }
    }

    return searchIndex === searchChars.length;
  };

  // Filter products based on fuzzy search
  const filteredProducts = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return products;
    }
    return products.filter((product) =>
      fuzzySearch(product.name, debouncedSearchTerm)
    );
  }, [products, debouncedSearchTerm]);

  // Keyboard shortcut để focus vào search input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef?.focus();
      }
    };

    if (step === "products") {
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [step, searchInputRef]);

  async function onCustomerSubmit(values: z.infer<typeof customerSchema>) {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Lỗi khi tạo khách hàng");
      }

      const data = await response.json();
      setCustomerId(data.data._id);
      fetchProducts();
      setStep("products");
    } catch (error) {
      console.error("Lỗi:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo khách hàng. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchProducts() {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/all/full`);
      if (!response.ok) {
        throw new Error("Lỗi khi tải danh sách sản phẩm");
      }
      const data = await response.json();
      setProducts(data.data);
    } catch (error) {
      console.error("Lỗi:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách sản phẩm. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleProductSelection(productId: string, selectedType: string) {
    setSelectedProducts((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === productId
      );
      if (existingIndex > -1) {
        // If the product is already selected, update its type
        const updatedItems = [...prev];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          selectedType,
        };
        return updatedItems;
      } else {
        // If it's a new selection, add it to the array
        return [...prev, { productId, selectedType }];
      }
    });
  }

  async function placeOrder() {
    setLoading(true);
    if (selectedProducts.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một sản phẩm.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          items: selectedProducts,
        }),
      });

      if (!response.ok) {
        throw new Error("Lỗi khi tạo đơn hàng");
      }

      toast({
        title: "Thành công",
        description: "Đơn hàng đã được tạo.",
      });
      router.push("/list-orders");
    } catch (error) {
      console.error("Lỗi:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo đơn hàng. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Tạo đơn hàng</h1>
      {step === "customer" ? (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách hàng</CardTitle>
            <CardDescription>
              Nhập thông tin khách hàng để tiếp tục.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onCustomerSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Tiếp tục</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Chọn sản phẩm</CardTitle>
            <CardDescription>
              Chọn các sản phẩm và loại cho đơn hàng.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Cột trái: Danh sách môn học */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Danh sách môn học</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {filteredProducts.length} / {products.length} môn học
                    </span>
                    <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </div>
                </div>

                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    ref={setSearchInputRef}
                    placeholder="Tìm kiếm môn học... VD: 'tie' để tìm 'Tiếng Anh' (Ctrl+K)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="border rounded-lg">
                  <ScrollArea className="h-[400px] w-full p-4">
                    {filteredProducts.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        {debouncedSearchTerm ? (
                          <div>
                            <p>
                              Không tìm thấy môn học nào cho &quot;
                              <strong>{debouncedSearchTerm}</strong>&quot;
                            </p>
                            <p className="text-xs mt-1">
                              Thử nhập ít ký tự hơn hoặc từ khóa khác
                            </p>
                          </div>
                        ) : (
                          "Không có môn học nào"
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredProducts.map((product) => (
                          <div
                            key={product._id}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            <Checkbox
                              id={`product-${product._id}`}
                              checked={selectedProducts.some(
                                (item) => item.productId === product._id
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleProductSelection(product._id, "1");
                                } else {
                                  setSelectedProducts((prev) =>
                                    prev.filter(
                                      (item) => item.productId !== product._id
                                    )
                                  );
                                }
                              }}
                            />
                            <Label
                              htmlFor={`product-${product._id}`}
                              className="cursor-pointer flex-1 text-sm"
                            >
                              {product.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>

              {/* Cột phải: Lựa chọn loại */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Lựa chọn loại</h3>
                  <span className="text-sm text-gray-500">
                    {selectedProducts.length} môn học đã chọn
                  </span>
                </div>

                <div className="border rounded-lg">
                  <ScrollArea className="h-[456px] w-full p-4">
                    {selectedProducts.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <div className="space-y-2">
                          <p>Chưa chọn môn học nào</p>
                          <p className="text-xs">
                            Vui lòng chọn môn học từ danh sách bên trái
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedProducts.map((item) => {
                          const product = products.find(
                            (p) => p._id === item.productId
                          );
                          return (
                            <div
                              key={item.productId}
                              className="p-3 border rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors"
                            >
                              <p className="font-medium text-sm mb-3">
                                {product?.name}
                              </p>
                              <div className="grid grid-cols-1 gap-2">
                                {/* <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`file-${item.productId}`}
                                    checked={item.selectedType === "2"}
                                    onCheckedChange={() =>
                                      handleProductSelection(
                                        item.productId,
                                        "2"
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`file-${item.productId}`}
                                    className="cursor-pointer text-sm"
                                  >
                                    📁 File
                                  </Label>
                                </div> */}
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`quizizz-${item.productId}`}
                                    checked={item.selectedType === "1"}
                                    onCheckedChange={() =>
                                      handleProductSelection(
                                        item.productId,
                                        "1"
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`quizizz-${item.productId}`}
                                    className="cursor-pointer text-sm"
                                  >
                                    🎯 Quizizz
                                  </Label>
                                </div>
                                {/* <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`azota-${item.productId}`}
                                    checked={item.selectedType === "3"}
                                    onCheckedChange={() =>
                                      handleProductSelection(
                                        item.productId,
                                        "3"
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`azota-${item.productId}`}
                                    className="cursor-pointer text-sm"
                                  >
                                    🌐 Azota
                                  </Label>
                                </div> */}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedProducts.length > 0 ? (
                <span>
                  Đã chọn <strong>{selectedProducts.length}</strong> môn học
                </span>
              ) : (
                <span>Vui lòng chọn ít nhất một môn học</span>
              )}
            </div>
            <Button
              onClick={placeOrder}
              disabled={selectedProducts.length === 0}
              className="w-full sm:w-auto"
            >
              Đặt hàng ({selectedProducts.length} môn học)
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
