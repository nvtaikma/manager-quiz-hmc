"use strict";
// Using native fetch
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const BASE_URL = "http://localhost:3000/api";
const classesData = [
    "CSSĐ 3A01",
    "CSSĐ 3A03",
    "CSSĐ 3A04",
    "CSSĐ 3A05",
    "CSSĐ 3A07",
    "CSSĐ 3A08",
    "CSSĐ 3A09",
    "CSSĐ 3A10",
    "CSSĐ 3A11"
];
const timetableData = [
    {
        "buoi": "Chiều",
        "ngay_hoc": "23/1/2026",
        "giang_duong": "PTH Tin 3",
        "dia_diem": "35 Đoàn Thị Điểm",
        "doi_tuong": "02. DS15",
        "ten_lop": "Dược 15A08",
        "mon_hoc": "Cấu tạo và chức năng của cơ thể",
        "loai_gio": "Thi hết môn",
        "so_tiet": "T",
        "giang_vien": "",
        "sdt_gv": "",
        "noi_dung": "",
        "gio_thi": "13h30",
        "ghi_chu": ""
    },
    {
        "buoi": "Chiều",
        "ngay_hoc": "24/1/2026",
        "giang_duong": "PTH 05",
        "dia_diem": "35 Đoàn Thị Điểm",
        "doi_tuong": "08. YS3",
        "ten_lop": "Y sỹ đa khoa 3A05",
        "mon_hoc": "Cấu tạo và chức năng của cơ thể",
        "loai_gio": "2.Thực hành",
        "so_tiet": "5",
        "giang_vien": "Vũ Thị Ngọc",
        "sdt_gv": "836852319",
        "noi_dung": "Bài 4: TH cấu tạo GP chi dưới",
        "gio_thi": "",
        "ghi_chu": ""
    },
    {
        "buoi": "1. Sáng",
        "ngay_hoc": "26/1/2026",
        "giang_duong": "PTH Tin 1",
        "dia_diem": "35 Đoàn Thị Điểm",
        "doi_tuong": "02. DS15",
        "ten_lop": "Dược 15A04",
        "mon_hoc": "Cấu tạo và chức năng của cơ thể",
        "loai_gio": "Thi hết môn",
        "so_tiet": "T",
        "giang_vien": "",
        "sdt_gv": "",
        "noi_dung": "",
        "gio_thi": "8h30",
        "ghi_chu": ""
    }
];
function runTest() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🚀 Starting Integration Test...");
        // 1. Test Bulk Create Classes
        console.log("\n1️⃣ Testing Bulk Create Classes...");
        try {
            const res = yield fetch(`${BASE_URL}/classes/bulk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ classes: classesData })
            });
            if (res.status === 404) {
                // May happen if route is not mounted or wrong URL
                // Check if we hit the frontend by mistake
                const text = yield res.text();
                if (text.includes("<!DOCTYPE html>")) {
                    console.error("❌ Error: It seems we hit the Frontend (HTML response). Port 3000 is likely the Next.js app.");
                    process.exit(1);
                }
            }
            const data = yield res.json();
            console.log("Status:", res.status);
            console.log("Response:", JSON.stringify(data, null, 2));
            if (res.status !== 200)
                throw new Error("Failed to create classes");
        }
        catch (error) {
            console.error("❌ Failed:", error);
            return;
        }
        // 2. Test Import Timetable
        console.log("\n2️⃣ Testing Import Timetable...");
        try {
            const res = yield fetch(`${BASE_URL}/classes/timetable/import`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(timetableData)
            });
            // Check for HTML response again just in case
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("text/html")) {
                console.error("❌ Error: Received HTML instead of JSON. Wrong port?");
                return;
            }
            const data = yield res.json();
            console.log("Status:", res.status);
            console.log("Response:", JSON.stringify(data, null, 2));
            if (res.status !== 200)
                throw new Error("Failed to import timetable");
        }
        catch (error) {
            console.error("❌ Failed:", error);
            return;
        }
        // 3. Verify Data
        console.log("\n3️⃣ Verifying Timetable for 'Dược 15A08'...");
        try {
            const className = "Dược 15A08";
            const res = yield fetch(`${BASE_URL}/classes/${encodeURIComponent(className)}/timetable`);
            const data = yield res.json();
            console.log("Status:", res.status);
            if (data.data && Array.isArray(data.data)) {
                console.log(`Found ${data.data.length} entries for ${className}`);
                if (data.data.length > 0) {
                    console.log("First entry:", data.data[0]);
                }
            }
            else {
                console.log("No data found or wrong structure", data);
            }
        }
        catch (error) {
            console.error("❌ Failed:", error);
        }
    });
}
runTest();
