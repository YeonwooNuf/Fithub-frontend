import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import axios from "axios";
import "./Shop.css";

function Shop() {
  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const navigate = useNavigate();

  const [showPriceModal, setShowPriceModal] = useState(false);
  const [tempMinPrice, setTempMinPrice] = useState(0);
  const [tempMaxPrice, setTempMaxPrice] = useState(1000000);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/products", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setProducts(response.data.products || []);
      } catch (error) {
        console.error("❌ 상품 정보 로딩 실패:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleLikeToggle = async (product) => {
    console.log("🛠️ handleLikeToggle 진입:", product.id);
    const token = localStorage.getItem("token");
    if (!token) return alert("로그인이 필요합니다.");

    try {
      const res = await axios.post(
        "/api/likes/toggle",
        { productId: product.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { likedByCurrentUser, likeCount } = res.data;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, likedByCurrentUser, likeCount }
            : p
        )
      );
    } catch (err) {
      console.error("❌ 좋아요 처리 오류:", err);
    }
  };

  const filterProduct = (product) => {
    const matchKeyword = product.name.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchKeyword && matchPrice;
  };

  // ✅ 렌더링 시점에 브랜드별로 그룹핑
  const grouped = useMemo(() => {
    const result = {};
    products.forEach((product) => {
      const brand = product.brandName || "기타";
      if (!result[brand]) {
        result[brand] = {
          logo: product.brandLogoUrl || "/default-logo.png",
          subName: product.brandSubName || "",
          products: [],
        };
      }
      result[brand].products.push(product);
    });
    return result;
  }, [products]);

  return (
    <div className="shop-container">
      {/* 🔍 검색 및 필터 바 */}
      <div className="top-filter-bar">
        <input
          type="text"
          placeholder="상품명 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button onClick={() => setSearchKeyword(searchInput)}>검색</button>
        <button onClick={() => setShowPriceModal(true)}>가격 필터</button>
      </div>

      {/* 💸 가격 필터 모달 */}
      {showPriceModal && (
        <div className="modal-backdrop">
          <div className="price-modal">
            <h3>가격 필터 설정</h3>
            <div className="modal-content">
              <input
                type="number"
                placeholder="최소 가격"
                value={tempMinPrice}
                onChange={(e) => setTempMinPrice(+e.target.value)}
              />
              <input
                type="number"
                placeholder="최대 가격"
                value={tempMaxPrice}
                onChange={(e) => setTempMaxPrice(+e.target.value)}
              />
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowPriceModal(false)}>취소</button>
              <button
                onClick={() => {
                  setPriceRange([tempMinPrice, tempMaxPrice]);
                  setShowPriceModal(false);
                }}
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 브랜드별 상품 출력 */}
      {Object.entries(grouped).map(([brand, info]) => {
        const filtered = info.products.filter(filterProduct);
        if (filtered.length === 0) return null;

        return (
          <div key={brand} className="brand-section">
            <div className="brand-header">
              <img src={info.logo} alt={`${brand} logo`} className="brand-logo" />
              <div>
                <h2>{brand}</h2>
                <p>{info.subName}</p>
              </div>
            </div>
            <div className="product-list">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onLikeToggle={() => handleLikeToggle(product)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Shop;
