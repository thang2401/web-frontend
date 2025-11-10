import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react"; // ĐÃ SỬA: Thêm useCallback
import { Link } from "react-router-dom";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

import fetchCategoryWiseProduct from "../helpers/fetchCategoryWiseProduct";
import displayINRCurrency from "../helpers/displayCurrency";
import addToCart from "../helpers/addToCart";
import Context from "../context";

const VerticalCardProduct = ({ category, heading }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();
  const { fetchUserAddToCart } = useContext(Context);

  const loadingList = new Array(13).fill(null);

  // ĐÃ SỬA LỖI: Bọc fetchData trong useCallback
  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetchCategoryWiseProduct(category);
    setData(res?.data || []);
    setLoading(false);
  }, [category]); // Hàm fetchData phụ thuộc vào 'category'

  useEffect(() => {
    // ĐÃ SỬA LỖI: Thêm fetchData vào mảng dependency
    fetchData();
  }, [fetchData]); // Chỉ phụ thuộc vào fetchData (là hàm useCallback)

  const handleAddToCart = async (e, id) => {
    await addToCart(e, id);
    fetchUserAddToCart();
  };

  const scroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += offset;
    }
  };

  const renderLoadingCard = (_, index) => (
    <div
      key={index}
      className="w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] bg-white rounded-sm shadow"
    >
      <div className="bg-slate-200 h-48 p-4 flex justify-center items-center animate-pulse" />
      <div className="p-4 grid gap-3">
        <div className="h-5 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-4 rounded-full bg-slate-200 animate-pulse" />
        <div className="flex gap-3">
          <div className="h-4 rounded-full bg-slate-200 w-full animate-pulse" />
          <div className="h-4 rounded-full bg-slate-200 w-full animate-pulse" />
        </div>
        <div className="h-6 rounded-full bg-slate-200 animate-pulse" />
      </div>
    </div>
  );

  const renderProductCard = (product, index) => (
    <Link
      key={index}
      to={`/product/${product?._id}`}
      className="w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] bg-white rounded-sm shadow"
    >
      <div className="bg-slate-200 h-48 p-4 flex justify-center items-center">
        <img
          alt={product?.productName}
          src={product?.productImage?.[0]}
          className="object-scale-down h-full hover:scale-110 transition-all mix-blend-multiply"
        />
      </div>
      <div className="p-4  grid gap-3">
        <h2 className="font-medium uppercase text-base md:text-lg text-ellipsis line-clamp-1 text-black">
          {product?.productName}
        </h2>
        <p className="capitalize text-slate-500">{product?.category}</p>
        <div className="gap-3">
          <p className="text-red-600 font-medium">
            {displayINRCurrency(product?.sellingPrice)}
          </p>
          <p className="text-slate-500 line-through">
            {displayINRCurrency(product?.price)}
          </p>
        </div>
        <button
          onClick={(e) => handleAddToCart(e, product._id)}
          className="relative inline-flex items-center justify-center px-4 py-1.5 overflow-hidden text-sm font-medium text-white rounded-full shadow-md bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg hover:shadow-pink-300"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 opacity-0 transition-opacity duration-300 hover:opacity-100 blur-md"></span>
          <span className="relative z-10 font-semibold">Thêm vào giỏ hàng</span>
        </button>
      </div>
    </Link>
  );

  return (
    <div className="container mx-auto px-4 my-6 relative">
      <h2 className="text-2xl uppercase font-semibold py-4">{heading}</h2>

      <div
        ref={scrollRef}
        className="flex items-center gap-3 md:gap-6 overflow-x-scroll scrollbar-none transition-all"
      >
        <button
          className="bg-white shadow-md rounded-full p-1 absolute left-0 text-lg hidden md:block"
          onClick={() => scroll(-300)}
        >
          <FaAngleLeft />
        </button>
        <button
          className="bg-white shadow-md rounded-full p-1 absolute right-0 text-lg hidden md:block"
          onClick={() => scroll(300)}
        >
          <FaAngleRight />
        </button>

        {loading
          ? loadingList.map(renderLoadingCard)
          : data.map(renderProductCard)}
      </div>
    </div>
  );
};

export default VerticalCardProduct;
