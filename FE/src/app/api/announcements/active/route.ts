import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/contants/api";
// Đặt địa chỉ backend API
const API_URL = API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_URL}/announcements/active`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching active announcements:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
