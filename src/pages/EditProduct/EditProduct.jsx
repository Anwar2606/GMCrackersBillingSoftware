// // src/components/EditProductPage.js
// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { db, storage } from "../firebase";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import './EditProduct.css';

// const EditProductPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [product, setProduct] = useState(null);
//   const [name, setName] = useState("");
//   const [sno, setSno] = useState("");
//   const [regularprice, setRegularPrice] = useState(0);
//   const [saleprice, setSalePrice] = useState(0);
//   const [image, setImage] = useState(null);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       const productDoc = doc(db, "products", id);
//       const docSnap = await getDoc(productDoc);
//       if (docSnap.exists()) {
//         const productData = docSnap.data();
//         setProduct(productData);
//         setName(productData.name);
//         setSno(productData.sno);
//         setRegularPrice(productData.regularprice);
//         setSalePrice(productData.saleprice);
//         // setQuantity(productData.quantity);
//       }
//     };

//     fetchProduct();
//   }, [id]);

//   const handleFileChange = (event) => {
//     setImage(event.target.files[0]);
//   };

//   const handleUpdate = async () => {
   

//     const productData = {
//       name,
//       sno,
//       regularprice: parseFloat(regularprice),
//       saleprice: parseInt(saleprice),
//       // imageUrl,
//     };

//     const productRef = doc(db, "products", id);
//     await updateDoc(productRef, productData);

//     navigate("/products");
//   };

//   if (!product) return <div>Loading...</div>;

//   return (
//     <div className="Edit-page">
//       <h2 className="Page-title">Edit Product</h2>
//       <label>Product name:</label>
//       <input
//       className="Edit-input1"
//         type="text"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         placeholder="Product Name"
//       />
//       <label>Product code:</label>
//       <input
//       className="Edit-input1"
//         type="text"
//         value={sno}
//         onChange={(e) => setSno(e.target.value)}
//         placeholder="Product Code"
//       />
//       <label>Regular Price:</label>
//       <input
//       className="Edit-input2"
//         type="number"
//         value={regularprice}
//         onChange={(e) => setRegularPrice(e.target.value)}
//         placeholder="Regular Price"
//       />
//        <label>Sale Price:</label>
//      <input
//       className="Edit-input2"
//         type="number"
//         value={saleprice}
//         onChange={(e) => setSalePrice(e.target.value)}
//         placeholder="Sale Price"
//       />
//       <input type="file" className="Edit-input3" onChange={handleFileChange} style={{display:"none"}}/>
//       <button className="Edit-btn" onClick={handleUpdate}>Update</button>
//       <button className="Edit-btn" onClick={() => navigate("/products")}>Cancel</button>
//     </div>
//   );
// };

// export default EditProductPage;
// src/components/EditProductPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import './EditProduct.css';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [sno, setSno] = useState("");
  const [inStock, setInStock] = useState(false);
  const [regularPrice, setRegularPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      const productDoc = doc(db, "products", id);
      const docSnap = await getDoc(productDoc);
      if (docSnap.exists()) {
        const productData = docSnap.data();
        setProduct(productData);
        setName(productData.name);
        setQuantity(productData.quantity);
        setInStock(productData.inStock);
        setSno(productData.sno);
        setRegularPrice(productData.regularprice);
        setSalePrice(productData.saleprice);
        setCategory(productData.category);
      }
    };

    fetchProduct();
  }, [id]);

  const handleUpdate = async () => {
    const productData = {
      name,
      quantity,
      sno,
      inStock,
      regularprice: parseFloat(regularPrice),
      saleprice: parseInt(salePrice),
      category,
    };

    const productRef = doc(db, "products", id);
    await updateDoc(productRef, productData);

    navigate("/products");
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="Edit-page">
      <h2 className="Page-title">Edit Product</h2>
      <label>Product name:</label>
      <input
        className="Edit-input1"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product Name"
      />
      <label>Product code:</label>
      <input
        className="Edit-input1"
        type="text"
        value={sno}
        onChange={(e) => setSno(e.target.value)}
        placeholder="Product Code"
      />
      <label>Regular Price:</label>
      <input
        className="Edit-input2"
        type="number"
        value={regularPrice}
        onChange={(e) => setRegularPrice(e.target.value)}
        placeholder="Regular Price"
      />
      <label>Sale Price:</label>
      <input
        className="Edit-input2"
        type="number"
        value={salePrice}
        onChange={(e) => setSalePrice(e.target.value)}
        placeholder="Sale Price"
      />
      <label>quantity:</label>
      <input
        className="Edit-input1"
        type="text"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="Quantity"
      />
       <label>Instock:</label>
      <select
        className="custom-select"
        value={inStock}
        onChange={(e) => setInStock(e.target.value)}
      >
       <option value="true" >True</option>

        <option value="false">False</option>
        
      </select><br></br><br></br>
      <label>Category:</label>
      <select
        className="custom-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
       <option value="" disabled>Select Category</option>

        <option value="ONE SOUND CRACKERS">ONE SOUND CRACKERS</option>
        <option value="SPARKLERS">SPARKLERS</option>
        <option value="BIGILI CRACKERS">BIGILI CRACKERS</option>
        <option value="VANITHA SPECIALS">VANITHA SPECIALS</option>
        <option value="CHILDRENS HAPPY CRACKERS">
          CHILDRENS HAPPY CRACKERS
        </option>
        <option value="SKYSHOTS">SKYSHOTS</option>
        <option value="REPEATING SHOTS">REPEATING SHOTS</option>
        <option value="SHOWERS">T.STARS / CANDLE / PENCIL</option>
        <option value="TWINKLING STAR">TWINKLING STAR</option>
        <option value="GARLAND">GARLAND</option>
        <option value="MATCHES">MATCHES</option>
        <option value="WALA CRACKERS">WALA CRACKERS</option>
        <option value="GIFT BOXES">GIFT BOXES</option>
        <option value="BOMBS">BOMBS</option>
      </select>
      <button className="Edit-btn" onClick={handleUpdate}>Update</button>
      <button className="Edit-btn" onClick={() => navigate("/products")}>Cancel</button>
    </div>
  );
};

export default EditProductPage;
