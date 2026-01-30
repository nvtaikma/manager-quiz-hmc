import { API_BASE_URL } from "@/contants/api";
import { NextRequest, NextResponse } from "next/server";

// Đặt địa chỉ backend API
const API_URL = API_BASE_URL;

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Lấy chi tiết thông báo theo ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const response = await fetch(`${API_URL}/announcements/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Cập nhật thông báo
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/announcements/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Xóa thông báo
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const response = await fetch(`${API_URL}/announcements/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
