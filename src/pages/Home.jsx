import React, { useEffect, useState } from "react";

function Home() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    fetch("/api/sales")
      .then((response) => response.json())
      .then((data) => setSales(data))
      .catch((error) => console.error("Error fetching sales:", error));
  }, []);

  return (
    <div>
      <h1>Sales</h1>
      <ul>
        {sales.map((sale) => (
          <li key={sale.id}>
            {sale.title} - ${sale.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
