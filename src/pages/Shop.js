import React, { useEffect, useState } from "react";

export default function Shop() {
  const [products, setProducts] = useState([]);  // Corrected here

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/products.json`)

      .then((res) => res.json())
      .then((data) => setProducts(data))  // Use setProducts here
      .catch((err) => console.error("Failed to load products:", err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Diabetes Accessory Shop 🛍️</h2>
      <p className="text-lg text-center mb-6">
        Browse curated items made for people with diabetes – from CGM patches to fun accessories!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <div key={index} className="border rounded-xl shadow p-4 text-center hover:shadow-md transition">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-48 object-contain mb-2 rounded-md"
            />
            <h3 className="font-semibold text-lg">{product.title}</h3>
            <p className="text-pink-600 font-medium">{product.price}</p>
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              View Product
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}



