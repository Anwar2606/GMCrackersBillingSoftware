import React, { useState } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc } from 'firebase/firestore';
import './Addproduct.css'; 
const AddProduct = () => {
  const [sno, setSno] = useState('');
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
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              required
            >
              <option value="" disabled>Select Category</option>
              <option value="ONE SOUND CRACKERS">ONE SOUND CRACKERS</option>
              <option value="SPARKLERS">SPARKLERS</option>
              <option value="BIJILI CRACKERS">BIJILI CRACKERS</option>
              <option value="VANITHA SPECIALS">VANITHA SPECIALS</option>
              <option value="CHILDRENS HAPPY CRACKERS">CHILDRENS HAPPY CRACKERS</option>
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
          <button type="submit">Add Product</button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
