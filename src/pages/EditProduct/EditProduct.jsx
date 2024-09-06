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
  const [sno, setSno] = useState("");
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
      sno,
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
      <label>Category:</label>
      <select
        className="custom-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
       <option value="" disabled>Select Category</option>
              <option value="ONE & TWO SOUND CRACKERS">ONE & TWO SOUND CRACKERS</option>
              <option value="GROUND CHAKKAR">GROUND CHAKKAR</option>
              <option value="FLOWER POTS">FLOWER POTS</option>
              <option value="BOMB">BOMB</option>
              <option value="TWINKLING STAR">TWINKLING STAR</option>
              <option value="MAGIC PENCIL">MAGIC PENCIL</option>
              <option value="ROCKETS">ROCKETS</option>
              <option value="FOUNTAIN">FOUNTAIN</option>
              <option value="MATCH BOX">MATCH BOX</option>
              <option value="KIDS FANCY">KIDS FANCY</option>
              <option value="DELUXE CRACKERS">DELUXE CRACKERS</option>
              <option value="MULTI COLOUR SHOTS">MULTI COOUR SHOTS</option>
              <option value="SPARKLES">SPARKLES</option>
              <option value="BIJILI CRACKERS">BIJILI CRACKERS</option>
              <option value="2 COMET">2" COMET</option>
              <option value="2 COMET - 3 PCS">2" COMET - 3 PCS</option>
              <option value="4 COMET - 2 PCS">4" COMET - 2 PCS</option>
              <option value="31/2 COMETS">31/2" COMETS</option>
              <option value="CHOTTA FANCY">CHOTTA FANCY</option>
              <option value="RIDER">RIDER</option>
              <option value="DIGITAL LAR (WALA)">DIGITAL LAR (WALA)</option>
              <option value="PEPPER BOMB">PEPPER BOMB</option>
              <option value="GIFT BOX VARIETIES">GIFT BOX VARIETIES</option>
      </select>
      <button className="Edit-btn" onClick={handleUpdate}>Update</button>
      <button className="Edit-btn" onClick={() => navigate("/products")}>Cancel</button>
    </div>
  );
};

export default EditProductPage;
