import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import axios from "axios";
import "./Shop.css";

function Shop() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // 🔍 필터 상태
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedBrand, setSelectedBrand] = useState("전체");
  const [searchKeyword, setSearchKeyword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/products", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const productList = response.data.products || [];
        setProducts(productList);
        setFilteredProducts(productList);

        // ✅ 카테고리/브랜드 목록 추출 (중복 제거)
        const allCategories = [...new Set(productList.map(p => p.category))];
        const allBrands = [...new Set(productList.map(p => p.brandName))];
        setCategories(["전체", ...allCategories]);
        setBrands(["전체", ...allBrands]);

      } catch (error) {
        console.error("❌ 상품 정보를 불러오는 중 오류 발생:", error);
        setError("상품 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 🔍 필터링 조건 적용
  useEffect(() => {
    const result = products.filter((product) => {
      const matchesCategory = selectedCategory === "전체" || product.category === selectedCategory;
      const matchesBrand = selectedBrand === "전체" || product.brandName === selectedBrand;
      const matchesKeyword =
        product.name.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchesCategory && matchesBrand && matchesKeyword;
    });

    setFilteredProducts(result);
  }, [products, selectedCategory, selectedBrand, searchKeyword]);

  const handleLikeToggle = async (product) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("좋아요 기능은 로그인 후 이용할 수 있습니다.");
        return;
      }

      const response = await axios.post(
        "/api/likes/toggle",
        { productId: product.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { likedByCurrentUser, likeCount } = response.data;

      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === product.id
            ? { ...p, likedByCurrentUser, likeCount }
            : p
        )
      );
    } catch (error) {
      console.error("❌ 좋아요 처리 중 오류 발생:", error);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="shop-container">
      {/* 🔍 필터 바 */}
      <div className="filter-bar">
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>

        <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
          {brands.map((brand, idx) => (
            <option key={idx} value={brand}>{brand}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="상품명 검색"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>

      {/* 🧷 상품 목록 */}
      <div className="product-list">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                imageUrl:
                  product.images && product.images.length > 0
                    ? `${product.images[0]}`
                    : "/default-image.jpg",
                title: product.name || "상품명 없음",
                description: product.brandName || "브랜드 없음",
                price: product.price
                  ? product.price.toLocaleString()
                  : "0",
                likedByCurrentUser: product.likedByCurrentUser || false,
                likeCount: product.likeCount || 0,
              }}
              onClick={() => handleProductClick(product.id)}
              onLikeToggle={() => handleLikeToggle(product)}
            />
          ))
        ) : (
          <p>조건에 맞는 상품이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default Shop;
