import React, { useEffect, useState } from "react";
import UploadProduct from "../components/UploadProduct";
import SummaryApi from "../common";
import AdminProductCard from "../components/AdminProductCard";

const AllProducts = () => {
  const [openUploadProduct, setOpenUploadProduct] = useState(false);
  const [allProduct, setAllProduct] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Lấy danh sách sản phẩm
  const fetchAllProduct = async () => {
    try {
      const response = await fetch(SummaryApi.allProduct.url);
      const dataResponse = await response.json();
      setAllProduct(dataResponse?.data || []);
    } catch (err) {
      console.error("Lỗi khi fetch sản phẩm:", err);
      setAllProduct([]);
    }
  };

  useEffect(() => {
    fetchAllProduct();
  }, []);

  // Lọc sản phẩm theo searchTerm, an toàn với undefined
  const filteredProducts = allProduct.filter((product) =>
    (product.productName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="bg-white py-2 px-4 flex justify-between items-center">
        <h2 className="font-bold text-lg">Tất cả sản phẩm</h2>
        <button
          className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all py-1 px-3 rounded-full"
          onClick={() => setOpenUploadProduct(true)}
        >
          Thêm sản phẩm
        </button>
      </div>

      <div className="px-4 py-2">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="overflow-x-auto p-4">
        <table className="min-w-full bg-white border border-gray-300 rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">STT</th>
              <th className="border px-4 py-2 text-left">Tên sản phẩm</th>
              <th className="border px-4 py-2 text-left">Giá</th>
              <th className="border px-4 py-2 text-left">Danh mục</th>
              <th className="border px-4 py-2 text-left">Hình ảnh</th>
              <th className="border px-4 py-2 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => (
              <tr key={product._id || index} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">
                  {product.productName || "-"}
                </td>
                <td className="border px-4 py-2">{product.price || 0}₫</td>
                <td className="border px-4 py-2">{product.category || "-"}</td>
                <td className="border px-4 py-2">
                  <img
                    src={product.productImage?.[0] || "/placeholder.png"}
                    alt={product.productName || "Sản phẩm"}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="border px-4 py-2">
                  <AdminProductCard
                    data={product}
                    fetchdata={fetchAllProduct}
                    isTable={true}
                  />
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Không tìm thấy sản phẩm
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openUploadProduct && (
        <UploadProduct
          onClose={() => setOpenUploadProduct(false)}
          fetchData={fetchAllProduct}
        />
      )}
    </div>
  );
};

export default AllProducts;
