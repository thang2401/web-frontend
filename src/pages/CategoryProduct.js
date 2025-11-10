import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import productCategory from "../helpers/productCategory";
import VerticalCard from "../components/VerticalCard";
import SummaryApi from "../common";

const CategoryProduct = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlSearch = new URLSearchParams(location.search);
    const categoriesFromURL = urlSearch.getAll("category");

    if (categoriesFromURL.length > 0) {
      setSelectedCategories(
        categoriesFromURL.reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
      );
    }
  }, [location.search]);

  useEffect(() => {
    if (filteredCategories.length === 0) return;

    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(SummaryApi.filterProduct.url, {
          method: SummaryApi.filterProduct.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: filteredCategories }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        const result = await response.json();
        setProducts(result?.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [filteredCategories]);

  useEffect(() => {
    const activeCategories = Object.keys(selectedCategories).filter(
      (key) => selectedCategories[key]
    );

    if (
      JSON.stringify(activeCategories) !== JSON.stringify(filteredCategories)
    ) {
      setFilteredCategories(activeCategories);
    }

    const categoryQuery = activeCategories
      .map((cat) => `category=${cat}`)
      .join("&&");

    // SỬA LỖI: Thêm filteredCategories vào dependency để React biết trạng thái phụ thuộc.
    navigate(`/product-category?${categoryQuery}`);
  }, [selectedCategories, navigate, filteredCategories]); // <-- ĐÃ THÊM filteredCategories

  const handleSortChange = (e) => {
    const { value } = e.target;
    setSortBy(value);

    setProducts((prevProducts) =>
      [...prevProducts].sort((a, b) =>
        value === "asc"
          ? a.sellingPrice - b.sellingPrice
          : b.sellingPrice - a.sellingPrice
      )
    );
  };

  const handleCategoryToggle = (e) => {
    const { value, checked } = e.target;
    setSelectedCategories((prev) => ({
      ...prev,
      [value]: checked,
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="hidden lg:grid grid-cols-[200px,1fr] gap-4">
        <aside className="bg-white p-4 min-h-[calc(100vh-120px)] overflow-y-scroll">
          <section className="mb-6">
            <h3 className="text-base font-medium text-slate-500 border-b pb-1">
              Sắp xếp
            </h3>
            <form className="text-sm flex flex-col gap-2 py-2">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="sortBy"
                  value="asc"
                  checked={sortBy === "asc"}
                  onChange={handleSortChange}
                />
                Giá từ thấp đến cao
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="sortBy"
                  value="dsc"
                  checked={sortBy === "dsc"}
                  onChange={handleSortChange}
                />
                Giá từ cao đến thấp
              </label>
            </form>
          </section>

          <section>
            <h3 className="text-base font-medium text-slate-500 border-b pb-1">
              Danh mục sản phẩm
            </h3>
            <form className="text-sm flex flex-col gap-2 py-2">
              {productCategory.map(({ label, value }) => (
                <label key={value} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="category"
                    value={value}
                    checked={selectedCategories[value] || false}
                    onChange={handleCategoryToggle}
                  />
                  {label}
                </label>
              ))}
            </form>
          </section>
        </aside>

        <main className="px-4">
          <p className="font-medium text-slate-800 text-lg mb-4">
            Kết quả tìm kiếm: {products.length}
          </p>

          <div className="min-h-[calc(100vh-120px)] overflow-y-scroll max-h-[calc(100vh-120px)]">
            {products.length > 0 && !loading && (
              <VerticalCard data={products} loading={loading} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CategoryProduct;
