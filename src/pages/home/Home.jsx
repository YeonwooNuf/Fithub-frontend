import React, { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard/ProductCard";
import axios from "axios";
import "../../App.css";

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");  // ✅ 로컬 스토리지에서 JWT 토큰 가져오기
        const response = await axios.get("/api/products", {
          headers: {
            Authorization: `Bearer ${token}`,          // ✅ Authorization 헤더에 토큰 추가
          },
        });
        setProducts(response.data.products || []);
      } catch (error) {
        console.error("상품 정보를 불러오는 중 오류 발생:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={{
            imageUrl: product.images && product.images.length > 0
              ? `${product.images[0]}`
              : "/default-image.jpg",
            title: product.name,
            description: product.brandName,
            price: product.price ? product.price.toLocaleString() : "0",
          }}
          
        />
      ))}
    </div>
  );
}

export default Home;
