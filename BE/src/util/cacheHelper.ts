import redis from "../dbs/redis";

/**
 * Xây dựng Redis key theo chuẩn cho question cache của exam.
 * Format: q:exam:{examId}
 *
 * @example buildExamCacheKey("67f24e6eb80f47790e44f84b") → "q:exam:67f24e6eb80f47790e44f84b"
 */
export const buildExamCacheKey = (examId: string): string =>
  `q:exam:${examId}`;

/**
 * Xóa cache câu hỏi của một đề thi khỏi Redis.
 *
 * ⚠️ Hàm này KHÔNG throw lỗi ra ngoài:
 * - Nếu key không tồn tại → trả về false (không phải lỗi)
 * - Nếu Redis mất kết nối → log cảnh báo và trả về false
 * - Nghiệp vụ chính (DB) không bị gián đoạn trong mọi trường hợp
 *
 * @param examId - ID của đề thi cần invalidate cache
 * @returns true nếu key tồn tại và đã xóa thành công, false trong mọi trường hợp còn lại
 */
export const invalidateExamCache = async (examId: string): Promise<boolean> => {
  try {
    const key = buildExamCacheKey(examId);
    const deleted = await redis.del(key);

    if (deleted > 0) {
      console.log(`🗑️  [Cache] Invalidated: ${key}`);
      return true;
    }

    // Key không tồn tại trong Redis (cache miss) — không phải lỗi
    return false;
  } catch (error) {
    // Redis lỗi (mất kết nối, timeout...): log cảnh báo nhưng KHÔNG throw
    console.warn(
      `⚠️  [Cache] Invalidation failed for exam "${examId}":`,
      error,
    );
    return false;
  }
};
