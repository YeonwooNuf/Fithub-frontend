// import React from "react";
// import { Link } from "react-router-dom";
// import "./CategoryShowcase.css";

// const CategoryShowcase = () => {
//   const categories = [
//     {
//       id: 1,
//       name: "상의",
//       path: "/shop/category/top",
//       image: "/category-top.jpg",
//       description: "편안하고 스타일리시한 상의 컬렉션"
//     },
//     {
//       id: 2,
//       name: "하의",
//       path: "/shop/category/bottom",
//       image: "/category-bottom.jpg",
//       description: "다양한 스타일의 하의 컬렉션"
//     },
//     {
//       id: 3,
//       name: "아우터",
//       path: "/shop/category/outer",
//       image: "/category-outer.jpg", 
//       description: "계절에 맞는 다양한 아우터"
//     },
//     {
//       id: 4,
//       name: "악세서리",
//       path: "/shop/category/accessory",
//       image: "/category-accessory.jpg",
//       description: "스타일을 완성하는 악세서리"
//     }
//   ];

//   return (
//     <section className="category-showcase">
//       <div className="category-container">
//         <h2 className="category-title">카테고리</h2>
//         <div className="category-grid">
//           {categories.map((category) => (
//             <Link 
//               to={category.path} 
//               className="category-card" 
//               key={category.id}
//             >
//               <div className="category-image-container">
//                 <img 
//                   src={category.image} 
//                   alt={category.name} 
//                   className="category-image"
//                   onError={(e) => {
//                     e.target.src = "/placeholder.jpg"; // 이미지 로드 실패 시 대체 이미지
//                   }}
//                 />
//               </div>
//               <div className="category-info">
//                 <h3 className="category-name">{category.name}</h3>
//                 <p className="category-description">{category.description}</p>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default CategoryShowcase; 