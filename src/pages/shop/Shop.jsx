import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ useNavigate 추가
import ProductCard from "../../components/ProductCard/ProductCard";
import axios from "axios";
import "../../App.css";

function Shop() {
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);    
  const navigate = useNavigate(); // ✅ useNavigate 사용

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/products", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        console.log("✅ API 응답:", response.data);

        if (Array.isArray(response.data.products)) {
          setProducts(response.data.products);
        } else {
          setProducts([]); 
        }
      } catch (error) {
        console.error("❌ 상품 정보를 불러오는 중 오류 발생:", error);
        setError("상품 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

      console.log("👍 좋아요 응답:", response.data);

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

  // ✅ 상품 클릭 시 상세 페이지로 이동하는 함수
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`); // 상세 페이지 URL로 이동
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="product-list">
      {products.length > 0 ? (
        products.map((product) => (
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
            onClick={() => handleProductClick(product.id)} // ✅ 클릭 이벤트 추가
            onLikeToggle={() => handleLikeToggle(product)}
          />
        ))
      ) : (
        <p>표시할 상품이 없습니다.</p> 
      )}
    </div>
  );
}

export default Shop;
