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
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderRef = React.useRef(null);

    // ✅ JSON 데이터를 안전하게 변환하는 함수 (함수를 먼저 정의)
    const parseJSON = (data) => {
        try {
            let parsedData = JSON.parse(data);
            if (typeof parsedData === "string") {
                parsedData = JSON.parse(parsedData);
            }
            return Array.isArray(parsedData) ? parsedData : [];
        } catch (error) {
            console.error("❌ JSON 파싱 오류:", error);
            return [];
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const response = await axios.get(`/api/products/${id}`, { headers });

                console.log("✅ 상품 상세 API 응답:", response.data);
                setProduct(response.data);

                // ✅ JSON 데이터 파싱 후 첫 번째 값 선택
                const sizes = parseJSON(response.data.sizes);
                const colors = parseJSON(response.data.colors);

                if (sizes.length > 0) {
                    setSelectedSize(sizes[0]);
                }
                if (colors.length > 0) {
                    setSelectedColor(colors[0]);
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

    // ✅ JSON 문자열을 배열로 변환
    const parsedSizes = parseJSON(product.sizes);
    const parsedColors = parseJSON(product.colors);

    return (
        <div className="product-detail">
            <div className="product-image-container">
                {/* ✅ 상품 이미지 슬라이더 */}
                <Slider 
                    ref={sliderRef} 
                    dots={true} // ✅ 기본 dots 유지
                    infinite={true}
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                    autoplay={true}
                    autoplaySpeed={3000}
                    pauseOnHover={true}
                    swipe={true}
                    beforeChange={(oldIndex, newIndex) => setCurrentSlide(newIndex)}
                    className="product-slider"
                >
                    {product.images?.map((image, index) => (
                        <div key={index} className="slider-image-container">
                            <img src={image} alt={`${product.name} ${index + 1}`} className="slider-image" />
                        </div>
                    ))}
                </Slider>

                {/* ✅ 썸네일 컨테이너 (상품 이미지 오른쪽에 배치) */}
                <div className="thumbnail-container">
                    {product.images?.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`썸네일 ${index + 1}`}
                            className={index === currentSlide ? "active" : ""}
                            onClick={() => sliderRef.current.slickGoTo(index)}
                        />
                    ))}
                </div>
            </div>

            <div className="product-info">
                {/* ✅ 브랜드 정보 */}
                <div className="brand-info">
                    {product.brandLogoUrl && (
                        <img src={product.brandLogoUrl} alt={product.brandName} className="brand-logo" />
                    )}
                    <div className="brand-text">
                        <p className="brand-name">{product.brandName || "알 수 없음"}</p>
                        {product.brandSubName && <p className="brand-subname">{product.brandSubName}</p>}
                    </div>
                </div>

                <h1>{product.name}</h1>
                <p className="description">{product.description}</p>
                <p className="price">{product.price?.toLocaleString()} 원</p>

                {/* ✅ 사이즈 선택 (드롭다운) */}
                {parsedSizes.length > 0 && (
                    <div className="size-selector">
                        <h4>사이즈 선택</h4>
                        <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                            {parsedSizes.map((size, index) => (
                                <option key={index} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* ✅ 색상 선택 (드롭다운) */}
                {parsedColors.length > 0 && (
                    <div className="color-selector">
                        <h4>색상 선택</h4>
                        <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                            {parsedColors.map((color, index) => (
                                <option key={index} value={color}>{color}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="action-buttons">
                    <button className="add-to-cart">장바구니에 담기</button>
                    <button className="payment">결제하기</button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
