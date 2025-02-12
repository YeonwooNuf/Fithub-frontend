import React, { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard/ProductCard";
import axios from "axios";
import "../../App.css";

function Home() {
  const [products, setProducts] = useState([]); // ✅ 초기값 빈 배열
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태
  const [error, setError] = useState(null);     // ✅ 에러 처리

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/products", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        console.log("✅ API 응답:", response.data); // ✅ API 응답 확인

        // ✅ 배열인지 확인 후 처리
        if (Array.isArray(response.data.products)) {
          setProducts(response.data.products);
        } else {
          setProducts([]); // 배열이 아니면 빈 배열
        }
      } catch (error) {
        console.error("❌ 상품 정보를 불러오는 중 오류 발생:", error);
        setError("상품 정보를 불러오는 데 실패했습니다."); // ✅ 에러 메시지
      } finally {
        setLoading(false); // ✅ 로딩 종료
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

      console.log("👍 좋아요 응답:", response.data); // ✅ 응답 확인

      const { likedByCurrentUser, likeCount } = response.data;

      // ✅ 상태 업데이트
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

  // ✅ 로딩 및 에러 상태 처리
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
              title: product.name || "상품명 없음",           // ✅ 데이터 검증
              description: product.brandName || "브랜드 없음",
              price: product.price
                ? product.price.toLocaleString()
                : "0",
              likedByCurrentUser: product.likedByCurrentUser || false,
              likeCount: product.likeCount || 0,
            }}
            onLikeToggle={() => handleLikeToggle(product)}
          />
        ))
      ) : (
        <p>표시할 상품이 없습니다.</p> // ✅ 상품이 없을 경우 메시지 표시
      )}
    </div>
  );
}

export default Home;
