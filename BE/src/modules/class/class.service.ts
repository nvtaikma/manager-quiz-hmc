import Class from "./class.models";
import Timetable from "./timetable.models";

class ClassService {
  async getAllClasses() {
    return await Class.find().sort({ name: 1 }).lean();
  }

  async bulkCreateClasses(classNames: string[]) {
    if (!classNames || classNames.length === 0) return [];
    
    // 1. Find classes that already exist
    const existingClasses = await Class.find({ 
      name: { $in: classNames } 
    }).select("name").lean();

    const existingNames = new Set(existingClasses.map(c => c.name));

    // 2. Filter out existing classes
    const newClassNames = classNames.filter(name => !existingNames.has(name));

    if (newClassNames.length === 0) {
      return {
        insertedCount: 0,
        message: "No new classes to add. All classes already exist."
      };
    }

    // 3. Insert only new classes
    const classesToInsert = newClassNames.map(name => ({ name }));
    const result = await Class.insertMany(classesToInsert);

    return {
      insertedCount: result.length,
      insertedClasses: result
    };
  }

  // Timetable Logic
  async getTimetableByClass(className: string) {
    return await Timetable.find({ ten_lop: className }).sort({ ngay_hoc: 1, buoi: 1 }).lean();
  }

  async importTimetable(data: any[], targetClassName?: string) {
    if (!data || data.length === 0) return { message: "No data provided" };

    // 1. Identify distinct classes in the input data
    const classNames = [...new Set(data.map((item) => item.ten_lop).filter(Boolean))];

    if (classNames.length === 0) {
      throw new Error("Invalid data: Missing 'ten_lop' field");
    }

    // 1.1 If strictly importing for a specific class, validate congruency
    if (targetClassName) {
       const invalidClassNames = classNames.filter(name => name.trim() !== targetClassName.trim());
       if (invalidClassNames.length > 0) {
           throw new Error(`Dữ liệu chứa lớp '${invalidClassNames.join(", ")}' không khớp với lớp đang chọn '${targetClassName}'.`);
       }
    }

    // 2. Parse dates
    const formattedData = data.map((item) => {
      const dateParts = item.ngay_hoc.split("/"); // "23/1/2026"
        let dateObj = new Date();
        if (dateParts.length === 3) {
            // dd/mm/yyyy
            dateObj = new Date(
                parseInt(dateParts[2]),
                parseInt(dateParts[1]) - 1,
                parseInt(dateParts[0])
            );
        }
      
      return {
        ...item,
        ngay_hoc: dateObj,
      };
    });

    // 3. Delete old schedules for these classes
    await Timetable.deleteMany({ ten_lop: { $in: classNames } });

    // 4. Insert new schedules
    const result = await Timetable.insertMany(formattedData);
      
    return result;
  }
}

export default new ClassService();
