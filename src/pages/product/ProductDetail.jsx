import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./ProductDetail.css";

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0); // ✅ 현재 슬라이드 상태 추가
    const sliderRef = React.useRef(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const response = await axios.get(`/api/products/${id}`, { headers });

                console.log("✅ 상품 상세 API 응답:", response.data);
                setProduct(response.data);

                if (response.data.sizes && response.data.sizes.length > 0) {
                    setSelectedSize(response.data.sizes[0]);
                }
                if (response.data.colors && response.data.colors.length > 0) {
                    setSelectedColor(response.data.colors[0]);
                }
            } catch (error) {
                console.error("❌ 상품 정보를 불러오는 중 오류 발생:", error);
                setError("상품 정보를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) return <p className="loading">로딩 중...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!product) return <p className="error">상품 정보를 찾을 수 없습니다.</p>;

    const parsedSizes = typeof product.sizes === "string" ? JSON.parse(product.sizes) : product.sizes;
    const parsedColors = typeof product.colors === "string" ? JSON.parse(product.colors) : product.colors;

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
    };

    const handleColorSelect = (color) => {
        setSelectedColor(color);
    };

    // ✅ react-slick 슬라이더 설정 (점 버튼 활성화 + 썸네일 효과 추가)
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        swipe: true,
        beforeChange: (oldIndex, newIndex) => setCurrentSlide(newIndex), // ✅ 현재 슬라이드 업데이트
        customPaging: function(i) {
            return (
                <img
                    src={product.images[i]}
                    alt={`썸네일 ${i + 1}`}
                    className={`thumbnail-image ${i === currentSlide ? "active" : "inactive"}`}
                />
            );
        },
        dotsClass: "slick-dots custom-dots"
    };

    return (
        <div className="product-detail">
            <div className="product-image-container">
                <Slider ref={sliderRef} {...sliderSettings} className="product-slider">
                    {product.images?.map((image, index) => (
                        <div key={index} className="slider-image-container">
                            <img src={image} alt={`${product.name} ${index + 1}`} className="slider-image" />
                        </div>
                    ))}
                </Slider>
            </div>

            <div className="product-info">
                <h1>{product.name}</h1>
                <p className="brand">브랜드: {product.brandName || "알 수 없음"}</p>
                <p className="description">{product.description}</p>
                <p className="price">{product.price?.toLocaleString()} 원</p>

                {parsedSizes && parsedSizes.length > 0 && (
                    <div className="size-selector">
                        <h4>사이즈 선택</h4>
                        {parsedSizes.map((size, index) => (
                            <button
                                key={index}
                                className={`size-button ${selectedSize === size ? "selected" : ""}`}
                                onClick={() => handleSizeSelect(size)}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                )}

                {parsedColors && parsedColors.length > 0 && (
                    <div className="color-selector">
                        <h4>색상 선택</h4>
                        {parsedColors.map((color, index) => (
                            <button
                                key={index}
                                className={`color-button ${selectedColor === color ? "selected" : ""}`}
                                onClick={() => handleColorSelect(color)}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                )}

                <button className="add-to-cart">장바구니에 담기</button>
                <button className="payment">결제하기</button>
            </div>
        </div>
    );
};

export default ProductDetail;
