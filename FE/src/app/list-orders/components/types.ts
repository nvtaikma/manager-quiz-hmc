export interface Product {
  _id: string;
  name: string;
  type: string;
  amount: number;
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
}

export interface SortConfig {
  key: keyof Order;
  direction: "ascending" | "descending";
}
