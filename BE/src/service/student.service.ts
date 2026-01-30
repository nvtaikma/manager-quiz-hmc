import Student from "../models/student";

class StudentsService {
  async createStudent({
    email,
    productId,
  }: {
    email: string;
    productId: string;
  }) {
    const normalizedEmail = email.toLowerCase();

    try {
      const student = await Student.findOneAndUpdate(
        { email: normalizedEmail, productId },
        { email: normalizedEmail, productId },
        { new: true, upsert: true }
      ).lean();
      console.log("student", student);

      if (
        student &&
        student.createdAt.getTime() !== student.updatedAt.getTime()
      ) {
        return {
          message: "User already in the class",
        };
      }

      return {
        student,
      };
    } catch (error) {
      console.error("Error creating/finding student:", error);
      throw error;
    }
  }

  async getListStudentByProductId(productId: string, page: number = 1) {
    const limit = 15;
    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      Student.find({ productId })
        .sort({ createdAt: -1 })
        .select("-__v -createdAt -updatedAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments({ productId }),
    ]);
    console.log("students", students);
    console.log("total", total);
    return {
      students,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllStudent({
    status,
    page = 1, // Gán giá trị mặc định trực tiếp trong cấu trúc tham số
    limit = 15, // Gán giá trị mặc định trực tiếp trong cấu trúc tham số
  }: {
    status: string;
    page?: number;
    limit?: number;
  }) {
    // Đặt page và limit là optional (?) trong type

    // Đảm bảo page và limit là số dương, tránh lỗi hoặc truy vấn không hợp lệ
    const currentPage = Math.max(1, page);
    const currentLimit = Math.max(1, limit);

    // Tạo filter object
    const filter = { status };

    // Thực hiện truy vấn
    const [students, total] = await Promise.all([
      Student.aggregate([
        { $match: filter },
        { $project: { __v: 0, createdAt: 0, updatedAt: 0 } },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            email: 1,
            productId: 1,
            status: 1,
            product: { name: 1, _id: 1 },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (currentPage - 1) * currentLimit },
        { $limit: currentLimit },
      ]),
      Student.countDocuments(filter),
    ]);
    return {
      students,
      pagination: {
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit),
      },
    };
  }

  // Sử dụng studentId trong tham số để khớp với logic tìm kiếm
  async updateStudentStatus(studentId: string, status: string) {
    // Tạo đối tượng cập nhật
    const update = { status };

    // Thực hiện tìm kiếm theo ID và cập nhật trạng thái,
    // { new: true } đảm bảo trả về document sau khi đã được cập nhật
    const updatedStudent = await Student.findByIdAndUpdate(studentId, update, {
      new: true,
    });

    return updatedStudent;
  }

  async getStudentByEmailAndProductId(email: string, productId: string) {
    const normalizedEmail = email.toLowerCase();
    return await Student.findOne({ email: normalizedEmail, productId }).lean();
  }

  async deleteStudent(studentId: string) {
    return await Student.findByIdAndDelete(studentId);
  }

  async exprireOldStudent() {
    // Tính toán thời điểm 90 ngày trước (Expiration Threshold)
    const expirationThreshold = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    console.log(
      `Bắt đầu kiểm tra học sinh cũ hơn: ${expirationThreshold.toISOString()}`
    );

    // Định nghĩa bộ lọc tìm kiếm
    const filter = {
      // 1. Chỉ xem xét các trạng thái chưa hết hạn
      status: { $in: ["completed", "pending"] },

      // 2. Tìm kiếm những bản ghi được tạo TRƯỚC thời điểm 90 ngày trước
      createdAt: { $lt: expirationThreshold },
    };

    // Định nghĩa hành động cập nhật
    const update = {
      status: "expired",
    };

    try {
      // Sử dụng updateMany để cập nhật nhiều bản ghi cùng lúc (RẤT HIỆU QUẢ)
      const result = await Student.updateMany(filter, update);

      console.log(
        `Đã hoàn tất cập nhật trạng thái. Tổng số document được tìm thấy: ${result.matchedCount}, đã cập nhật: ${result.modifiedCount}`
      );

      return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái hết hạn cho học sinh:", error);
      throw error;
    }
  }

  async deleteStudentByProductIdAndEmail(productId: string, email: string) {
    return await Student.findOneAndDelete({ productId, email });
  }

  async searchStudentByProductId(
    keyword: string,
    productId: string,
    page: number = 1
  ) {
    const limit = 15;
    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      Student.find({
        $or: [{ email: { $regex: keyword, $options: "i" } }],
        productId,
      })
        .select("-__v -createdAt -updatedAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments({
        $or: [{ email: { $regex: keyword, $options: "i" } }],
        productId,
      }),
    ]);
    return {
      students,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCountStudentByProductId(productId: string) {
    return await Student.countDocuments({ productId });
  }

  /**
   * Lấy danh sách đề thi của sinh viên theo khóa học
   * @param studentId ID của sinh viên
   * @param productId ID của khóa học
   * @returns Danh sách đề thi
   */
  async getStudentExams(studentId: string, productId: string) {
    try {
      // Xác nhận sinh viên tồn tại và có quyền truy cập khóa học
      const student = await Student.findOne({ _id: studentId, productId });

      if (!student) {
        throw new Error("Sinh viên không có quyền truy cập khóa học này");
      }

      // Giả định rằng có một model Exam với cấu trúc phù hợp
      // Bạn cần thay thế đoạn này bằng truy vấn thực tế đến model Exam của bạn
      // Ví dụ:
      // const exams = await Exam.find({ productId }).lean();

      // Hiện tại trả về dữ liệu mẫu
      return {
        exams: [],
        message: "Cần triển khai kết nối với model Exam thực tế",
      };
    } catch (error) {
      console.error("Error fetching student exams:", error);
      throw error;
    }
  }

  /**
   * Lấy danh sách bài kiểm tra của sinh viên theo khóa học
   * @param studentId ID của sinh viên
   * @param productId ID của khóa học
   * @returns Danh sách bài kiểm tra
   */
  async getStudentTests(studentId: string, productId: string) {
    try {
      // Xác nhận sinh viên tồn tại và có quyền truy cập khóa học
      const student = await Student.findOne({ _id: studentId, productId });

      if (!student) {
        throw new Error("Sinh viên không có quyền truy cập khóa học này");
      }

      // Giả định rằng có một model Test với cấu trúc phù hợp
      // Bạn cần thay thế đoạn này bằng truy vấn thực tế đến model Test của bạn
      // Ví dụ:
      // const tests = await Test.find({ productId }).lean();

      // Hiện tại trả về dữ liệu mẫu
      return {
        tests: [],
        message: "Cần triển khai kết nối với model Test thực tế",
      };
    } catch (error) {
      console.error("Error fetching student tests:", error);
      throw error;
    }
  }
}

export default new StudentsService();
