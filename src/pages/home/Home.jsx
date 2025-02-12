import React, { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard/ProductCard";
import axios from "axios";
import "../../App.css";

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/products", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setProducts(response.data || []);
      } catch (error) {
        console.error("상품 정보를 불러오는 중 오류 발생:", error);
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
  
      // ✅ 서버에서 반환된 데이터로 상태 업데이트
      const { likedByCurrentUser, likeCount } = response.data;
  
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === product.id
            ? { ...p, likedByCurrentUser, likeCount }
            : p
        )
      );
    } catch (error) {
      console.error("좋아요 처리 중 오류 발생:", error);
    }
  };  

  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={{
            id: product.id,
            imageUrl: product.images && product.images.length > 0
              ? `${product.images[0]}`
              : "/default-image.jpg",
            title: product.name,
            description: product.brandName,
            price: product.price ? product.price.toLocaleString() : "0",
            likedByCurrentUser: product.likedByCurrentUser,
            likeCount: product.likeCount,
          }}
          onLikeToggle={() => handleLikeToggle(product)}
        />
      ))}
    </div>
  );
}

export default Home;
