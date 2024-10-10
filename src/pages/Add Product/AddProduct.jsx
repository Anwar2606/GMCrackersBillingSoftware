import React, { useState } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc } from 'firebase/firestore';
import './Addproduct.css'; 
const AddProduct = () => {
  const [sno, setSno] = useState('');
  const [inStock, setInStock] = useState(true);
  const [name, setName] = useState('');
  const [saleprice, setSalePrice] = useState('');
  const [regularprice, setRegularPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState(''); 
  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'products'), {
        sno,
        name,
        inStock,
        saleprice: parseFloat(saleprice),
        regularprice: parseFloat(regularprice),
        quantity: parseInt(quantity),
        category, 
        discount: 0,
      });
      setSno('');
      setName('');
      setSalePrice('');
      setRegularPrice('');
      setQuantity('');
      setInStock('');
      setCategory('');
      alert('Product added successfully!');
      window.location.reload();
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        <h2>Add Product</h2>
        <form onSubmit={handleAddProduct} className="add-product-form">
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Name" 
            required 
          />
          <input 
            type="number" 
            value={saleprice} 
            onChange={(e) => setSalePrice(e.target.value)} 
            placeholder="Sale Price" 
            required 
          />
          <input 
            type="number" 
            value={regularprice} 
            onChange={(e) => setRegularPrice(e.target.value)} 
            placeholder="Regular Price" 
            required 
          />
          <input 
            type="text" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            placeholder="Quantity" 
            required 
          />
          <select 
             className="custom-select"
              value={inStock} 
              onChange={(e) => setInStock(e.target.value)} 
              required
            >
               <option value="" disabled>InStock</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
              
            </select><br></br>
            <select 
             className="custom-select"
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              required
            >
              <option value="" disabled>Select Category</option>
              <option value="ONE SOUND">ONE SOUND</option>
        <option value="DAMAL CRACKERS">DAMAL CRACKERS</option>
        <option value="SPARKLERS">SPARKLERS</option>
        <option value="TWINKLING STARS">TWINKLING STARS</option>
        <option value="BIGILI CRACKERS">BIGILI CRACKERS</option>
        <option value="FLOWER POTS">FLOWER POTS</option>
        <option value="CHAKKARS">CHAKKARS</option>
        <option value="SPINNERS">SPINNERS</option>
        <option value="VANITHA SPECIALS">VANITHA SPECIALS</option>
        <option value="CHILDREN HAPPY CRACKERS">
        CHILDREN HAPPY CRACKERS
        </option>
        <option value="SKY SHOTS">SKY SHOTS</option>
        <option value="REPEATING SHOTS">REPEATING SHOTS</option>
        <option value="SHOWERS">SHOWERS</option>
        <option value="MATCHES">MATCHES</option>
        <option value="GARLAND">GARLAND</option>
        <option value="SPEACIAL CRACKERS">SPEACIAL CRACKERS</option>
        <option value="SONY SERIES">SONY SERIES</option>
        <option value="SONY CHILDREN PISTOL">SONY CHILDREN PISTOL</option>
        <option value="GIFTBOX REGULAR">GIFTBOX REGULAR</option>
        <option value="ROBO BRAND GIFT BOXES">ROBO BRAND GIFT BOXES</option>
            </select>
          <button type="submit">Add Product</button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
