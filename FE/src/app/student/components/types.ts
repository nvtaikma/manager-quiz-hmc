export interface Product {
  _id: string;
  name: string;
}

export interface Student {
  _id: string;
  email: string;
  productId: string;
  status: "completed" | "pending" | "expired";
  product: Product;
}

export interface StudentPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StudentsResponse {
  message: string;
  data: {
    students: Student[];
    pagination: StudentPagination;
  };
}
