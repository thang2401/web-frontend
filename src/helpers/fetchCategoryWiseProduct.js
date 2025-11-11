import SummaryApi from "../common";

const fetchCategoryWiseProduct = async (category) => {
  try {
    // Ngăn gọi API nếu category không hợp lệ
    if (!category) return { success: false, message: "Thiếu category" };

    const response = await fetch(SummaryApi.categoryWiseProduct.url, {
      method: SummaryApi.categoryWiseProduct.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category }),
    });

    // Kiểm tra lỗi server
    if (!response.ok) {
      console.warn("Fetch category failed:", response.status);
      return {
        success: false,
        message:
          response.status === 429
            ? "Server đang giới hạn số lần truy cập. Vui lòng thử lại sau."
            : "Lỗi máy chủ, thử lại sau.",
      };
    }

    const dataResponse = await response.json();

    // Kiểm tra dữ liệu backend trả về
    if (!dataResponse || !dataResponse.data) {
      return { success: false, message: "Không có dữ liệu danh mục." };
    }

    return dataResponse;
  } catch (error) {
    console.error("fetchCategoryWiseProduct error:", error);
    return { success: false, message: "Không thể kết nối đến máy chủ." };
  }
};

export default fetchCategoryWiseProduct;
