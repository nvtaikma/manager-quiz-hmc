export interface StudentInfo {
  _id: string;
  productId?: string;
  status: "completed" | "pending" | "vip" | "expired" | string;
  email?: string;
}

export interface Product {
  _id: string;
  name: string;
  type: string;
  amount: number;
  student?: {
    _id: string;
    status: "completed" | "pending" | "vip" | "expired" | string;
  } | null;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Order {
  _id: string;
  status: string;
  orderDate: string;
  totalAmount: number;
  customer: Customer;
  products: Product[];
  students?: StudentInfo[];
}

export interface SortConfig {
  key: keyof Order;
  direction: "ascending" | "descending";
}
