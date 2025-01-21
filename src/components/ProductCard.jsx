import React from "react";

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.title} />
      <div className="product-info">
        <h3>{product.title}</h3>
        <p>{product.description}</p>
        <p className="price">{product.price} 원</p>
      </div>
    </div>
  );
}

export default ProductCard;
