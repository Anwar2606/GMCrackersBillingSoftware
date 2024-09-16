// import React, { useState } from "react";
// import * as XLSX from "xlsx";
// import { db, storage } from "../firebase";
// import { collection, addDoc } from "firebase/firestore";
// import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// import "./BulkUpload.css"; 

// const BulkUpload = () => {
//   const [products, setProducts] = useState([]);
//   const [file, setFile] = useState(null);
//   const [fileName, setFileName] = useState("");
//   const [dragging, setDragging] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     setFile(file);
//     setFileName(file.name);
//   };

//   const handleFileUpload = () => {
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = async (event) => {
//       const fileData = event.target.result;
//       const workbook = XLSX.read(fileData, { type: "binary" });
//       const sheetName = workbook.SheetNames[0];
//       const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
//       setProducts(worksheet);
//     };
//     reader.readAsBinaryString(file);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     const productCollection = collection(db, "products");

//     for (const product of products) {
//       if (!product.name || !product.saleprice || !product.regularprice) {
//         console.error("Missing field(s) in product: ", product);
//         continue;
//       }
//       const productData = {
//         sno:product.sno,
//         name: product.name.trim(),
//         saleprice: parseFloat(product.saleprice),
//         regularprice: parseInt(product.regularprice),
//         category:product.category
        
//       };
//       if (isNaN(productData.saleprice) || isNaN(productData.regularprice)) {
//         console.error("Invalid price or quantity for product:", product);
//         continue;
//       }
//       try {
//         await addDoc(productCollection, productData);
//       } catch (error) {
//         console.error("Error adding document: ", error);
//       }
//     }
//     setProducts([]);
//     setFileName("");
//     setUploadProgress(0);
//   };
//   const handleDragOver = (event) => {
//     event.preventDefault();
//     setDragging(true);
//   };
//   const handleDragLeave = () => {
//     setDragging(false);
//   };
//   const handleDrop = (event) => {
//     event.preventDefault();
//     setDragging(false);
//     const file = event.dataTransfer.files[0];
//     setFile(file);
//     setFileName(file.name);
//   };
//   return (
//     <div className="container">
//       <h1 className="header">Bulk Upload Products</h1>
//       <form onSubmit={handleSubmit}>
//         <div
//           className={`file-drop-zone ${dragging ? "dragging" : ""}`}
//           onDragOver={handleDragOver}
//           onDragLeave={handleDragLeave}
//           onDrop={handleDrop}
//         >
//           <label htmlFor="fileUpload" className="file-label">
//             Drag and drop a file here, or click to select a file
//           </label>
//           <input
//             id="fileUpload"
//             type="file"
//             accept=".csv, .xlsx, .xls"
//             onChange={handleFileChange}
//             style={{ display: "none" }}
//           />
//           {fileName && <p className="file-name">{fileName}</p>}
//         </div><br></br>
//         <div className="buttons">
//           <button className="btn" type="button" onClick={handleFileUpload}>
//             Upload File
//           </button>
//           <button className="btn" type="submit">Submit to Firestore</button>
//         </div>
//         {uploadProgress > 0 && (
//           <div className="progress-bar">
//             <div
//               className="progress-bar-fill"
//               style={{ width: `${uploadProgress}%` }}
//             ></div>
//           </div>
//         )}
//       </form>
//     </div>
//   );
// };

// export default BulkUpload;
// import React, { useState } from "react";
// import * as XLSX from "xlsx";
// import { db, storage } from "../firebase";
// import { collection, addDoc } from "firebase/firestore";
// import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// import "./BulkUpload.css"; 

// const BulkUpload = () => {
//   const [products, setProducts] = useState([]);
//   const [file, setFile] = useState(null);
//   const [fileName, setFileName] = useState("");
//   const [dragging, setDragging] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     setFile(file);
//     setFileName(file.name);
//   };

//   const handleFileUpload = () => {
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = async (event) => {
//       const fileData = event.target.result;
//       const workbook = XLSX.read(fileData, { type: "binary" });
//       const sheetName = workbook.SheetNames[0];
//       const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
//       setProducts(worksheet);
//     };
//     reader.readAsBinaryString(file);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     const productCollection = collection(db, "products");

//     for (const product of products) {
//       // Check if the required fields are present
//       if (!product.name || !product.saleprice || !product.regularprice ) {
//         console.error("Missing field(s) in product: ", product);
//         continue;
//       }

//       const productData = {
//         sno: product.sno,
//         name: product.name.trim(),
//         saleprice: parseFloat(product.saleprice),
//         regularprice: parseInt(product.regularprice),
//         category: product.category,
//         inStock: product.inStock === "false" || product.inStock === true // Ensures a boolean value
//       };

//       // Validate saleprice and regularprice
//       if (isNaN(productData.saleprice) || isNaN(productData.regularprice)) {
//         console.error("Invalid price or quantity for product:", product);
//         continue;
//       }

//       try {
//         await addDoc(productCollection, productData);
//       } catch (error) {
//         console.error("Error adding document: ", error);
//       }
//     }

//     setProducts([]);
//     setFileName("");
//     setUploadProgress(0);
//   };

//   const handleDragOver = (event) => {
//     event.preventDefault();
//     setDragging(true);
//   };

//   const handleDragLeave = () => {
//     setDragging(false);
//   };

//   const handleDrop = (event) => {
//     event.preventDefault();
//     setDragging(false);
//     const file = event.dataTransfer.files[0];
//     setFile(file);
//     setFileName(file.name);
//   };

//   return (
//     <div className="container">
//       <h1 className="header">Bulk Upload Products</h1>
//       <form onSubmit={handleSubmit}>
//         <div
//           className={`file-drop-zone ${dragging ? "dragging" : ""}`}
//           onDragOver={handleDragOver}
//           onDragLeave={handleDragLeave}
//           onDrop={handleDrop}
//         >
//           <label htmlFor="fileUpload" className="file-label">
//             Drag and drop a file here, or click to select a file
//           </label>
//           <input
//             id="fileUpload"
//             type="file"
//             accept=".csv, .xlsx, .xls"
//             onChange={handleFileChange}
//             style={{ display: "none" }}
//           />
//           {fileName && <p className="file-name">{fileName}</p>}
//         </div>
//         <br />
//         <div className="buttons">
//           <button className="btn" type="button" onClick={handleFileUpload}>
//             Upload File
//           </button>
//           <button className="btn" type="submit">Submit to Firestore</button>
//         </div>
//         {uploadProgress > 0 && (
//           <div className="progress-bar">
//             <div
//               className="progress-bar-fill"
//               style={{ width: `${uploadProgress}%` }}
//             ></div>
//           </div>
//         )}
//       </form>
//     </div>
//   );
// };

// export default BulkUpload;
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import "./BulkUpload.css"; 

const BulkUpload = () => {
  const [products, setProducts] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessages, setErrorMessages] = useState([]);

  // Handle file selection via input
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  // Handle file upload (parsing the Excel file)
  const handleFileUpload = () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileData = event.target.result;
        const workbook = XLSX.read(fileData, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
        
        // Optional: Validate headers
        const requiredHeaders = ["sno", "name", "saleprice", "regularprice", "category", "inStock"];
        const fileHeaders = Object.keys(worksheet[0] || {});
        const missingHeaders = requiredHeaders.filter(header => !fileHeaders.includes(header));

        if (missingHeaders.length > 0) {
          alert(`Missing required columns: ${missingHeaders.join(", ")}`);
          return;
        }

        setProducts(worksheet);
        alert("File uploaded and parsed successfully.");
      } catch (error) {
        console.error("Error reading file:", error);
        alert("There was an error reading the file. Please ensure it's a valid Excel file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Handle form submission to Firestore
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (products.length === 0) {
      alert("No products to submit. Please upload a file first.");
      return;
    }

    const productCollection = collection(db, "products");
    const errors = [];

    for (const [index, product] of products.entries()) {
      // Check for required fields
      if (
        !product.name ||
        product.saleprice === undefined ||
        product.regularprice === undefined ||
        product.inStock === undefined
      ) {
        errors.push(`Row ${index + 2}: Missing required field(s).`);
        continue;
      }

      // Parse and validate fields
      const saleprice = parseFloat(product.saleprice);
      const regularprice = parseInt(product.regularprice, 10);
      
      // Handle inStock as boolean
      let inStock;
      if (typeof product.inStock === "boolean") {
        inStock = product.inStock;
      } else if (typeof product.inStock === "string") {
        inStock = product.inStock.toLowerCase() === "true";
      } else if (typeof product.inStock === "number") {
        inStock = product.inStock > 0;
      } else {
        inStock = false; // Default to false if unable to parse
      }

      // Validate numerical fields
      if (isNaN(saleprice) || isNaN(regularprice)) {
        errors.push(`Row ${index + 2}: Invalid saleprice or regularprice.`);
        continue;
      }

      const productData = {
        sno: product.sno || "", // Optional field
        name: product.name.trim(),
        saleprice,
        regularprice,
        category: product.category || "Uncategorized", // Default category if missing
        inStock,
      };

      try {
        await addDoc(productCollection, productData);
      } catch (error) {
        console.error(`Row ${index + 2}: Error adding document:`, error);
        errors.push(`Row ${index + 2}: Failed to add to Firestore.`);
      }
    }

    // Reset state after submission
    setProducts([]);
    setFileName("");
    setFile(null);
    setUploadProgress(0);

    if (errors.length > 0) {
      setErrorMessages(errors);
      alert(`Bulk upload completed with some errors. Check console for details.`);
    } else {
      alert("Bulk upload completed successfully!");
    }
  };

  // Handle drag events for drag-and-drop functionality
  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  };

  return (
    <div className="container">
      <h1 className="header">Bulk Upload Products</h1>
      <form onSubmit={handleSubmit}>
        <div
          className={`file-drop-zone ${dragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label htmlFor="fileUpload" className="file-label">
            Drag and drop a file here, or click to select a file
          </label>
          <input
            id="fileUpload"
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {fileName && <p className="file-name">{fileName}</p>}
        </div>
        <br />
        <div className="buttons">
          <button className="btn" type="button" onClick={handleFileUpload}>
            Upload File
          </button>
          <button className="btn" type="submit">Submit to Firestore</button>
        </div>
        {uploadProgress > 0 && (
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
        {/* Display error messages if any */}
        {errorMessages.length > 0 && (
          <div className="error-messages">
            <h3>Errors:</h3>
            <ul>
              {errorMessages.map((msg, idx) => (
                <li key={idx} style={{ color: "red" }}>{msg}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
};

export default BulkUpload;
