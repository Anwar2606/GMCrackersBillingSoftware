import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import the initialized firebase instance
import { collection, getDocs, addDoc, Timestamp, setDoc, getDoc, doc, updateDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './BillingCalculator.css'; // Import the CSS file

const BillingCalculator = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [category, setCategory] = useState('');
  let invoiceNumber = ''; 
  const [billingDetails, setBillingDetails] = useState({
    totalAmount: 0,
    discountPercentage: '',
    discountedTotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    grandTotal: 0,
  });
  const [customerName, setCustomerName] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceNumbers, setInvoiceNumbers] = useState('');
  const [customerGSTIN, setCustomerGSTIN] = useState('');
  const [customerPAN, setCustomerPAN] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [manualInvoiceNumber, setManualInvoiceNumber] = useState('');
  const [businessState, setBusinessState] = useState('YourBusinessState');
  const [searchTerm, setSearchTerm] = useState('');
  const [taxOption, setTaxOption] = useState('cgst_sgst');
  const [currentDate, setCurrentDate] = useState(new Date()); // State for current date
  const [showCustomerDetails, setShowCustomerDetails] = useState(false); // State for toggling customer details
  const handleInvoiceNumberChange = (event) => {
    setManualInvoiceNumber(event.target.value);
  };
  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     const productsCollectionRef = collection(db, 'products');
  //     try {
  //       const querySnapshot = await getDocs(productsCollectionRef);
  //       const fetchedProducts = querySnapshot.docs.map(doc => ({
  //         id: doc.id,
  //         ...doc.data()
  //       }));
  //       setProducts(fetchedProducts);
  //     } catch (error) {
  //       console.error('Error fetching products: ', error);
  //     }
  //   };

  //   fetchProducts();
  // }, []);



  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollectionRef = collection(db, 'products');
      try {
        const querySnapshot = await getDocs(productsCollectionRef);
        const fetchedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products: ', error);
      }
    };

    fetchProducts();
  }, []);

  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     const productsCollectionRef = collection(db, 'products');
  //     try {
  //       const querySnapshot = await getDocs(productsCollectionRef);
  //       const fetchedProducts = querySnapshot.docs.map(doc => ({
  //         id: doc.id,
  //         ...doc.data(),
  //         // Assuming 'inStock' is added to Firestore products
  //         inStock: doc.data().inStock || false // default to false if field not set
  //       }));
  //       setProducts(fetchedProducts);
  //     } catch (error) {
  //       console.error('Error fetching products: ', error);
  //     }
  //   };
  
  //   fetchProducts();
  // }, []);
  // useEffect(() => {
  //   const filterProducts = () => {
  //     let filtered = products;

  //     if (searchTerm) {
  //       filtered = filtered.filter(product => {
  //         const productName = product.name ? product.name.toLowerCase() : '';
  //         const productCode = product.sno ? product.sno.toLowerCase() : '';
  //         return productName.includes(searchTerm) || productCode.includes(searchTerm);
  //       });
  //     }

  //     if (category) {
  //       filtered = filtered.filter(product => product.category === category);
  //     }

  //     setFilteredProducts(filtered);
  //   };

  //   filterProducts();
  // }, [searchTerm, category, products]);


  useEffect(() => {
    const filterProducts = () => {
      let filtered = products;

      if (searchTerm) {
        filtered = filtered.filter(product => {
          const productName = product.name ? product.name.toLowerCase() : '';
          const productCode = product.sno ? product.sno.toLowerCase() : '';
          return productName.includes(searchTerm) || productCode.includes(searchTerm);
        });
      }

      if (category) {
        filtered = filtered.filter(product => product.category === category);
      }

      setFilteredProducts(filtered);
    };

    filterProducts();
  }, [searchTerm, category, products]);

  // useEffect(() => {
  //   const filterProducts = () => {
  //     let filtered = products;
  
  //     if (searchTerm) {
  //       filtered = filtered.filter(product => {
  //         const productName = product.name ? product.name.toLowerCase() : '';
  //         const productCode = product.sno ? product.sno.toLowerCase() : '';
  //         return productName.includes(searchTerm) || productCode.includes(searchTerm);
  //       });
  //     }
  
  //     if (category) {
  //       filtered = filtered.filter(product => product.category === category);
  //     }
  
  //     setFilteredProducts(filtered);
  //   };
  
  //   filterProducts();
  // }, [searchTerm, category, products]);
  

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };
  // const handleQuantityChange = (productId, quantity) => {
  //   const updatedCart = cart.map(item =>
  //     item.productId === productId ? { ...item, quantity: parseInt(quantity, 10) } : item
  //   );
  //   setCart(updatedCart);
  //   updateBillingDetails(updatedCart);
  // };
  const handleQuantityChange = (productId, quantity) => {
    const updatedCart = cart.map(item =>
      item.productId === productId ? { ...item, quantity: parseInt(quantity, 10) } : item
    );
    setCart(updatedCart);
    updateBillingDetails(updatedCart);
  };
  const updateBillingDetails = (updatedCart) => {
    const totalAmount = updatedCart.reduce((total, item) => {
      return total + (item.saleprice * item.quantity);
    }, 0);

    const discountPercentage = parseFloat(billingDetails.discountPercentage) || 0;
    const discountedTotal = totalAmount * (1 - discountPercentage / 100);

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxOption === 'cgst_sgst') {
      if (customerState === businessState) {
        cgstAmount = discountedTotal * 0.09;
        sgstAmount = discountedTotal * 0.09;
      } else {
        cgstAmount = discountedTotal * 0.09;
        sgstAmount = discountedTotal * 0.09;
      }
    } else if (taxOption === 'igst') {
      igstAmount = discountedTotal * 0.18;
    }

    const grandTotal = discountedTotal + cgstAmount + sgstAmount + igstAmount;

    setBillingDetails(prevState => ({
      ...prevState,
      totalAmount,
      discountedTotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      grandTotal,
    }));
  };
  const updateProductQuantity = async (productId, purchaseQuantity) => {
    const productRef = doc(db, 'products', productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      const newQuantity = product.quantity - purchaseQuantity;
      if (newQuantity < 0) {
        alert('Not enough stock available.');
        return;
      }
      await updateDoc(productRef, { quantity: newQuantity });
    }
  };

  const handleDiscountChange = (event) => {
    const discountPercentage = event.target.value;
    setBillingDetails(prevState => ({
      ...prevState,
      discountPercentage,
    }));
  };
  const ClearAllData =() => {
    window.location.reload();
  };

  useEffect(() => {
    updateBillingDetails(cart);
  }, [billingDetails.discountPercentage, customerState, taxOption]);
  function numberToWords(num) {
    const ones = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

    function convertHundreds(num) {
        let str = '';
        if (num > 99) {
            str += ones[Math.floor(num / 100)] + ' Hundred ';
            num %= 100;
        }
        if (num > 19) {
            str += tens[Math.floor(num / 10)] + ' ';
            num %= 10;
        }
        if (num > 9) {
            str += teens[num - 10] + ' ';
        } else if (num > 0) {
            str += ones[num] + ' ';
        }
        return str.trim();
    }

    function convertToWords(n) {
        if (n === 0) return 'Zero';

        let words = '';

        let i = 0;
        while (n > 0) {
            let rem = n % 1000;
            if (rem !== 0) {
                words = convertHundreds(rem) + ' ' + thousands[i] + ' ' + words;
            }
            n = Math.floor(n / 1000);
            i++;
        }
        return words.trim();
    }

    // Split the number into rupees and paise
    const rupees = Math.floor(num);
    // const paise = Math.round((num - rupees) * 100); // Not used as paise are ignored

    return convertToWords(rupees);
}



function formatGrandTotal(amount) {
  return `${Math.floor(amount).toString()}.00`;
}
const saveBillingDetails = async (newInvoiceNumber) => {
const invoiceNumber = manualInvoiceNumber.trim();
// if (!invoiceNumber) {
//   alert('Please enter a valid invoice number.');
//   return; // Exit the function if the invoice number is empty
// }
cart.forEach(async (item) => {
  await updateProductQuantity(item.productId, item.quantity);
});

const billingDocRef = collection(db, 'billing');
try {
  await addDoc(billingDocRef, {
    ...billingDetails,
    customerName,
    customerAddress,
    customerState,
    customerPhone,
    customerEmail,
    customerGSTIN,
   
    productsDetails: cart.map(item => ({
      productId: item.productId,
      name: item.name,
      saleprice: item.saleprice,
      quantity: item.quantity
    })),
    createdAt: Timestamp.fromDate(selectedDate),
    invoiceNumber, // Use the same invoice number
  });
    console.log('Billing details saved successfully in Firestore');
} catch (error) {
    console.error('Error saving billing details: ', error);
}
};


const generatePDF = (copyType, invoiceNumber) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20); // Draw border
 const imgData="data:image/png;base64,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" 
 doc.addImage(imgData, 'JPEG', 17, 22, 22, 22);
    // doc.addImage(imgData, 'JPEG', 17, 22, 22, 22);
    doc.setFontSize(10);
    doc.setTextColor(255, 0, 0);  
    // Set font to bold and add the text
    doc.setFont('helvetica', 'bold');
    doc.text('GM CRACKERS', 44, 21);
    doc.setTextColor(0, 0, 0);
    // Reset font to normal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    // Add the rest of the text
    doc.text('61.A2K5/3, Radhakrishnan colony, Thiruthangal-626130', 44, 28);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Phone number:', 44, 35); // Regular text
   doc.setFont('helvetica', 'normal');
   doc.text('+91 98433 90105', 68, 35); // Bold text
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', 44, 42);
    doc.setFont('helvetica', 'normal');
    doc.text('svksgmcrackers@gmail.com', 54, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('State:', 44, 49);
    doc.setFont('helvetica', 'normal');
    doc.text('33-Tamil Nadu', 53, 49);
    doc.setFontSize(10);
    doc.setTextColor(255, 0, 0);  
    doc.setFont('helvetica', 'bold');
     doc.text(`INVOICE`, 138, 22);
     doc.text(`${copyType}`,138, 29);
     doc.text(`Estimate Number: GMC-${invoiceNumber}-24`, 138, 43);
     doc.setTextColor(0, 0, 0);
doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
const formattedDate = selectedDate.toLocaleDateString(); 

doc.text(`Date: ${formattedDate}`, 138, 36);
doc.setFont('helvetica', 'bold');
doc.text('GSTIN: 33AEGFS0424L1Z4', 138, 49);


doc.rect(14, 15, 182, 40  );

doc.setFontSize(12);
doc.setTextColor(170, 51, 106);  
// Set font to bold and add the text
doc.setFont('helvetica', 'bold');
doc.text('BILLED TO', 19, 65);
doc.setTextColor(0, 0, 0);


doc.setFont('helvetica', 'normal');
doc.rect(14, 15, 182, 40);
doc.setFontSize(9);
       doc.setTextColor(170, 51, 106);  

       
       doc.setTextColor(0, 0, 0);

       doc.setFont('helvetica', 'normal');
       doc.setFontSize(9);
       const startX = 21;
       let startY = 72;
       const lineHeight = 8; 
      
       const labels = [
         'Name',
         'Address',
         'State',
         'Phone',
         'GSTIN',
         'AADHAR'
       ];
       
       const values = [
         customerName,
         customerAddress,
         customerState,
         customerPhone,
         customerGSTIN,
         customerPAN
       ];

       const maxLabelWidth = Math.max(...labels.map(label => doc.getTextWidth(label)));

       const colonOffset = 2; 
       const maxLineWidth = 160; 
       const maxTextWidth = 104; 

       labels.forEach((label, index) => {
         const labelText = label;
         const colonText = ':';
         const valueText = values[index];
       
         // Calculate positions
         const colonX = startX + maxLabelWidth + colonOffset;
         const valueX = colonX + doc.getTextWidth(colonText) + colonOffset;

         const splitValueText = doc.splitTextToSize(valueText, maxTextWidth - valueX);

         doc.text(labelText, startX, startY);
         doc.text(colonText, colonX, startY);

         splitValueText.forEach((line, lineIndex) => {
           doc.text(line, valueX, startY + (lineIndex * lineHeight));
         });

         startY += lineHeight * splitValueText.length;
       });
          
   doc.setFontSize(12);
   doc.setTextColor(170, 51, 106);  
  
   doc.setFont('helvetica', 'bold');
   doc.text('SHIPPED TO', 107, 65);
   doc.setFont('helvetica', 'normal');
   doc.setTextColor(0, 0, 0);
   doc.setFontSize(9);
   const initialX = 110;
   let initialY = 72;
   const lineSpacing = 8;  
   const spacingBetweenLabelAndValue = 3; 
   const maxValueWidth = 65; 
   const labelTexts = [
     'Name',
     'Address',
     'State',
     'Phone',
     'GSTIN',
     'AADHAR'
   ];

   const valuesTexts = [
     customerName,
     customerAddress,
     customerState,
     customerPhone,
     customerGSTIN,
     customerPAN,
   ];

   const maxLabelTextWidth = Math.max(...labelTexts.map(label => doc.getTextWidth(label)));

   const colonWidth = doc.getTextWidth(':');

   labelTexts.forEach((labelText, index) => {
     const valueText = valuesTexts[index];

     const labelWidth = doc.getTextWidth(labelText);
     const colonX = initialX + maxLabelTextWidth + (colonWidth / 2);

     const valueX = colonX + colonWidth + spacingBetweenLabelAndValue;

     const splitValueText = doc.splitTextToSize(valueText, maxValueWidth);

     doc.text(labelText, initialX, initialY);
     doc.text(':', colonX, initialY); 

     splitValueText.forEach((line, lineIndex) => {
       doc.text(line, valueX, initialY + (lineIndex * lineSpacing));
     });

     initialY += lineSpacing * splitValueText.length;
   });

       const rectX = 14;
       const rectY = 58;
       const rectWidth = 182;
       const rectHeight = 75;

       doc.rect(rectX, rectY, rectWidth, rectHeight);

       const centerX = rectX + rectWidth / 2;

       doc.line(centerX, rectY, centerX, rectY + rectHeight);

       const tableBody = cart
         .filter(item => item.quantity > 0)
         .map(item => [
           item.name,
           '36041000',
           item.quantity.toString(),
           `Rs. ${item.saleprice.toFixed(2)}`,
           `Rs. ${(item.saleprice * item.quantity).toFixed(2)}`
         ]);

       tableBody.push(
         [
           { content: 'Total Amount:', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
           { content:  `${Math.round(billingDetails.totalAmount)}.00`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
         ],
         [
           { content: `Discount (${billingDetails.discountPercentage}%):`, colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
           { content: `${Math.round(billingDetails.totalAmount * (parseFloat(billingDetails.discountPercentage) / 100) || 0).toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
         ],
         [
           { content: 'Sub Total:', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
           { content:  `${Math.round(billingDetails.discountedTotal)}.00`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
         ]
       );
     
       if (taxOption === 'cgst_sgst') {
         tableBody.push(
           [
             { content: 'CGST (9%):', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
             { content:  `${Math.round(billingDetails.cgstAmount)}.00`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
           ],
           [
             { content: 'SGST (9%):', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
             { content:  `${Math.round(billingDetails.sgstAmount)}.00`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
           ]
         );
       } else if (taxOption === 'igst') {
         tableBody.push(
           [
             { content: 'IGST (18%):', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
             {
               content: formatGrandTotal(grandTotal),
               styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
             }
           ]
         );
       }
       const grandTotal = billingDetails.grandTotal;
       tableBody.push(
         [
           {
             content: 'Grand Total:',
             colSpan: 4,
             styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
           },
           {
             content: `${Math.round(billingDetails.grandTotal)}.00`,
             styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
           }
         ]
       );

       doc.autoTable({
         head: [['Product Name','HSN Code', 'Quantity', 'Rate per price', 'Total']],
         body: tableBody,
         startY: 150,
         theme: 'grid',
         headStyles: { fillColor: [255, 182, 193], textColor: [0, 0, 139], lineWidth: 0.2, lineColor: [0, 0, 0] }, // Reduced lineWidth
         bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [0, 0, 0] }, // Reduced lineWidth
         alternateRowStyles: { fillColor: [245, 245, 245] },
       });
       const totalAmount = cart.reduce((total, item) => total + item.quantity * item.saleprice, 0);
const pageSizeWidth = doc.internal.pageSize.getWidth();
const pageSizeHeight = doc.internal.pageSize.getHeight();

const borderMargin = 10;
const borderWidth = 0.2; 
const additionalTopPadding = 30; 
let currentPage = 1;

// Draw page border
const drawPageBorder = () => {
doc.setDrawColor(0, 0, 0); // Border color (black)
doc.setLineWidth(borderWidth);
doc.rect(borderMargin, borderMargin, pageSizeWidth - borderMargin * 2, pageSizeHeight - borderMargin * 2);
};

// Check if content will fit on the current page
const checkPageEnd = (currentY, additionalHeight, resetY = true) => {
if (currentY + additionalHeight > pageSizeHeight - borderMargin) { // Ensure it fits within the page
 doc.addPage();
 drawPageBorder();
 currentPage++; // Increment the page number
 // Apply additional top padding on the new page if it's the second page or later
 return resetY ? (currentPage === 2 ? borderMargin + additionalTopPadding : borderMargin) : currentY; // Apply margin for new page or keep currentY
}
return currentY;
};

// Initialize the y position after auto table
let y = doc.autoTable.previous.finalY + borderMargin; // Start Y position after the auto table

// Grand total in words
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
const grandTotalInWords = numberToWords(billingDetails.grandTotal); 
const backgroundColor = [255, 182, 193]; // RGB for light pink
const textColor = [0, 0, 139]; // RGB for dark blue
const marginLeft = borderMargin + 7; // Adjusted to be within margins
const padding = 5;
const backgroundWidth = 186; // Fixed width for the background rectangle
const text = `Rupees: ${grandTotalInWords}`;
const textDimensions = doc.getTextDimensions(text);
const textWidth = textDimensions.w;
const textHeight = textDimensions.h;

const backgroundX = marginLeft - padding;
const backgroundY = y - textHeight - padding;
const backgroundHeight = textHeight + padding * 2; // Height including padding

// Check if there’s enough space for the content; if not, create a new page
y = checkPageEnd(y, backgroundHeight);

doc.setTextColor(...textColor);

// Add text on top of the background
doc.text(text, marginLeft, y);

// Continue with "Terms & Conditions" and other content
const rectFX = borderMargin + 4; // Adjusted to be within margins
const rectFWidth = pageSizeWidth - 2 * rectFX; // Adjust width to fit within page
const rectPadding = 4; // Padding inside the rectangle
// const lineHeight = 8; // Line height for text
const rectFHeight = 6 + lineHeight * 2 + rectPadding * 2; // Header height + 2 lines of text + padding

// Ensure there's enough space for the rectangle and text
y = checkPageEnd(y + backgroundHeight + 8, rectFHeight);

doc.setFont('helvetica', 'normal');
doc.rect(rectFX, y, rectFWidth, rectFHeight);

// Drawing the "Terms & Conditions" text inside the rectangle
doc.setFont('helvetica', 'bold');
doc.setTextColor(0, 0, 0);
doc.setFontSize(10);

let textY = y + rectPadding + 6; // Adjust as needed for vertical alignment
doc.text('Terms & Conditions', rectFX + rectPadding, textY);

// Adjust vertical position for the following text
textY = checkPageEnd(textY + lineHeight, lineHeight, false);
doc.setFont('helvetica', 'normal');
doc.text('1. Goods once sold will not be taken back.', rectFX + rectPadding, textY);

textY = checkPageEnd(textY + lineHeight, lineHeight, false);
doc.text('2. All matters Subject to "Sivakasi" jurisdiction only.', rectFX + rectPadding, textY);

// Add "Authorised Signature" inside the rectangle at the bottom right corner
const authSigX = rectFX + rectFWidth - rectPadding - doc.getTextWidth('Authorised Signature');
const authSigY = y + rectFHeight - rectPadding;
doc.setFont('helvetica', 'bold');
doc.text('Authorised Signature', authSigX, authSigY);

// Continue with additional content
y = checkPageEnd(y + rectFHeight + 8, 40, false);

// Reset font and color for additional text
doc.setFontSize(12);
doc.setTextColor(170, 51, 106);

// More content with additional checks
y = checkPageEnd(y + 45, 10, false);
doc.setFontSize(9);
doc.setTextColor(0, 0, 0);

y = checkPageEnd(y + 5, 20, false);
doc.setFont('helvetica', 'bold');

y = checkPageEnd(y + 7, 23, false);
doc.setFont('helvetica', 'normal');
doc.setTextColor(0, 0, 0);
doc.setFontSize(10);

// Draw the page border at the end
drawPageBorder();





alert('Stock updated and copies generated!'); 
doc.save(`invoice_${invoiceNumber}_${copyType}.pdf`);
};
const handleGenerateAllCopies = async () => {
  await saveBillingDetails(manualInvoiceNumber);
  transportCopy(manualInvoiceNumber);
  salesCopy(manualInvoiceNumber);
  OfficeCopy(manualInvoiceNumber);
  Customer(manualInvoiceNumber);
  // CustomerCopy(manualInvoiceNumber)
};

const transportCopy = (invoiceNumber) => {
  generatePDF('TRANSPORT COPY', invoiceNumber);
};

const salesCopy = (invoiceNumber) => {
  generatePDF('SALES COPY', invoiceNumber);
};

const OfficeCopy = (invoiceNumber) => {
  generatePDF('OFFICE COPY', invoiceNumber);
};
const Customer = (invoiceNumber) => {
  generatePDF('Customer COPY', invoiceNumber);
};
const CustomerCopy = async () => {
  if (cart.length === 0) {
    alert('The cart is empty. Please add items to the cart before saving.');
    return; // Exit the function if the cart is empty
  }

  // Validate the invoice number
  const invoiceNumber = manualInvoiceNumber.trim();
  if (!invoiceNumber) {
    alert('Please enter a valid invoice number.');
    return; // Exit the function if the invoice number is empty
  }
  const billingDocRef = collection(db, 'customerBilling');
  
  try {
    
    await addDoc(billingDocRef, {
      ...billingDetails,
      customerName,
      customerAddress,
      customerState,
      customerPhone,
      customerEmail,
      customerGSTIN,
     
      productsDetails: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        saleprice: item.saleprice,
        quantity: item.quantity
      })),
      createdAt: Timestamp.fromDate(selectedDate),
      invoiceNumber, // Use the same invoice number
    });
    console.log('Billing details saved successfully in Firestore');
  } catch (error) {
    console.error('Error saving billing details: ', error);
  }

  // Generate and save PDF invoice
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20); // Draw border
 
const imgData="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAE9GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CiAgICAgICAgPHJkZjpSREYgeG1sbnM6cmRmPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjJz4KCiAgICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICAgICAgICB4bWxuczpkYz0naHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8nPgogICAgICAgIDxkYzp0aXRsZT4KICAgICAgICA8cmRmOkFsdD4KICAgICAgICA8cmRmOmxpIHhtbDpsYW5nPSd4LWRlZmF1bHQnPkcgLSAzPC9yZGY6bGk+CiAgICAgICAgPC9yZGY6QWx0PgogICAgICAgIDwvZGM6dGl0bGU+CiAgICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CgogICAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgICAgICAgeG1sbnM6QXR0cmliPSdodHRwOi8vbnMuYXR0cmlidXRpb24uY29tL2Fkcy8xLjAvJz4KICAgICAgICA8QXR0cmliOkFkcz4KICAgICAgICA8cmRmOlNlcT4KICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9J1Jlc291cmNlJz4KICAgICAgICA8QXR0cmliOkNyZWF0ZWQ+MjAyNC0wOS0wMzwvQXR0cmliOkNyZWF0ZWQ+CiAgICAgICAgPEF0dHJpYjpFeHRJZD40ODg3ZTlhMS0xMzQwLTQ4YWEtYWFkYy0xYmY2MDNkMWYxNTE8L0F0dHJpYjpFeHRJZD4KICAgICAgICA8QXR0cmliOkZiSWQ+NTI1MjY1OTE0MTc5NTgwPC9BdHRyaWI6RmJJZD4KICAgICAgICA8QXR0cmliOlRvdWNoVHlwZT4yPC9BdHRyaWI6VG91Y2hUeXBlPgogICAgICAgIDwvcmRmOmxpPgogICAgICAgIDwvcmRmOlNlcT4KICAgICAgICA8L0F0dHJpYjpBZHM+CiAgICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CgogICAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgICAgICAgeG1sbnM6cGRmPSdodHRwOi8vbnMuYWRvYmUuY29tL3BkZi8xLjMvJz4KICAgICAgICA8cGRmOkF1dGhvcj5UYW1pemhhIFNPRlRXQVJFIFNPTFVUSU9OPC9wZGY6QXV0aG9yPgogICAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgoKICAgICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogICAgICAgIHhtbG5zOnhtcD0naHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyc+CiAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5DYW52YSAoUmVuZGVyZXIpPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgICAgICAgCiAgICAgICAgPC9yZGY6UkRGPgogICAgICAgIDwveDp4bXBtZXRhPnfcJhYAAMXYSURBVHic7N1pkF7Xfd/57zl3e7Z++ul9AbobQGMlQBDgKq7aJcuSLClWJDuRIi9ZLDvlJJ7xOHbFSyrjmZpkbJedxS4rsmyXpiRZsmVJpkmKFMEN3EBiIwig0QC6AfTeT3c/+13POfMC8kxNTc2LCUE0GZ5P1X1/lhe/e849938ElmVZlmW97YnNboBlWZZlWW+cDXTLepsz7auljdX5j+P4Gz1bb39cCKE2u02WZd18NtAt623KGCNgvTT98rf/97WlhS/0VCpRpXf4W92D234jP3T3wma3z7Ksm0tudgMsy/pvo+Jarnbxxd8K1y//7C0TrpdXM10invmppLX4a831aW+z22dZ1s3lbnYDLMv6/88YIxrzz/7TqxeP/3xvPpLPHfkb1pfnxMj4HnPgnp/4KUl+fmN56ncrg7tjIexGnGW9E9gVumW9zaSdWdlpTX2sUVv89a19Rb+6OE2X3+L+O3dCZ1EsXn6h4CZLv2yi5Q9ATRpjNrvJlmXdBDbQLettwhiDMYaw3bmrUZ3//Ryd3qR9VVYXjzMxnhNR2mDn3gnjUGVx6vGKn1z69+3Fs3diz8pY1juCDXTLepsQQtBuzvaEreqvymR9ws3WOX7sUdNdEaLarNHUHrFbFqNj42J94TXWLr9wi2xd/XfJwomhzW67ZVlvPvsN3bLeJkw4622sL/2CVPUf7XJb4uLFl0R32aF7cAexLDKy5RCl8igy7TA2qamtLxgZvP7uwcmRX26vXv3N4sB4a7P7YFnWm8cGumW9xf3dN/DW8gu36bTxz/Ju4sbLl8XGyhRjO/eQ65+ku38fxuvDyeUgihja3osyp8WF8y/6JvC+OLi1tpBsnPl9v+dAtsndsSzrTWID3bLeHvJJ2v5XwkSjrmpy+fxLZnxLvwi6t1LsO4jvj5Jp0GGC65ZwK0WxbX+3kXklTr3yrWB/3PilkR3lE8CTm90Ry7LeHDbQLestzBhDWpuR7c76Z6UWn/CFL+KNqnBEmyDfR7myAyMFqyvHUFEb6UjcQi9BaZRcviyGt99mWhvz4uLp50YK/vDvpAvPf94bve/MZvfLsqwbzwa6Zb3FKWSPyaJfdI0uBqbJtSsnzcDohOjqH0e4hmuzz9JunIeoTeDlcQuDlAduJTewk1yxT2zf/ZAJ15/muae/dejBQvE3p6fN53btEvFm98uyrBvLBrplvaVtuFnY+ieeDvd5YsOsXHueJFsSBPuhMMTM5ZfYWDtLvXEFJ83o7S7jRmtkYZOkc41ceSs9xQmx7/b7TfuVx83U6cc/ds+7uv4X03jht0T53uZm986yrBvHBrplvUWZTpW4unoryca/zDmNYGXhOMtXT4vxsQlKgyOs1BZoNOZYmrtCnCVkaUKiDTk3xPfr1JM5/Poo2WDIwOAucfs97+WFJx8JXjv2t784fut7Xzem8RXoMraSnGX998EGumW9RWmv4GTZxS96cnWoWT1tFq68Qn9vma7uLdRrVZaXXqO6coW1WoSRAXGckQiDpE1/j0fQWEe3arQ7G2iTMVTZy22H383R5x5x/O6+30SW5wb2f/YJQG92Xy3LeuNsoFvWW5AxDdlZm/mgpxufaq6dM1fOPU93txQDQ8MkOmXh2gVqG5dZX18hyhSNVgchHTo6QxhNs7mO52k8D7oqDQqyj6Lbx+DWCe5/3wfEo9/93ljvzOIf3u/nfhw4udn9tSzrjbOV4izrLSjZOL9Fd2b+5/ry6b4jj34DnTVFT+8A0nW4OHOC9cYV6s067VgRJhrXLaCURxJJotBhbV3TiV3aMUSdmOXl81y59iKLyxdEb3+/ue/BuykXWxMbiyf/g1l/Zvtm99eyrDfOBrplvYX8Xb32rLP+kzKau+P4c4+wOj8nxrdNUuzu4urCNGuNWdZac2y063QSQbstWVqMqC6ntBsecZgjTvLU65pWGzpRRqTWqK6fYmr6MS7NPC0GhitIEvnXX/uTDxx5+Ov/fnHqsX5jJoW9yMWy3r7slrtlvbWIuHp+C53Vz1945Vk9N31WfOiDH6ZY6Wd59TKzc+dohQ3qrQ6tjiJNc0SJJskc0hSanZhSVx7PCxBKYjopLTdlaChHI2yishor6zOkk0ocPnTYXDgzb578m7/6uNK5K8O7n/4NIARsqlvW25Cz2Q2wLOs6YwzUXsvFjal/szjz8seeevyv5N133M6OPXtFKwk5d+E4GxvLrNdbpNrQCaHTlmxsGJIkjzF5pCgRhhnNVohG4giJlB7ra23W10NanYQk1SwvVCkGvezcsZvz5886i3Ozd2Qbyy03W3v59770bXtIzrLehuyWu2W9hTRrM4c3Fs/+9KsvPSJv2Tsmdu0dF5nqcG7qNEurS7SilDAStNsOURgQhXnaLZ9WC8KOS6OpybIcrlNEKYdQhaQmoRNqWk1DuyWp1wzzizWOvvCcwFV8+CMPiMbGovfic4/+T/OLsx/b7DGwLOu/jQ10y3rLaAa11Qs/9+oL3y47ssm+W3eaTCacmz7Bysol1jcaNOqKZhM6bZew4xGGPpnKkaaSTqSIY4ckdRBOCa0LOKKbNHTB+ORz3RhdZGFe0e7AleVljh57XvQNbDH3PXCfWJ6b63v6b//i9x//+v/w/vV//bPCfk63rLcXG+iW9RZgjIGl0+++cu6lTy5cucCdd9whyv09YvrqBc5cOEGtWSVNodXWRKGg3ZK0WpJmUxDHLknmkaYuSrvU6m2Wlja4dqXJ3JWMuN3N6rzk3KkGOu2nWBghTj2iTDI9e5UXjr8i7nrX3Ry4dadYmD0/du7Usf+Q/vMvDEFmK85Y1tuI/YZuWZvMGEPt0qNjZ1769n+6eOb7k/v37RI79+xj6vJZMXXlHM12m06c0YwhjKATSxodwUZd0wodOqkhTDWZBiUNWgqcnI/rOnjCwZc+OgbHzdOJE9pxRJL6CO3jOR7z84tUKr3ijjvvMmfOXBDLK6uD0+fP3NaTF0/8lz/9jr1D3bLeJuwK3bI2kTEGGudke/3yz73+yvfvLnd57Nm/j5X1RXHizAmqGxu0ooxGQ6JFQEdJ2olDJ/SJQocs0qhYoxOFijPSKCNqx2ShwhEOwhH0jAwRBy46n6cdC9ptaKzFtJuaTuRgtM+Rp55jfn5FfPTHPoqKW/Lq1KsfOvLoN3/11Sf/1P4JY1lvEzbQLWtziXbt2nsunzn6M0ln0dlz6z6hpRHHT71KalLS1JClHq1awPp8QLheIVkvk25Icsqnx/OpCMFQUGCkUGA0n6fPcfHaIareptlo04oympGm1kpZq4YM9GwlH5TIUo+11ZSNhma52uThx35AUCzxIz/6HibHe8zs9ImfuXDm5V9ZPPdkzhjs9rtlvcXZt2/L2kTtpRd7l6+89itXL5wc2rd7NyPDY+blU8fF4soqUSaoNwVZ6hE3c4QNjyQ0GJ1R9l2kyPAdRU+3xHUSOu0OhoxCQQES47o0M8H02WmMNKAFqpOxvlRlZLiXK3Pz+IUizU6HfODSijK+97cP86mPfVh06lWMs1yorZz/1dOv/ODk8F7zMDbTLestzQa6ZW2Sa9euua3lp77w8lPfflBnGxy47R6mp2fE1PlzNMOUZtMQRy5aeYTNjKTZwXczyhVJX1+BYtEjCFzypTy5nE+mijguBJ5HLlfEDbpIMujELZQxqNRhfaXF/FyVubkrCOGSpBrXKxGnEStrDdbqqzz30qs8dN895tL8X7C8eKFQKFZ+Y+rEX74OzG72mFmW9f/NBrpl3WTGGMj+tahdO/XAhennf6U6/3ruQx96gKBUEFevXqVc6GZ9bQPdydGuhyAyPEczts9ncLjE9m1D9Pb00FXqxvMKBLluMi1YrS4Tq5TAL+BKQS7n4smULCmQ6ZSwHdHsU+zZPU49FJx8fYXXzq4Q5LrI5YtIx2V4yxDHT51j2/ZtYs/+Azzz5NPm7Omjdym/+DvHn//znz9876+swIK9ctWy3oJsoFvWJmitfaJn7vKjv/7aiUcGd+4eZ8vodrOxXmPbjr08/eTziKxA2IqQaLZszbHvlglKFY/h4QH6iv28fmKG6bOrbDQiVtdqtNpNVqoheB6Om0M6mkJesG2iQk93id2TE2zbtoNt212yrMV6o0pvv2DXjl6OvbzIcrWJ8CQrqzU8x+WRR5/gEz/2HrN9Yowrl5eZPXf0Y9L1Lxy+d+HXgWyzx8+yrP83G+iWdRMZY4irLwfh/PQXz738+H1xq2Z23X+Y1ITi5InjrFZDFmYbRKmk1O1z4LZxtk4M0V2pkEYB1y7W+P6ZF3j11VnqTYESLj1D3Yzv2Ek512aluo7ERSjB3GyV1Y0YoeY4cuQsW0fLDPRWmBgb4OChSQ7u3Y6jppB3Ci7N1Djz+hImLFIo54naLV5+7pR437sfIuk8by7PLLrCPf3Fv/7yr565/72f/LoxKLtIt6y3FhvolnWTtZZn3j99+sivzZ4/HXzkIw+KoeERLky9ThJHrC3VaTVTtu0c4o57JxjZOki+0MOzz57hpRcv4LsBYerS9nJEhYBMuFTXWkytnSNwPHSm6eoqkqQprtdDKxOILKOnnGNhtcPszCJnzy7z5NOnOXxwP+973x2MjFTp75ujK3B56YVZRroqOI7D+XMLDA/Occ89DzB17huyOnep+6TJfjNXrhz7kR1c2OxxtCzr/8kWlrGsm8QYQ/XyD3oWzhz5j8df+pudE1uH2b//FuYWlsXU1CU2ViJWlxoMb+3hjnt2sWv3buqtjKeOvMarr86y3lTgFVhvRLQjMF5AbARC+kjhY1KB7+XJtCBKNbEStDoZRgS02glRKjDSp1Duo9GKWV5eY2V5ntGtvYxNDFMs5BE6Y3Z2CSF8hAyYvzrP9u1bxeTuCXP54gU8P+suFgvFQuE3n/qDP/yL5N/+280eVcuy/o79D92ybh4Z1ud+4fTxp+7P4mXuvm8/fjEvTr12nMW5Na5drePnJXsO9rB12xaSNMeX/+sPeP7FKzSjAk6uH512IcMCTlPi1Q35SJCLNLlQk0+AdshQpZeuUpkoSYmVIFKClhI0lGAt0VxarrHcTHDLPVyrtvnq1x5no5Zy8PAtHLhtiH37+1lYXaLTSak3Yl56+WW2jA2IAwd2ifrqujM3feYLs1MnfxyM3XS3rLcQu0K3rDeZMYbf+q0vM/Wc/8Dplx///ZnzrxTe/d67KA10i1NnTrBwdZ711RDP9bjrgZ3svXUvURzwZ39+hGsLIcoEpEoTdTroep1eI+gXLrk0pkBCjpSi0JRdj5yUtFoNYpWSYdBGgyMQrsD1JRqFFgbHkwhH09VVobrS4MLUDGHU4K537UOZNqlWLCy06OqqkKQ1VuoLHDh4wCxfq5LFTdnstMcKBR75oz/5TmOzx9eyrOvsCt2yboL42p85qjn7843qVO/gUC/j47dy/uxlzp44z/pCRhpJ7rx/F7tu2Yegi+995xnmFtYwvkPmSBwt6RKC7ZUi4xWHsQpMDnjs6DHsHRHsHnAZL/n0uRJHp0RphCYjCAxZ2iFLM7KOxk1cgsTFZA7NWDC70qItu1ite7z04gzHXprmjsP3cujAJFtHXRobazheiSsL66w3W+I973kvG9Ua9er0wfOvHfni6syLjr2VzbLeGmygW9abTyxdOfexxZmzH56dnjK3HbwV6eZE0nHZMrQbrQwHDk8wuXuSRiPkm197nEuXqhi/gAx8pDTkHEFRS/wkw88iPNFBek3cQof+IYe+IQ83SPBzILTCSVxyukAp102xUEYIF4MAI3FwcY1L3MlohSmNxNCIFSu1hKPPn+eZZ07zwH0Pcued+8gXFSvVGsgcL796FMdPxV33HADVdGemj/3sK89/411wx2aPr2VZ2EC3rDeVMYjlM18dXV86/6tTp16pjPb1MTo0LM5OnWb60iwXZ+Yo93exd99+fL/CM8+c4OpCnXYs6ShDbDSeJ/DRFKTBQ+MIhTIRhT7J9tv68Lo1JqeoRutkTptCTlNyDTI2bCzVaNUiOp2EWGlSY0gNGKUhA2E80tQQZ4KYHMtr8Mwz53jt9RnuvPsgB27bShzGqNRgjOTosWfYtnsMx5VEzcXBmYsnfnr23O96dpFuWZvPBrplvUl+uBVt1lYufbqxNn04jTq87z3vIii6aJ1SDPLUmnX2H5xk67YJ/vZvj/PqK6t04iKpLBGngihLkY4h7XQwWYJUKdJonJwmVwFyIZnbZn51nYfedwf/4pd/mo9/6kH6emOkCMG4SOEBkGQZYapJAOE4uJ5DphUIiVMokCDppC71yPC9v3mCTphw6NABRkf6WZ1vknZy1Ooxr5+/KG699Q7STmQ6tZWPzE2/dI89HWdZm88GumW9SYSAhak/3dbYuPIzl6bPe5W+PsYmx1lYvEZ1aZXFa0uMDlbYvnMLCysrXJxZJtZF1iJFRxm09Mj7RYTxQLg4joPveTjSAwRKZ4RJGyfnkWjD7l1bmbk0xcFDuzh89yQpEX7Bw8u5eIHEca+XnVBaEwtFIjVaGKSQ1x/Hwcm54EliJTh69CS7d+9h/4EtFD1DdbGF43RzYeYqjl8S5eIAjerCyMyF5/7HS6f+untzR9uyLBvolvUmMMYI01hw5y+//lMXp47tn7u2wJ5b94haqy5WqssI5dKoptx+8CCO5/HE00eoNlqQy6FclwxFmsQ0Nlq0WylG+PiBT29vBWMkOnPQCWSpIp+XlLscrs0s8vWvfp9vfO0JvKAP7bqkOiXVMY4r8X0fYwRpqklQZNIgEDiAj8B3HbSjEK6hE2tOn55l7mqVQ7ftYv++PlSUsrK8jutLzpw7x+Hb7yZNIhbnzvzomZOPP7DZY25Z73Q20C3rTSCEMK+d/Na2xdlLPzE3Oy8Htw4ytmOCqwuLrCyucv7sZbbvGGVi206qyzELc3USZTBk5DzNlqES/T0lAr8IOo8yhu5iFyYzxC2Fm+VxlItUgkw5NCMNpV7ufuA+xsZ3cfrMMpnyyTJJmgjSzKBMihQCRwtU4iDCIkHkUUgMqt4hqtWJwyatZkS7mdCJHU69dpGeyhA7d08wOlIii2ICN2CjuYZyNBM7tlNdm/OW5y98Vinlbfa4W9Y7mS39alk32N8dEDuycOkTK3OXtzc2Otx7zx040mN1uc7cbJOrV9oc/PG9KMflqSdfY2kxwhCQ6Rh0TDvpECuPpO2TxeAJaKw1kSbBkw6+49BTzkFJUFUZLePxlW8eZfuWSRYXX2ap1kToAE94GMcl1iFxHFKQJQrCR5KiO22kaNHTLdizZ4x9h3YQa81TR16iuhqiHY9XXjuF63W4885befXFCwht0EqSqoTnjz0t9k5OGrmgTaO2+COnjn7pLgMviP97CCzLuolsoFvWm+DK638xPvX13//8lelz3sTWUSbGdojqSp3GmsZ3ynR1N+gdHmBxbYWV6ip9Pf1kyiNOYxyTQ7qCS7NVtm3Zxcq1FiYSZC5kvoMRhjSK8Oo+g31lAqNJ4g6tWHHq3DkqhZQ9E93MLDRQxqGVChI0OC5agDExntlgYizP/e/axd0HxymVBdXmBuXyFg7t+iQvHJvluVfP0g5Tzs1cY3LnDgaHBljbiKmthSgvw2iN4+bFxMQOszh/rW/q9JGfHr345HEz+b7IXtxiWTefDXTLuoGMAa1icfFbv/TRdmPuVmEStk1sEb29vTx39DmWF1ZpVDPypTx+yePSpTniWLGysoYf+PT0Brz7vbvp7u5mvRZx6uQc9WsNXJ1DaY9m2EaKBBkImldjSuUixUovujONIwy33T7Ehx68haHePs6c3+Cxx19mI5Qst0HLAiZLSEWde27t46c+/256e0MKbodWY52R/hKB38X8RoeL5y/SbkQMT0yyujrDxZnzlHskrhsTJw5S+CSR4dLlRXbv2cLc5Rm5eG3qk6+fOPK7wzs5t9nzYFnvRDbQLesGO/ro/1q+Nnv270X1qhwZ6TXj28e5OrfA0so6juehnA7bt/WTy/m0Ntq4Jk/eSdmze5R77t+F9KoIs8HWoTzmQIXF6UXSVNMKY3p7chy8/RY0IbOXrnFleoP1rEpBOvyjn7yPhx7YR9FVJGGCcCWLCxWOnV4mHxWoNkJK+YxdO0r8+N+7m+HhPlqNBTITozOP3vI2Xj62xKOPPct6U+H5BaI4QWeC9doK73/oblbWVphfTskyj0wLqtUad96+jx2jE2ZhZa7SXJ9/wJjrgW5X6ZZ1c9lDcZZ1gxgAAdI4u+vVhdvQqdm9e7colHt5/AcvU2to0swFJ6OTbNCq1enUOqwt1OkudPHe99zF5I5tFPw+dozdwpbhUQ7sH+ehh/bg+jG5Ug7lO+w8tAe/kifOBEV/GGkcfuIzD/Hh99/HwrUa3/rm89TDgJ37tnLf/dvp7QapMkp+nryr+NAHDtM/XOHYK7P85z/8PtOX2pS6t/Gd757kK189wuK6QLsFcARhY4OiI4nbina7RaHo4gfgSAfH9UmylJMnzoudY/tZW1x3N6qXP5K0rrg2zC3r5rMrdMu6kWo1ufK1f/WJxmq1p1gsMbl3H5dnlzh39hpBkAMV47keAwMDuNIjcBxcz9A/UmR4rI9z56/y8HePMzk2yL337qV/pJuRrX30Ds/TXmrhJC5ZltFOEurtFB02KQz6DI2V+cEPXuKbf/kC9VrGUy8t8OlPH+aOgxOMb73C7PwGoU5wXc22iRFW1iP+6M8eJQkz7r23xMmTV3n51WnaWY4gH9BJ2vj5PCbL8D1NOSfxhGKwt4+FhXmaUQu/nMfxMtZqq+S7i0yMV/TiwuydixeP7gXObPZUWNY7jV2hW9aNYow4O/3Y4Prq0sd1J3TGx7fi54s899wrOKJAGoM0OcKmZqBnC/mgmyRxaLZAuTmMX+T5F68wPwdHnpjmz7/0XZ598lUG+/sYHCxgVIQvBbX1KpmJ0IGhkaV0DVRQruT5F16lHmky36W6lvLtbz5Lqy6IOxqjMnKBQ3cpD0bz8CNHaaUeqSiAqNDd1UMcpTi+R5gqhMyTxBKMwpER+3YPMzjQQ7nUTdJJ8R1DqSgplTzanTqNdk1Mbh8XSasxOnPu1AeNaQtjb22xrJvKBrpl3Thm9tyJQ9dmp3ciFTsmJ8XliwtcvVIlSgRJBhv1GpmBQrFMFEe4nocmx9xCxDPPX+bM2RVU4lHK92KUy4Wz86RNhYwUgRSgElaqKwhHEmaSDi7KLbC0VCNsJxTzRaSUKCWpbShWVttU12qkWUacdOguF5FGsL66QRIZ4gTOvD4DArrLPp1GnVwWUEy7ySUSX3c4uH+IHTvG2Do6QRSleK5k564R/FxEPpdRLEquXLlIpdKFaxI5d/ncB+fO/KAL3mc33i3rJrKBblk3gHn4YbF47oizfHXm3c3aYmFgtJ9K34A58co50ligMkGmXYRXIkols9dWKXULxrb3EuRhdaXJn//ZY7SaUPByeMLDlSUC16fsVUg2FAXHx3ccqmtrRFGCE/gkWpKkPg4FdGIoBUUKrk8x7+N5LmEYks/lyOcDHGFwpCDvB+T9IiZzEQQsr9boKlc4dMcE27YUcKINsvoaot1ktDfPXYdvodIzRBQ7zM9XyVRKpjr09OWAhFLBY3V1hVyhhOd6LF+7fGj29VdGhDhil+iWdRPZQLesG+GjHzXnTh71WmuLdwkV0Tvch1KumL28jGN8vHyeFEEj1uS6hjl1apEoCunu9tg52YPQGU6WJy9LKF0Hr02Y1Ng+OQlZQLSR4GsPHYM0kn237AYUmYqJ44hi3qOnUsLEbYqBpivn4JJRCDK6u30cVyMELK5sUOqqsGVwmFxwvejM9NVV5qoxdz9wHz/22YP8xOdv5557u3jg3f38/X9wP4Nb+ujqGuLIk8e4OL2IUj5LS+s0Gy1UloBQhFmb9Y0mQ31DptNYLidZbdtmT4llvdPYQ3GWdSMYGDwyNvrixsKuclGaLVtGWV5p0G5keH6RGIWRkKURa9WYcsHFEQHd3RH3PdhHpOpUVyM69Q6lLkFPT5lbDxzg1lsmeerRp0naCaVcjjDsoFOXKF7h8J3jrK8khLrKxvoU5aJGDvv0DHt4rsCXo0hZ4/4HbuO1S0/jmxxhEnLy1AwDvT3ABRQBtbbgj77yKP/wcx9i197d5BXcsnuEUr/EyXmELZ/HnniF554/Q6aKSFycTJAlKY4nMVKTAdMzV8Vte2/l6tyiv169ust8mccAxM9u7tRY1juFDXTLuhH6YOO/XL5VpfW+/v6yGR7ZIr/3vWMY1yPRmiRTuIGP9CSdZkjW6lBrNtm3q4x0V/nUZ8fQWYW0U8b1cvT2bsVk8MyjT/HaiSkGgj6kayiXcrzr/kMM7MoxuadAmihyZZ9Oe5Fbdh4gyA2ivTrN5jqlfIkwarG6ngNHkyQxKtU88thz/MznPsrW0fNMzW2ghc/8uuH3/ug7HNi1lb58ji4/wy2G4DvMXW0QtTXFfB+dTgtjwPE8tM5whCRVGa7ns7y6RvGeboKc764sL+7s+5ebPSmW9c5iA92yboQ1I+Z+73OHMWG+mOsR166tceXaEs0swnVLeMIhzSK0cHG6u0jiDidOrbN95BYGeiv0yIhOZGg3QGQul85f4tSL55mbnqPfrxAYH6USWq2I+kZGsVUkVwgoFQKEcOgu95IlLpmRkBbp6S7TbneIMo9Ye7h+CaOaeH6Bs5fXmau2+MnPfICv/8VjTM20QRYRJuDqbIsl0UBFDdxA4+VdSuUulHLAGJRrcByN4ztk2uBw/dyb52tUGNNst8kFgXCl2rJmjCuEyDZ5ZizrHcMGumW9QcYYjFZBbb16q+NkYnRkmHazw+p6DRnkEVKBzq4/0qPViahtNHnk+69z6sU5du0aoavbp9UOCVsR69U11q826fPLVEw3gRJkaUgM4BV48uFjxH/zw5eDoICREjyPehjiBR5BwSEIfKrrNVY32iTGZa0JTtBNnGgKuT6+9pdH+De/+jl+8jMf5Etf+SbLSysIJXCKkGrD2NYhoixhZW2DQrFImKTEKgNjqBRyOL5BuBJlUlwHHMeAgHqjQbncbRpRvAVzJW8MTVtkxrJuDhvolvWG/Qtx/ti7u5rN+h6lwAvyzC6tgxGUiwWyTONikMYjBjw3oK93iKgRMbekmJ+/jPQMnivJuy6OhoLsQSQSPwdaxGS+IewoTCYIZI7A7abWzOg0XfAl2hWkAmTgs7rWIE0iFD4aSZS6ePmAVprhepJIK5Y2Yv7gP36Ln//Hn+Sf/7PPoMImpUAQJWt4fh4/V2H64iLPPn+OVAtyvotCo1VGs93GSEW3r5EItBZoYUhSzUatTm9PNxuLq+XO0oWgMEILe/uaZd0UNtAt6w0S4g945Osj3Vkc9UvpkS8VaLVX8Xwfx/fI5V1y2qXRDmmFMUiPIJ+jt9LP8swyMnMJAkEhEPjagUTjGI0RisxRDO0YRHoejbWIznqbLDKAJJfPozJFqGOidoLyFM3VDOm5uG4PrXaCclyMBOk45FyBNoZUxRjjcHW2yZf/+K/5whceYHxrgjQNXF/geQFGFqn03cYrJy6TtTVCSFwElcESjcYKuRx4XgxkIAAhcFxJEnXwertNHLb9en3RK4xs8uRY1juIDXTLeuNMEjXKWdYpFHPX/wStNZoYLWjUWmSpoUCOVBliZUhNQrTRBrNOQfpIV+A6AhUlRBlIHLLMABrVbBFc0wjpELUVWeqSGR9tBMv1FQYmytx7zz7GJvoJci6On+Pc9AKPPfEaTqzxci4qVmQkGAxIg+tIZKIRWnJtbpEXX3qOD31ghC39Pfj5fqLI5+pinVeOn6S6toYxObSTI0oitI4JfEkahoiCRngABmNACEG73aK/vw/P9ZxmbcOxeW5ZN48NdMu6AeJOJx92OkFvj08uXxQYQT7Is1aP8NwSjgzITIpJFEliECJHpxMhhaJQyoFJEFriCocYjSPAKEPJLeM1FYGRJInByIAQQSOpsfvucT77uffjF1fRpopIU8KO4e67Bhjeej9//KVHiTMP3/HRAjAaI8FzAiQaL2ly6PAA7/vgIUa29pK0PJ75/mWOn7rAwsYKmRYE+QApPcJOgu9KHCMwSmPU9SI1mdIgJKkCtEuaChASIQz2hhbLurlsoFvWDaCVQqXK+I6P0Jqkk5D3vOvfpVNFJ+qAA54jQUjabYM2PsoBkyU4QuNLB6PBwSB8g2s8TKrwRAGtFI6BCE3op+y9dYIPfeIAxm1Q6irgOlvwpQPaJYxBSs3kRImFKwmtjofKNPgOWiqcWOM7hqCQ8uEP38nYlnFOHJvhsYdfYWkhIjYgix4Tk4OMjvQxM3MVJ++TxClJmGBSh65CgBQxjgSkSxQ6KOkgPI9MpyRZvNlTYlnvODbQLesGqFS640qlKyt3Gd8BdAKtegfHzeP64AowjkFlGhkJkA5ojZAaKQyeAJWl1wNdGlwj8AHfcUi0QklF5KeQ13R3ax54aIKuQNJX6uPlZ48Tx5oky8jlCgwM9TE42Mu28T6Wrs6SI0ekNEmqwYDQmky1eOjdtzAwuJWvfvUZjj43Qxi6GAKcXI6002JtKaLsp6wubDA8MUylUiYNE6rLKxhhgAzPk7TjjCiRJB2F0++TpDEgTVDusofhLOsmsoFuWW+cyBeKoe87cRRtFOKwTjHnspyEuJ7EdUDoDCPA9z0kCiE0RhqEkEgpEKQIwJXXS7b6QlCSEjfTRKQkvkDlc6ysV/n4hw9TySu6TBdf+p1vMDu3gZI58HNoR2N0jc/9ww+yb88kcxdrXLmS4SYGzxi0kTgYJsb6OXhwJ088/iJPHjmHG2xFdknacZs4Dsm7Hu2GYvnqClILludW6erpJnBdCiWfIJdiEAjho7IMYzwSlSGkizKKrlLRuJmnN3tiLOudxNZyt6w3yPwTGNgyWYszUWu1WsRRy3R1BaRpQpTGRDojVNcDHQypSpFCYgQoMrTJQBgCT15/HIe842G0IdWaEEXqC0KpGRrtY+f2rQz1D/P4d46ysZDhUKTTdkkijzSShKFkcb5Kb6XEli39BL6DlwtwXAE6w+iQB+8/iEojzr4+jR+UiEXERlTFKXt09ZZAaJRSuJ5DT7mCygTr1eR62dqubiYmxinku1GZQyfUpIkmjTNyuYBmrUHY6ZhU2Ty3rJvJBrplvVF/XGNgdGvLDcqraZaxUV+m1OXgBJpQp4RaExsIlaYVJ6QGEqUwAoQjcVwHz3FxhIuDBCPJtCFKMiKlMK4LnkcWZvSVK3SVu7l8eYHTx2dRMURxi55eF9/NcFRGyXcYHqoQ+A46SYiSlMgYEgme69JT9NmxvY/6+jqdZopWBi8AGUAYxsRpjHA1rm8wUtJOM4TrI/BoN1Mc6VKtrlBdrdJppqRthckU0mRUuoqsr60hHU/li/22Spxl3UQ20C3rDRKiYvrH7msPDo+/HKaS1GRsGRvAz7lkaOLMkBpJpCDKDNpxUAhUll7/ji4EBoEymkQpolQRa0MsBakUaCGJwwRpUpJ2mziMuTh7FSMkcdrkM597P1/4px9i+44cu3eV+fznP8D4jlH6+odp1tpI3yEkIc4iPM+wb88YrcYyVy8vkIY+SSSJWgpPl1CRJIsMDh5erot6W1NrphS7CniexHEka2tV8kVDb18OVzh45Ch4BUqBR6XUBRl4TiFzvIKCX9/s6bGsdwwb6JZ1AxQKIhsanjiepF6SpoKhSoG+3i50BiYVpNonSx1UAigBRuIqkFmC0QqFRDseqVZEypBqAY5EOYZIpziORCtNoeBR6e4miQ0yF+CXFI7sMDgs+ORP7OEnf+Y2dh8aYHzXTpaXa7Q7EZVyjm1busg7GpV2OHxoL/09Q2xshDRTQSwclDZIY/Cun3UjyTzWmppaCFHsEHYUPZUufOnQaSQkaUauYHCFRnUcOg1D1NH4XoEs9USc+YnTtzsT4t/Zg3GWdZPYQLesG6DTgcGRba84XmkjX+g2rifM5PZhPBRCCbLIoDKD1gqjM1yhKecCSn6AyTKENAgHHE9gXI0SGhwHIR2EEQgFhXyBVruDEArXy4h1TJS4rC0phiqTbB3aSVdpAN/p4eQL0/zVNx5nZbXD6mqdkl+kv6tMqeAwsW2EtKVYXWqgjYPBRRtQKkMpTZpldMKIVjsmTDQ4HlFiqNXrgMbzfdIkQzouRruEoSJLNQN9AzhSsF5bx/WDpa6uUfvvmmXdRPaUu2XdAELA9/74ymU36L185crK8JbRISbGeyj5Et0WZKnBDRyM6yHiBGEExSBPt++TRdeDFQFeziNFo1NNJsATDo7RkIHjS1qNNmGzzt49g5x4aR4dFzj61HlWV+rsPjxOKjNmLi3x2qsXiUODIk8awvLFZfpHSvSNBPT2wNFX54k74OCSCoE2AqMADEK6aK1RwiFMMoo5nyxTtLM2Ik7JBQK0g9F56o06aSYQTsyuyT102nXW1mvs3XZoBiFiA9jyMpZ1c9hAt6wb4FvfQkz2HoyvXHj1paixdl8UKdNTKYruHIRNg4vAcwIK5QLGiWk0OyAVnu+hU65vu0tJzpUUiz6dZkKmMgQejgGhFY6RJGHG5emr7L99gLvv3cNj3z1Pzu/hxMkrvHhmCu05aJXHp4xwHKJOSiHwiKMGaavNA/fcRztc5eTJKbLUQ0swGLQQCC0Q0iClBOmiMMRJipQKmXMYGx3BxB3iqEqSZjTqKZnKIdwUx4XR4QEatSr5YinrHRiZ4ls/HJxPb+rUWNY7ht1yt6wb4NOfxvwfPzinvKD89PzVRtqopfjCYWx0EBWHZGlImqUoDUgJnkOkEzKpUMKQKoU2gAHXMbgOaANGSJSQpBqSKMF3Ai6eX8Dz+5jcvY0H37ubXFdIJlNUViANK7SbAbV6RjMMcfwIx19n+/Y8n/3sezh0cA/XZjdYXItI3YAEB/3Dk/VGCxKlSTJNorleiEb6xBnUajXGx7dw2+FbMCi0NrhOgSwTlEoFhocqlEuBaTZrBLli4gXlKfFpEDbMLeumsSt0y7pBfvu3f5szT/7Z8/XFmZfDyLmvu9Rn9u/eIc6fbxA2oR126KgOiXZIgVgrcD2QHkoZlII0ySgXHRKhibVBCg8D+MKBLCPwA+avtrg0tcGe/RP093nc/eAYnUiwvKxZWoy4MD1HZmL6Bn1GR0rs3zvO2MgovX39vHzsPH/5jRdYbxlS4ZIJef17gQGNQWiNRpOhQII2Bqk1vudz8uQJDuzdyo6dQ4TxErX1Gu1Q47qarq4yOd+h0WzR3bN1vqdn8BzXd9vtoTjLuklsoFvWDXTgfV9Y/a+//mNfuTB1/PbduydyY9tGzcjwBRGZjLShUSiMMOgkwwk8wk5K3guIkxbKCGIDjuMTeB6ZowCDMobYQJoaiqQIrXn4m09QLP0ouw6NsbZxhV6Z0jcoueOuUT4qduD5AXHaQbjQVSyhMo9XT13gW99+lk7kcf39IEV4PgYNxiAQOMIFBNpkaDRCOBhhEEYShRnTF6/w8U+8l9krJ6mtRaRpHW0Ug4MjdNohOhN668Te7953148sGfNr2PtZLOvmsVvulnWDTezY+3CivEuvvnJKSKnYu7ffFIIIQYIyPkY4CMcggDhJyBXyuEKQJQnCSISUFIolHH64By8ExnEI8gUC36ecK5B1JN/59rM88eRZgtwkgwO3Mji0FS+fEhSbBEGbvv4yQ4OjNDbgiSdO8Cd//hjVlqGeKDJjcALn+g1w/PDomgDpuUhH4rsuwhgwGtdxrt+uJnxajZTTpy8jqNBug+dJVBLS39djlhYXjTHB/J33fOTLYvz2VAi7Oresm8mu0C3rBjIGzh3dVe0+M/bt6Uuv7Tt0cJ+cGO/Hf+UM+XxAHPkY6SClQ6oNmSNJM02uUCBRCcoYGu2QvJujE4Z4DmglcIzAdRwSFSLyHnEmaCyEXPjaszz+yGvs37uDiW0FRscycEJKuTJha5Wzry9y7Ng8y+sdGolPxyiE66EEJFr/X4lrhEYBSIExBildAiePUga0phAEuFISxQ7nzlzBywk8z6VQ8Lnl8KTJB4LzVxfxS1se3XL4U9P2dLtl3Xx2hW5ZN5AQsO/+f5y950f/wZcMlampc5fNYH8P+w9spdKtkSZCKIPWAq0F4NBotnGDAMd3UdIQZwqFwPU8PEfQ5UBZCpwkpuBev5s8iV1aTYe03UVj3fD80ZPUa3XKlQrFQoDjaoaGKtx5xz7yOUmzmaF1CelW0LJEpAyZ0eD8MHbl9UcLTWYylFJgBK4UmExhtCLw8ggCkgRKxQrgXq88t3uLCFstai3d7h7a8WWCQG3iFFjWO5YNdMu64QQH3vdz14bGdv2nE6cuJe1Gwj237zf7d3fT1xtTdBM84ZNkEKmMKEvQCDSglQEcjBGoVOFqQxeSspR0BS5CQ5ArIFyJVoYkarJtW4lf+MVPcfvdY/iBw/DQJP19YxgRI7w1fvbnPsrtd46TqQ3CdoNGvYGUHsY4SCNwpcG5XpgOicGVEq0ydBbhuQrfS/HzBi0z/LzDvv076e7y0fEat9263eRcYaLUZKW+rf/5lgffc+r6CFiWdbPZQLesG0wIEAIxuWPfX2nZ/fqpk5fFYHef2DXRY/qLIWVP4WkXpEdqJDg+nSgiV8ijtMFoaNVbFHJ58tIlb6BLa/JoHMchM5Io1XiuZHSowN//zH3MLT3F9OxR+voqxO0i02c3mFtYpJOsEqaz/Pin7+Sn/tF9jG1R5N0OSdzBky6B6+IJiSsEUghygYc0GpPGFHyX/bsmGOjNEcXrtJMGld4CJmuTRjXuvmubmdjSJ1zH5dyFhdO/8Gt/8L/d89AXYxvmlrU5nM1ugGX99+oXf+lXQtVabU5NnftQzk/9fXsnkAKxutqk3VEk6vo+d06C1jE9pS7SKML/P9m77yg5q/vg49/71OkzOzvbd6VVQdJKQoAoEiDANmAgFNtxjxu4JE5xXN4kx+nwOolfO7ZDSI5jO3Zs3DHBNs2AbToChBBIIAkJ9dVKq+2702eect8/diVri4S0Rbta3c85HHjuzrnPnYcz85vbfle3wfWRpTIBKYjogiAuPlBAJ2dYZFyHpnkh3vv+NaTqBJXVOlZA0t3p8IP/fooX1m5j9ZpzaZhTQ2VFNfFIgupag9r6MJs376HkGIMHq2gCg8Heug8UnTLSLxO2bWxhYLguEVMg/TK6LyhlM2QH+gkHBBevWkgyFmV/W5/bM6D98zUf+qdnpvmRK8oZTfXQFWWKXHTV7/u3fOHun8VrGn/+8suvSa/kcfHKZXL1Bc2kYjkCWgm35OJ44LkCV3oYlsBxAaEjdGMwuYuvITBwyz7pfJG+fJ6SVubSqxbTk9mMEFka686iuWk5phEinc5hm0EsM4Eu6njk3g389H/uId+7l1RFjne8/UKCZhFdOuiah6v5+FLD90DXDJYsXoBOHksU8bJdiEI7tWGPBTUGixvDzKm2uOqypSxsqiIWirJ1e+fz51x2/d2okXZFmVZqlbuiTKE6Xfe++tVPfmXv1vKadeu3zX/fe65l5YoMA9lOSi8M0O9p6K6FoQuKBQcpJLooYoVMkAJZFpQ9SVnT8A0bofvolsMFK+cRjJVpP3iQjZvSdByEG992E9FwgIoqnVLBxQ5U8OD9T7Nh7WZWnD2fZLKKAGmC4QS7Xj/I2nVtCD2F9H2k8DE9QaqiEpHPEbGKNNVpnLOkliWLaojFNULBMPg6mtDo7+2lp6uNgx2l7jddf90/XvHe23q4+f9O9+NWlDOaGnJXlClyG5AF7nlkfdfeLev7du3YcWVXxwF7+dKF2LYunHKWzvZegnYISj6G8JFIhCgRDOiYgIaPhofApYRJ2RQQLvP296+hcU6QhoYEQrgcaivR3pbj/AsuYNuOHextHSBZUcumTa8ipcall6+kvrGGSDSBbeuYRp7uvjSdXWWkCKL5LqbnUs63kYx73HR9C1ddPY8VZ0epqoFEpUEkZiMMHSsQxAqGkZqJZiV7Wi64/puRquVd0/y4FeWMp3roijLVhJBvWv/wT3MDuXOfff43n0slauWK8xZK27JFwN7LSy+143sapZKDadkIIRjozxERIUwZoOC5+JpEWBZ9hT4qGwJ0de2jIlFFY/18ouFKTCPHT7+/lqpUM8uWnMdrmx9j795uug5lEJpPsrIW17W5764HOe/CZiy9kzWXzKGtbSeO6xI0NXQtwzXXLOOC85qpTAnCsQK25RMMxtHtanw/TCxpIwmhaQY9Hd3QlUs5jlwBbJ3ux6woZzoV0BVligmAC691nrzr67d393StefTxDRcWMjmaF6VYdcEC6qqT5NJZwoEQubxPqeDR29lL34Es3d05DD9ALBLBlZK0V2bNirM5eHAPcVvQ1Zpj4fIlLFxsk6rexsMPrufiNStID+RZ9+wmCjmHxrm1hGJVPLN2HfgGQd2mJlWJbuosnlPFqy93U7cwwjXXttCyKEEsIonHYxQdn/37uug61E2h0EahYGCYFpphoRuSeCJK45xFwYBurJZS3i2EUPvPFWUaqSF3RTlFvnv3A5klZ899xXI633lg/2uBdHZAJFMGc+ckqa62mNscYdHiWpYsS7DinAYuu3wF886qwRUl9h06QE+xQCBmc931F1MuduHk87y2+QAPPbyJ2tpmfCfAhvU72Ll7D6maOHPmNrJ7VyexWBWV1Ql+fvcD3HTj1YQiLnVz5rJndyvdBzPgSW6+5QrqGso01CUJWAleemkvv310A3v29hEwqunuKvD045vo2N/F66+9TiSiAQXa9rcRq2hqr2xede9tt93mTvczVpQzmeqhK8opIoSQ6fTBLUsvWLb/vPPCiXR/O57MEIuAXhEGBLouKDp5dKtM2WsnVNvHeVdatFxyMS88v498Pk8oUGJxSyOWZdG0MMyd332c//76PdTUNGAGAmhmnnd+YA2pyiYypTytOzq45+5HqKpK0th4FpncITo6+6isCtJQX2LZ0iZqqhxiFfV0dZe5/97HeGnDfiprUlhBnwtXNzK/JUgiVcO6pzYTC4bJZovUzalEc3z27to0v3LuM2EpZVEIofK3K8o0UQFdUU6haLSusL/oDKTTXVqqMkB15TxyGWjdv4eurjQ1qSVUpaoIRyWhmKSqeoD+nKCny+cyy+Tgvm30dW+m4A1w2eU3UCgmueiSHD/78W8Ropd0ZoCm5iS+5zBnTgOrVp9NT+chsvkuYvEYP/nJ/WzZ/DqXXN3IohZobDZYMC9OLC4oFx1+ed9jdBzSqamvZs/eTmxTZ+0TW3jv+6/DCu5k5eoFPPfMFgrFEMFAJelyO4KSZ6ICuaJMNxXQFeXU0mqrGwyifbK/+5B48Ll17NnTAcJiycIFPPWbl+jsOkQ4arDywgWkapI0LlxIsiXGQOog9fVlentbKacFG57bjONWM3/+PGJVOvFqg2SqgT0797Np3VYOtPbw5DOvEQjBDTddzeKz5vD9bz2M70JjbR3C308sHCAZT+E7EX77q/Xs3Orw3g9cTePcSlpbD/L4rzawfdNeHoo+w3kXzmFfrpWGuRXs2nmARMpm1SXLyZciOdfJquF2RZlmKrGMopxaYcf1Ert37GHt05t54rHXOGvJMm56+3U0Ny+itbWbYDjMpZeuYfnSC1m/biffvOMn7N65g6q5NURrKpHG4BGnsuBx13fu56EH7mPB4ko++kc3cM21q2hsSrFixTIiYRtN+CxpWczK888lVVnJinMWMjCQww4aSF9nbvNyPCfJ3XevZf3zBwgHannuufXEKiQNcyQfvPnNLF48j+ee2IQlEwTsAEtXLJKJqqhsaz+EFAEZTNTu6tESBTXcrijTSwV0RTmlSma+kDUOHNgvo5EodfWVBCLQ0XOQBx56jEwhx8VvXsKcs6Ls2LmD/p4CATPE04//hmeefopYpIr5CxZR35AiViloWVZJV2c/th6jsqKCxcvmY5gmfel2wjGXhYureH3769x7z1O0tfawv7WVeMLCCNhEE42EgvN58vGt7N/fT8vyRThOnv17enn4gbUIL0x3T5s8e0WFrK0Myxef2SSb6pv9nu5WOX9uDaYI0tkjd9U0nfWfZ521ujzdT1ZRznRqyF1RTik7m832Zeob6sXOnXvkivPrhGb009mZZftr7Vx2+ULseJGuvkM8+fQL9HbmuXjNClrOPpfuvh6e/s06rnjzOYiaIh2yn3MuPYutP9nIlpcP8JMf3k+pWKZ/oJf6xmXkvU56eg8Ri1axbfseXt+2nVw6y4qVzaRSSXStzI7tPbzy6j4WLp7DdTeuoa31II88/DxPPLxVUkzx1hvPYf26J1jzlpXyiUc3cPaq5a4VTDoViarOxqbKtbU1Ld8zY80vTfdTVRRFBXRFOWXk4IB0wXG810ORxPlSuNL3BuRAZ0FYxjyqUhr1zRbxeJi1v25j984MN/z+Ulac20jYTHJgey9bN7bSfaCPa2+6hFDQJxxLM2d+gJc39JEbgHgsSio5QGWygnLXIQKazu7WA1zxltV0dhxi/54sK85rwHN7ccoGTz62ifb9GRxPcvbBAwQTnrzs8hZha2GeW7tRzF9UL12jKpeomffqxW9rfNEN1b9S0ZBsbaxreH3x6ncc0sJzSmqoXVFmBhXQFeUUEQJA8PIDn/+lFax5m++LYOehQyIejhAyBbWVBobMEzSCdBzoYdWqOTTNCxMI+Tz7xFNs3bCfctnDbS+zZ28HCxfXkcuXWXBWNVu29tK8oBrbcMllNCJRm6SbpLaqHymjNMwP4hmSgf4QjY0V2IbglVdb2bvvINU1Yfp60jx071PyY5+6nmzGl1fecF2feGLjhv5y4omzzr3w6fqFy16tar62X8o1wNMMpsv5zNB7UhRlJlABXVFOMT3a/IBJ71d1K/4XplEKaBrSEwPU1EpRzHXS115DUHc5p6WJiKWL1h2H5Gub2gSWzsrzl4Du8cqWTSSqAlTXNlDRnqVlqc7SZTG62rtBFikW8mgigO/rLFpcw5w5QQpFGOiMEApEQZbZs/sg737P9cQTAblx4yvi1U07eHH9bnHuqis2pQu1f/m+P7x8XdMF78iC8EEOC90qkCvKzKMCuqKcYiuu+GS+Y8fP/58RnT+Qz9gfrqiM1ZmmCOQ62+24Hde7+ge0mro4kQoDXQq5b3sHDTUpufKSc0VVQxI0ydbXTHZs38Ell62hubmBPbu24fu9+F6WYEhiWQa+jKFrBgFTQ/NLaF6JOU1hwuEwhw5kObC3n8a6EmevXEI8GZQLl7aU2/uchwjU//WKNZ/czm0CcSFDw+mDw+pCPIM6JVVRZiYV0BVlGlQvfEe+fuHe24WX/144kKi3rHK1qFi2yDZlZShoVjYucJp9d2BlzinW9BU9+9JLlstA1JdClFi/7iX2te4RgZBFe9tBkpVVxCIxioU0qVSUPbZHJjdAJJxE0x2CAUEiEiNo6tgxG8My2L5tF9LzeeK3jyKttLjkTZfSXLX8t4sjNR+rXvq+XgBx6zQ/JEVRTooK6IoyDYQQSIknBD1Syp6hMexHD/d9ZXFr6OBrz9cIUVxwXe3qt5QKu96v0Tv3+RdeoK+7h8pkJboO+/ftoaa6jvq6WgKWTTQUx7INisUs8XgSyy5jGCVsy8AO6lQmq+jr7aetvZMP3Xwj+WIfz2/ZhZ+4jMZFV10vNLMHSAOvycFVfM8C+4CXhRBPTcvDUhTlhKiArijT5Ljz0HZLvv7cpXtB7vE6Xnws6656pm//c/85ryU478JYGNvwiMQsXn99I11d7ZxzzjI6OjqwIyGsgEHZKTGQ7sL1siAilMoZ0pluahrm0ZfzEIZNrNoiEWrgXZe8h9pFVyG0I18HMWDV0H8f/jdDAX4dsAV4BXhUCLF50h+MoijjogK6okwzMUZkH+zBy5uAm/SaCy6OQ0u05hzy7c+Rbn0a1+9l27at7Nq1hXiiAsteiOu6IDw0w6VczmGbKSIhC98voQkNIUIUcnDwQDs9PYd46NdPcOMf/DmpuTciNPNEm7uK4UH+NeA54D4hxL2T8DgURRknFdAVZQaRUl4OfAR4F4M95SM0I0S44QrKpTQHt/6SF19cRyTs09NzkBXnrCBgh9F0SbIyRChsEI0GqagM4Hg5PN9F18Ns2rSFzs4sVsCnUA7A1tWUXhE4iT70GhO9zkKvNRHWCS98axn656NSyjSDPfgfCSHunMTHoijKCVABXVGmmZSyDvhD4L0MBsdjEAjNJN74Zvz0IWrqNtPR9irxyiCvbNrE/OYVuH4WO2Dh+S6eX6AiGaLsmWi2IJ6Ik8+7ZHPdiJjN8sA7kd+Oks52jLqTVmGgVxsYzTZmSxBrSQBzcRARPm626BhwNXC1lPIO4H+BO9Xcu6KcGiqgK8o0kVK+HfgTBoPgcXldLqV1WUrPZym9mENvWcnSa66lu6ONvt5+EgmNaCRGJu+SqmxAyjLBsE4wFEKWQMPGMgUaZRLRMMn4uSzYeCMyq495P7/Pxe9zcbYXKTwyMFgowGi0MFuC2BeFsS+Oolcd8yskBnyUwZ77a8A3hRD/fvJPSVGUE6U2lCrKKSal/Ajwxxw1Fz2W8sY8xSfSFNdlcXeVhv/RlOgffJ38/F9RLLbR1raf1aveTC6fRggNRAHPzWDpcaxADY4sI/0M21/dQl3TQkJtv4f87oVIZ2LvxVwYwF4dwb4kgnVuCGEc9yvlAPAz4F+FEO0Tu7OiKCOpgK4op4iU8tPAXwINx3qN1+mQf7CfwgP9uPuPf4CZ1pKFjz+MFAfYuXMr9bV1mLZJwAojhEQzJNINk6xsJlfoJps9hG1amHYVxccuwfnpnEl9f1pMJ3hNnNANCcyW4PFemga+gwrsijKpVEBXlCn2RoFcliXFx9PkH+intD4H/omddaJVuxh/8RQy0gpunu1bN7H5tS00NsylsbGJeEWCaLgGKS1e3riW6toI85uXIGUC5/HVlO+qn8R3OZwx3yZ0fYLQ7yXQKo85LJ8GviOE+NyUNURRziBqDl1RpsjQHPm/cIyFbn7aI3dXD7mf9eIPeCd/A0dDuGGkr4GUuG4J4RR5deOr7Nq9C8vSsC2LcDhIV3cnhtnCvDkLkb4PAXdib+4NuLtLpP+jg8x/dRJ8a5zIR1IY8+yRL4sBn5VSvgf4OyHE96a0UYoyy6mAriiTbGjV+h0Mbj0bxet2yf2om9wv+pB5f/w3EqBhDCao0T00inhuCdOEYiGPlBrlYhZdszAMB6dUxCu76MJDVuQQpkA6U3vyqXQl+V/1k3+on8DlUSIfqcJaPmo4vgH4rpTyk8BfqVXxijI+KqAryiSSUv4j8DlG7CEHcNvKZH/QTeHBfmR5EgKpCdL2AYmUPkIz0C2BCZi6gY/E9wWGZaL7Eo0w0jcQlo9I9aIlwOuaeDNOiITikxmKT2awzw8T/dOasQL7KuBJKeX/CCE+dopapiizhgroijIJhhLCfIMxhtf9jEfmm53k7ukDb/J6xCLh4gbSCA9838YOVZFMzUM3AkRjSUxTp1geIBjUMKwoFdEmzECYQNig4HWjLc7jdQdhajvpo5Q25Ch9bDfBa+LEPlWDXjUqS91HpZQXA59UvXVFOXFqUZyiTNDxeuX5B/tJ39GB3zf5c9bmlf24Nz6OoefQTQMrYOE6OYTrY5thkBJNL6JbGtKM4sso5cwAvsyQKXrYBy7G/dYi/L7p+xoQQY3Ih1JEPpw6Vna6f1OL5hTlxBw37ZOiKMcmpayTUv4auJURwdzZUaT7E3vov+3AlARzdGBJO3h9uE4WYQaxIlUIO4zjeeQG0pSyBZyCQ6EgyeYlHhZmKEEpX8IrZcjWbEJcmJ78tp0EWfDJfKuTznfvoPRcdqyXfFZKuVVKufxUt01RTjcqoCvKOAwNsa9nRJY3WfIZ+Oohuj68m/Km/JTdX5/nkq/Zhe+VEMIkHIziln36e3J4vobQBSWvRNGRZLIl8pkiuqahWyZgEoyEsS0XLm5Dq5qyZp4wr92h59P76P/iwbEWCrYAa4d2DSiKcgwqoCvKSRoaYn+SEfvK3d0luj68m9xdPZM6Vz6KBt6yToh3E0+GsUwb13HQ8YmEImhSw5EOjihT8lwsK0hlMobw8qQ72rFCNolUguq6GPrcPrQlxalr60nK/6KPzg/sorxx1I+hGPCLoWevKMoY1By6opwEKeXdjLEdLX9fHwNfOYQsTmAb2okQICyJ+Ph2Aue9SjSs4eQ9soUCfQO9eGUPp1ggX+hHGBAOVQImuUI/rlPC0g2a5zVDwCRgBBkoVWA9ewXer2L4ve4pXyB3TBpE3l9J7M9qQB/1NfW/wJ+rLHOKMpxa5a4oJ2isYC7zPv1faqfwUP8pagRIT0CfTilXxi0UcfNFuvv289q2jfR2p/HKZRyvjG/alEsCS7dIJIJIP02qIkFlXCdR3QxCx7DjxD8+H+tTlUhH4nU4eB0O7t4SzvYizvYi7u4SsjTFP1RG8iH7ox7KWwokv9SEVjHsq+pdwDIp5ZUqqCvK76iArihvYChRzC8YcZiKs7NI3+f347YeP+f6ZBKWwFwaxKhfiGfvxNbTOJ6LZUoEDqV8Ft+TlBxJIVsEKZFGmYJZIh6zqK+rJVlRiUSnUDYJN67ACiYH6zYFRqOF0Whhnx/+3U19ibOtSPH5LKV1WZzNhSlPSHNYeWOerg/vJvnlppH54VuA9VLKP1Bb2xRlkBpyV5TjGArmjzJif3n5pRy9f7EfPzuOlK0nSRgCe1WY4LUJAm+KImwNKX16d92L7FpPwHDw/DKFYp7+/n6csku5XMangGWahEJJLDtAKBoiEo7i+wJXmhT1BaSWvBPdjJxUe2Tep/hclsJD/ZSey56S4C5sjfjn6whdnxj5pzRwowrqiqICuqIc07GCefHxNH1/3zY52d6Ow1oeJHhtguBb42iJ0eeWl7Ot9Gz+IVGriK75WIaB0AQ+4PuAVkYgQVqAhjA0XM/D8wX5vIOWXN2dXHDNPiEMj8FFZ0tOto3+gEfhNwPk7+vH2VaY6Ft+Q5EPpYh9qmZksQrqioIK6IoypmMF8/wv+uj/UvsJn4h20gQE1kSJ3DJmzvPhbfTL9O+415eZLZohiuA79A/0kS8W8CSUXZdS0cFzfcpOAdPUmDenmXisUjpEhBZZ9JV405V/I4LJYaeiD+35vgC4HLiYEwz05ZdyZH/QQ/HZzJQurgvdVEHib+pH7tFRQV0546k5dEUZ4VjBPPM/XWS+0Tk1N9UEwStjRG5JYS4MvNGrfwusFZr+LJq8WbcD79Moku7pFU8+8xCt7R24Uqfsg5AaupBowiMWtmmsT2IHavE8C80IdxCoGJX1RgixGdgMfO9w2dAe8CuAS4CLxmqUtTJMcmUYd2+JzHe6KPx6YEoCe/6+PmTOI/GFRoRxpE8SA+6XUqqgrpyxVEBXlNHuZEQwT//7IbI/6pmSmwUujRD7XB1Gk3W8l20DvgncdXhlt5RS18zIWygH0DCwgwbBkIlpaziehlPyEYBpGlimwLINNF1H0wT4AqnJEw63QohfAr8cum8d8EfAJ4BRh6obzTYVX2gk8oEU6TsOUXoxd8LP4kQVHk3j51pJ/msTwj7SVVdBXTmjqcQyinKUoa1pw7K/Zb/XPSXBXK81SX65ieS/zT1WMM8AtwNnCyFahBC3j9im5eua1eN5Or5vIISNbgSwrSCWGUQTQcDGdQWuK9GEia6F0I0Ag2euju/jL4RoF0LcKoRoAN4B3DPW68wlASq/3ny89zchpeez9Hy6deRahhjwjaEfHYpyRlEBXVGGjLXPPH9fH+mvd0zqfYQhiHwoRfVdCwm8adR5LgAHGQzki4UQnx0aAh9djxDStCIHhNAdU9PQ0YiGQ+C56B4YnoHpBjA9HcsTuGUXxynjuRKhaaChM8F1NEKIXwoh3sVgT/32obYPE7g0QtWPFxD5QCVok7tsp/xSjr6/3Q/Dt8m3AI+qoK6caVRAVxRASvkZRgTz4lMZ+r84uXlLjCaL1PfmE/tUDSI46uOXAT4rhGgYCuTHvbmUUuhGZAeIDEKTuq5hmiau9MiXCpQ9l7Ln4ElwPR+nXMZ1HTyvjO4LhJy84DrUa/8sg4vpbh/1d1sj9ulaqr4770TWCJyU4pMZ+r846ndEC4O5AxTljKECunLGGzpo5bajy8ob8/T9Xduk5mQPXh2n6gcLMBeNGdC+y2CPfFQwPA4pYlX7JHoPGGiaJYd63vgCHOni4oLmg+6j62AYBqZuo/lIPD/PJC9bOyqwnw28MPLvZkuQ1J3zCb87OZm3JX9vH5n/GrVgcZWU8t8m9UaKMoOpgK6c0YaGZb/BUcefuvtK9P6f1knLyy4sQfyv6qj450ZEaNRH7gXgCiHER08+jalAtxJdaNoOKaWQuk4iEcf3BLquYxgauiHRDA/bEkQiNgErKCUmvrCymh5+Ha6blPc4qmVCbBZCrGJwjn1Y91mYgvhf1g2mdI2O3l8/XpnvdpG7p3dk8WfUKW3KmUIFdOVMdwdHrWiXZUnfX7fhZyYnA5xebZL69nzC7xqzR3qbEGLV+FdkvwrskJ7nPlEoOsJzfeKRqAzbBrrnEzQEml8gYPkYBhiGIYXUhFfWcD1rux2qfBEemtLsOENz7A0MDsNnjv5b4M0xqn64AHPx5A3Bp792iPLmUQlu7lTnqStnAhXQlTPWWPPmA19px9k5OceJGs02qe/Mw1wyKmAdZLBXfutE6hfibIQ4G9MO3K8Z4de7uzP0dA0IS1jSRiOsmyRCQYKmSTwSIxauEKWyLh3CPdIK/6tZtbxXiFOTW2poGP4GBrffHaHXmaS+OY/ApdFJuY90JH1/vR+/f9gPshjws0m5gaLMYCpTnHJGGpo3v5+jhtoLjwzQ9/dtk1K/tSxI8va5aPFRQ8q/BT48maeEyQOPiLznXF7s2f+DcnZPo1PuEaWiJ41AWOhmkGgogG370vUFnt6UDVQs+zMzEPmRUXne1CeiH9nWwSmO7wNXDfuDDwNfayf3s1FD5uNiXxSm8o7mkV2W24d+WCjKrKQCunJGklI+z1Gnp7mtZbo+vAuZn/i8ub0qQvLLTWOtYr9tor3yY5GZV0R/+95P5Lt3fcUSPZF0T7fYun0H/QMlCvksVdURef7qywlWLv11aunvvR0qiqeqdz5mewcXq31mZHn2B92k/2NytglGbk4R+5NRed+vUElnlNlKZYpTzjhDQ+1HgvngvPn+SQnmgSuiVHyx6eiUpId99iRXsJ+cyNkycVbtnX5J1vd3pj+/bv3L1isbNwrXMfB9F5bOw9LDAsxHoGJy5hQmQAjxWSnlJgbXMBwZb498KAUC0ndMPKhnv99N4NIo1jmho4u/DKyecOWKMgOpOXTljDI05Dtsi1rm2504OyYe4+zzw1T886hgngFumdJgfkRVKV4/976ms1oG6pqaZCIRp6YqyeJFC2mYMxctEJa6Fd4jhGA6e+eHCSG+xxjz6pEPpoj9+aie9cnzof+fDo483nWVlPLWiVeuKDOPCujKmeY/GLFFLffjiad1NRcHSH5lDsIaFcxvGApcU+pwkPakXvQN0zdDNo7nksnmKZbLuBLQdV/TtMlPrD4BQ8Pfb2GMoB794+oJ1+/uK5H5dtfI4s+qVe/KbKQCunLGGNqP/M6jywa+3D7hc82NJovKf5+LCA/7OB0O5qd0vtbzyq7ru77UNDwErgBP05AaSPA9ZPlUtudEDC0QfAsj9qtHb6kidGNiwvXnftCN8/qwEZgYcOuEK1aUGUYFdOVM8i9HXxQeGaC0fmIdVi1pUHnHXLTksOUo0xLMATB9bzDPq8ApS8oOOJ6L78vDKeFm5Gd+KKi/nxF71RN/U499QXhCdUtX0v9PB0bme3/n0E4HRZk1ZuSHW1Em29BCuN8lkMn7pO84NLFKNUHFFxrRG0adJPYP07aS2tc86eLjSqQn8H3wPQ/P9fE8KTRNTGkimYkYemY3cHRQ1wUVX2qa8GltzrYi+Qf7RxZ/eUKVKsoMowK6cqb4i6Mv0t/oxOtyJ1Rh9ONV2BeO6j1O7Wr2N+B7wvVd13cdH19o+FLDdT1cx0FIJGLmBnQYO6hrUZ3EbY0TPqkt863OkdMrq1RaWGU2UQFdmfWGeucNh6+9Tof86JzfJ8W+KEz0o1Uji2+fzmAOIN2S4/u+5/tS+L7AFwIfie+5GLouhdAnJ0H9FBoK6v9wdJm1PDh4/OoEeB0OubtGLYD8/IQqVZQZRAV05UwwrHee/X73yK1MJ0VPGVR8oXHkp+eFmZCFTLolRyBcTdPwfB9PCDzp47hlAF/42sSGJU6RoR9Gw34cRT9ZjTHfnlC92Tu7R+bpXyWlvHlClSrKDKECujKrDX1ZH+md+70u+XtHzaWelMTfN6BVjFoENyOGbj235EkpHE3TcZH4aPieh++4SN9HM8SM76EfNvQD6ch2NmEKKm5tGCtpzwnz0x7ZO7tHFn9y3BUqygyiAroy2w37ss7+sAdZGn9MC14Zw744MrJ4UnOzT4TQTAmao2kITQdN10DT8KUH0pO6nP6EMifpj46+MJcEiXwkNaEKc/f0jswKuErtS1dmAxXQlVlraMHTkRSvftoj9/Pxz52LkEbsc7Uji28XQvxy3JVOMl0P+WimIzQfU5foQqKJweF3X3r40j+tPvND8+nDMvtFP16FuWj8R67KnE/+vr6RxbeOu0JFmSFOqw+3opykDx59kftxz4TytUf/sBq9yjy66CAzbeuTkAjwhK6haUjhu+B7CCHwfSF8edqMuB8xdKDNC0cKdEHi1gbQxz/akPtZ71j70uvGXaGizAAqoCuz0tCX89VHCjw5od65scAm8r7kyOK/nSlD7YdpmiGFrnmIwXgnfA/wQICPjzh9T1j8GEdtZTMXBgheHTvOy4/PbStTfDozsvivxl2hoswAKqArs9V7OSpne3FtFr9//Md/x/60ZuQ+6BdORY72kyGlJBi0pS70og/oUsMUHgJwpcT1pLCs8Q9VTychxGbga0eXRW+pmtA3WO6no7awvXv8tSnK9FMBXZmtrj/6ovDQ+Fe2mwsDBNZERxZ/bNwVTh2BZvlCM9OWFSQSDRKNBAjbAUKBEJqmSVe6p9+Y+5Chofcj+d6NeTaBK8bfSy9tyOG2Dktt36DSwSqnM3UeujLrDK1YvurIdc6n+Ex23PWNsar6nqEe44zjSt13fJltbJrL297+dpAGEp9QPEokEsdHn9GZ4k7AfwP/ePgieksVxcfT466s8MgA0U8MSxB0MzA9aXsVZYJUD12Zjd519EXh0YFxb1UzGi2CV8dHFt86vmZNPdMIS98lpxkWFdXVBBNxKlJ1VMRrEZqpm5o2saTo0++bHD2XviSAfcmobYQnrPDrgZFFbx13ZYoyzVRAV2aj9xx9UXho1Jf2CQt/MDXyUzJje+cAyDJCeNKyIRASJCsj6BZksr24bs7wfef0nEQfMrQI8TtHl42RgveEuftKONuHHa3aoPK7K6crNeSuzCpDq9uPnKrmdTmUXh7fEakipBG6/vTpnQO4xT5cJx3o7djHjh0b6O3N4ZUFgWCQc1e9RQQSc/XpbuMk+DKDaxiiANaKEPb5YUobxvf/ufBwP+biYfkFPgjMmNwCinKiVEBXZptrjr4oPZcdud/4hAWuiCHsYd3zF2Z07xzI5dMCWTY0JF1dB9m58wBBK0IyWYHrFEDK033IHSFEu5TyO8BnDpdF/7ga7e5xbkscfYrb6nE3TlGmkQroymwzbJVyaUN+3BWFrhnVO//JuCs7RQwd6UlcIcFAx9Qs3JLEKTt4rovv+rOhhw5j9NKtFaHJqrtBSnn5tJ1pryjjpObQldlmWO+qvHF8w7BahYG9ethZ5xngrvE369SQngUYZTDRpIGlBcHXEUJDeuD7s+MzPzSX/r9TeIubp7BuRZkSs+LDrSgwxvx5u4PX7oyrruBVsZFDsb+eaVnhxqLHEr5rWH1oQQwjiGnpGAEdT3r4ooRmOrPpM/+1N37JuKlhd+W0o4bcldlk+Pz5+vHvPQ9cPiqRzAPjruwUknYAz5OlYDDCRRddyrnnamRyBSJRi3hVI3jabBlyRwixWUp5GzBqbkRRzkQqoCuzyfD585fGN38uDIF17vD52JmW5vVYQqGkTBui7AtJIpGkmNeIJywMywXbwvG9kJSDuWWEOF3Tuv/OUPY4RVFQAV2ZXZYdfVHeOL6Abi4JjFrdPoE2nVKZgUMgpe65JTa8so4Dbd2UPZ9YPMDS88+nYX5D+I1rURTldKQCujKbLDn8H7Lg47WXj/faY7LOGxXznp1Am04tKQEf1yvR03eIg+37yRXKxCpC1M1vJlUuqoCuKLPUbFogoyhHTupwW8swzqzlI4fbgSfH36RTSvoCNE1zNE1DCIEQOlJq+L4AaaAJa9bMoSuKMpzqoSuzwsh0nW5radx1jTF/flpkDRNC4LodFF0cpEBIgRA2nuOBp+M7gGec9ollFEUZm+qhK7NF4ugLd//4htu1CgMtOqwTe9rMnwPoerUUwigjdDRNQ/oOwvfAleBLhJBqyF1RZikV0JXZ4pyjL0acc33CjAZzZNH4z+acJqYZKEgMNE0ghYthgEAi8BH4alROUWYp9eFWZoumoy+8cfbQ9cZRI9IzOnf7GKRlWQUhkYFgmHAsii5cotEwlmUiVUBXlFlLfbiV2WJYQHfbxtlDbxoV0PeNsz3TxnF9x7YCctmyleKsJechpIEhBKGKGKYhgnD67z9XFGW0/w8AAP//7N17nGRleeDx3/OeU1V9n+npuTAzwAwXN6Ag4xU1IGMiagzKeDfRKHHjbrKJEXaTbO7ixqjr7ieOm5hkvSySmPWCroDgBUSDigJiBAVFHWCAufdcuqe7q7su5332j3O6p7rqVHdPdU93XZ6vn5apc7pPHYaueup93ud9Xku5m7bkR8sN/Vy4uSag717svSwnESFwQQEVnwl7EJcDAgKXw0fK1NRkTgTaoKeMMaaKjdBNu9g8/Qct+Ia3THVra+bQ72n8llZIqFKOIp7Y/XN+9rNd5MemWLN6iPMuuoD1W0+3ZWvGtCkL6KZdnAjo+QajOSA9s5NWrbAhS7UoioJIVIqlCfITxxgdncQJRGUPBBbQjWlTlnI3bcdPNB7QXU/rvyS89yWvXp1z4BzeeyLvSXq424d4Y9pU6797GVNFJxcxQu9u/ZeEKiUFjwtRCYgiwCPiHGIB3Zi21frvXsZU6fSAjuDFoQQOFUdZFUUJXICqWqc4Y9pUG7x7GTPbEs6hP7zom1kJqogIzgW4TAYCQZwDEfVRKauqVuNuTBuygG5anqpunPU4WsTFolk7uvQv4korxqsAIkEQks1mCTNCmI2r91WjLPa6N6Yt2XyaaXkisj8p+ALA9TYer3TKV6bdN8/1vc3KSQb1gToJ6cpmCXMRmVwWCCTXNbAN+K6qNp7G6DyfFpGdK30TxszHArppO4uZB9e8h8ElvJmVoAioOBUyYUA2m8U5icflTnqB56z0LbaY96/0DRizEJZ6M22nei35yfCLKKhrFgESN4ITQBRxiooCHmxg3ohdK30DxiyEBXTTdhazlnwxFfLNwjkRFSFehw6gZMKQqOwpRyVA57mCqSQirbZBj+lQlnI37WIfsAkWmXKvakqjqhtbrVuc96Akle4iiDjiInfw4yUOvORh/Ejrf3A5FdzqgNNuO6/y0L0rdS/GnCwboZt2sWf6D9LtGt5QLDpYqj50ceO3tFIiUVWEJJiLgCRpd1UkYyP0esKzctWHnlyJ+zCmERbQTfsRcH2NtSxP2XZ162JvZ7n5qBSIhuIIybkA8eApIHhQgexi1vW1t8xZXdWHLKCblmEB3bSL45UPgs01u6YtSFQb0Lc0eD8rx6kyk3IPCMKQIAgRcSgR2thfTUcIz64Zod+5EvdhTCMsoJt2MatwKTyj5o15Qcp7awL6BQ3ez8pRPBIvXkv2R8e5kDjMR5Cx+fN6wnNqfm+swt20DAvopl08XvkgPKOxluXRnpo59IEG72fFePXOOQeqIA6REMGhqnjKEFpArydzzuyUu1W4m1ZiAd20i92VD8IzGwvofjwiOlyuPPTcxm9pZajiAcQ5nISgARAk5yIL6HW4wRC3elbthVW4m5ZiAd20i3sqHwRnNpZyByj+YGLWY1Xd0fDFVoBDIpIKd3HKzLpzmQ7oVuWeJlM7f24FcaalWEA3baF6rXi4pfFdQov356sPXdbwxZaZKqK4gqovq/c4EYJAUPVomTioZ6zKPU1KQZwFdNNSLKCbdjKTInX9AW6osb5JxR/UBPQXLOKeltkQ4lxZQOMRuuCqX+VWFJcq+7Tu6kNW4W5aigV0005mjahy23oaukjp0Sn82KxRbAvNox9GVMrgvHNCEDhEBJHpNLtayr2O7EU1vy/3pH2fMc3KArppJ9+ufJB9Zm9jV/G1aXdVvarRm1pumVxXKQhchGjc8tUJqhp3i8OjoaXcq7k1IcHmWdM0D7day19jrJe7aSdfq3yQe06DAR2Y+sZxui7trzx0BfCJhi+4nJzzIi5SUBCR6UCuHlTJXdZD7t+tX+m7PCW0oIz9n+GT/rnshTXp9oeW5IaMWUYW0E3bEJEHVXVmk5Zwaw63JsQfLc/zk7Wm/nUM/RNFMjNN4V/TKhu1OA0iEA8ubvUKxNu1eBRP5lld9K1bt6L3eKrkbx1p6OeyF9ak27+d9n3GNDNLuZt2893KB7lnNDaP7scjCt8eqz78hgbvaVmVnCt5CSLvQrxzSBLYPcRl8P7kP+C0ivxNxxr6uezTa35Pvpb2fcY0Mwvopt3Mnkd/duNp98nbRqsPvbHhiy0jF0hZcBHOIRLgxMV93JW4e1ybBvTy7kLaksN5uYGA7NNnpdzHrEOcaUWWcjftZtbIqut5fYwKM71VTsbUXeNo3iM9M597L1bVC5r9zV7FlUWk7ERwTlTEiSB49epRCuP7b+tHPwrS6tVx11PRmjd/Y2Oj865L+sHN2m/3tsXdljErwwK6aSvV8+jB5izZp/dQfODkR2465cnffIzeNw5VHr4WeO1S3OupIxEiZUTiHdec4JOCOFQpT43s49DjN8uGs2oa17cKVb2aimDuxyPyNzc2f971opp2/bc0fmfGrBxLuZt29NHKB92/srrhC41/6ghEs4b3r1HVpt6BzUkYOSESESD+Uq1Yhw45wrLUvUBrmDX9kb/hKH785BMO0u3IPb9v9jGRTyzqzoxZIRbQTTv6XOWD7ssHkGxj8SvaXyL/1Zq59Gsbu63l4YKgLHHaHZF4Hbow/e8vALmpsNCyAT3prX/xzOOCZ/zTRxu6Vu75fdW/G1YMZ1qWBXTTdpI57lltYKvWlJ+U8X8+XH3o8mYepUsgJQ9FVUEkiKvcUeJgrqCSK+eLTlVbNai/t/JB/gvH8McaK/Trrk2339rgPRmz4iygm3b1qcoH3S9vPO1efqTA1OwlbAPA3zR8wVNMwyAqi5Q9IBpXuM+cQ1H1ORcWW/K1r6ofBM6feZz3jP9TzQeuBXGrg7T58880fnfGrKyWfFEbswCfAWaicNcL+nCDjdeAHv/wQfCz5tIvb9ptVcMeBOcFicflIrjZO7RkpRy13Gs/yYq8rfLY2HXD1fvXL1jPKwer0+2fb4XGQcbU03IvamMWInljPrH8KBB6XzPY8PXKjxSY+GzNPO3fNXzBU0dzPuMdUpLpKvfAEU+mK6qKqmbLqsFK32gDPkZFZXu0t8jEp440diUn9L52TfXRTzZ8Z8Y0AQvopp3NeoPufeNQ5Zrykzb2keHqNrKbkxRw0xARQjfgRaQoyePABUlJnIAqqmTKZW2p136yTO3iymOjHzqIFhvbOa7r0j6C0zKVh/aJyI2N36ExK6+lXtTGnIzkDfpEcdxAQO+Oxkfpfjzi+N8erD58taq+sOGLngq9ZQ9SFOdwzuGcIJWNU5xmxfuWee2r6kbg3ZXHpr41xtS/Hm/4mr2vH6o+9D8avpgxTaJlXtTGNOgfKh/0vnltw0vYAPJfGklrL/p/k6DTHKZ6FfBCIE5ChBAhiBvLIODJOHGtlHKf1RHOj0aMvHdfwxfLnNtVvRPfGFYMZ9qABXTT1pImITPv/sHacFEV7ygce9ce/NisJiabiYNOc8iOoVrGIXGVOwFogKpD1EEUZXzkWyKgq+q1wOWVx0bfvw9/pPF+9P2/W7N17OesGM60AwvophPMSqf2vWVtde/ukxLtLzHynpoR4uVJ8Fl5rksRKU1vnaqq061fJWn/Gohr/td+Mm/+rspjk7eNMnlH46n27LYeun6xpidB0y5BNOZkNP2L2pjFEpGdVIzSw9Oz9PzqqkVdc+obx5n4XE3V+7tU9apFXXhJ9KtABIpIEsO9MvM/xeGbu6lMUpcwq+Cw/FhhUal2gIF3bKg+tLPZN9sxZqEsoJtOMWuUPvB7G3D9i8s6H995gNLPp6oPf6gJiuRUXFCcbvcqDsq+jJ9eRy8alGneKvfk7++Llcf8WMTRP3gCzfuGr9t1WT/ZC2ftez4GfKDhCxrTZJr2RW3MUqoepbvBkP7fqZlLPSlaVI798ZP4kVnz6QPAF1c4qKuIi+DEIFy94qNoeh16oFGpKV/7SXHhF6kogsPDsT/fQ/nJYuMXDoSB/1QzOv+4zZ2bdtKUL2pjTpHfrXzQ++o1ZM7rWtQFy08WOXrN4+jkrJHjAPCPK1j5riJSEpjZB14VIu9R71EljHy56Yrikr+vO6gM5sDozgMUvju+qGv3/cYQ4Vm5ykM2OjdtxwK66RjJuvQTu2k5WPVHmxb9Kig+NMmxP32yujXs+cAdK7WJixCUFMH7eFQeRUVUPaqK03IQOB+ISGNdWU6B5O/pDir6tAOMfeQQE59usBtcItyao//tNdmYv7TRuWk3FtBNp7mGih7v2Qu66bmi8WYz06buGmfkr2sKts4H7lqB9LsqGolDnAsQkbj16wxx6ptnDj35+7mLqmA+/i9HGPvY8OIu7oTVf7kZycyqAbw3mYIxpq00zYvamOWQVDR/vPLYwO9vINiQqfMTC5f/4khaJ7mVmFNXUS0LkuyFDrO2T0VFpDkCerI07U6q0uwTnzvK8Q8dWPT1+940RPaC7spDY8C/X/SFjWlCTfGiNmY5icg1VBbIDQQM/tXpECx+Jdf4Px9m9L/vh9nF2NNB/epFP8HCqIgUVb06UcTFPd0hQvAoiPfhii9bU9WPU7U0DWDsY8OMfmDx2fBwS47+/1iTav+4LVMz7coCuulUswrkstt6GKh982/IxOePcuzPnkTLs6aoB4APJkHslEp2WStPp9rFSZxxF1AEREXwKxbQVXWjqt5N1VaoeBh53z7GPnJo0c8h3Y7B951e3eb34eTDnDFtyQK66UhJgdysedS+t64ld3Hfklx/8o7jHL368bR1029T1R+f6mI5cW7KOVGXzJ2LnFjEJiKCsCIBPdlD/g6qdk7TvOfoHz5B/gvHFv8kAqv/YhOZc2tWMPzHxV/cmOZlAd10rGS0du+JAzD43zYTrA2X5PqFeyc4/Du7iYZL1aemi+WuWpInqqD6x6j+MR436UFVBeeyqAZ4jSvefeQD1Whp/iUXfF+6UVVvAL5AVfFb+dECw1c9ytS3xtJ/+CT1vWUt3S+u6QR4jYh8c0mewJgmZQHddLodVFS9u8GQ1X91OrJEU8yln0wy/KZHKHynZh31AHCdqt69tKP19wHvQ0RKqkmGHZL16PEUgCqhj2TZArqqvgt4GHht9bn8l0YY/s1HKe8uLMlz5S7uY+B3ahrIfN6q2k0nsIBuOlqyFvktlcdyz+pl1Z9vYqmS0n4k4sh/fpzjf3+weq06xKnnu1R1STcIUWWutmqC6ClvLKOqL1TVHwPXUlXFrnnPyHv2MXLt3uqmPA0Lz8gy+N7Tq9/VHhaRmg8SxrQjC+im46XNp/e8fHXaRh6N8zD+icNJCr5m688B4BpV3aOq71yS51PKEDeOEQTnHIqe2BNd3Sl77Sfp9Y8TL0c7v/p84e5xDr1xF/mbl2C+PBGclmHow1ur+/OPAb+0ZE9iTJOzgG4MM/Ppn6881vfmtfS9ee2SPk/xB3mG37CLic8erV7aBvG+6juXJrD7kghKXPGe7Lqm051gESdL/tpX1R3JPPk+qivYAT8eMfKefRz5/ceJDtTUFTTMDYUMfXgrwWk1vQSusG5wppNYQDfmhHcQz/XOGPj9DfS8fPWSPokfjxj9n/sZfusjFB+cTPuWysD+Nw3NsQslcaKVXeLirdA1aQG7NCP0ZDT+TlXdQ1zwVpve9pC/6RjDr1/aUTmAWxWw9u+2Ep6RrT5lRXCm41hANyaRjOZ+iaqgvvovN9F1Sf+SP1/pp1Mc/q1HGXnvvuod26ZtJm5V+6OkeO6dC93wxZEpeI96FJygomgUIUSIKiLlRbXGS+bHbyD+u9qZ3GuNwnfGOfSmXYz89T6iwzVTDYvi+gKG/nYL4Tm56lPXWBGc6UTLunTFmGYnIvtV9ZeA+4BNADhh8ANnMPKuvUzePrq0T+ghf+MxJr86Ss8rB+n7jSGC9amx9uLka6eq3k7c+/wbdUehEpSQE7Xtigf1CB5QgZOrck9a174I+EXgqdQJ4NMK94wzfv1hCvdNnMzTLJgbDFnzN2eSOa+7+pQFc9OxLKAbUyUJ6r8G3AL0A0goDL7ndNxgEM9/LzGd9Ex85gj5/3eU7peuou8tawm31ow8p12efF2rqgD3AN8BHgBGgJsCkZKI84ig6Ewt3PTSNRGtO0JPsgDPBS4DXkBVE5i6ImXyq6OMf/IIpV1TC/qRRoSnZ1nzoS1pafadFsxNJ1vxfs7GNKtkVDoT1KeNXTfM2D8svj3pnBzknttHz8tW0bV9AOk5udmx0sQh9j7wyWj06O5g/74nGD58gME1a9my+SnaP7iV9U97xdd7Bs+ubIt3PlVLyxb8XLummPzyKJNfGUmr4F9Smad2M/TBM3GDNWORz9vyNNPpbIRuTB0i8k1VvYKqoN7/m+sI1oSMvG9/2rrypeHj5V2Fu8eRrv10XdJP98tWkXtB38Ka3ohDXBDES9ZAHGh8r6IoLsj98mJur7y7wNQ3x5j8yugpHY1X6vrFPgbfewbSXfPhZqf1aDfGAroxc0qC+i8AXwfOmz7ec+UgbjBk5Nq9+PHUgrYlo1Oeya+NMvm1UaTbkb2wm+y2XrLP6CF7YU/1BiTJjbtkH/T4nzMbp6qCnnwjl+hwmeL3JyjcM07hexNEB5du2dlC9L5uDav+y2ngav5dbc7cmIQFdGPmUVEoNyuod72wn3X/cg5H/+RJSj9OXX625HTSU7h3gsK9cbGZZIXML3QTnpUjPD1LcEaW8PQsrOdEMBeNV64pRCheFCXlQ0ikRMNlooMlon1FSrsKlH42RelnU/hjpzaVXo/rC1j1Z5vo/uWa2YAx4PdF5BPLf1fGNCcL6MYsQEVQ/yfgxdPHg40Z1n7sLI7/7UEmPn0ETlEGvh4tKsUf5Sn+KD/7frcUKf8HRb0ieJzEte5lFMUzdv1BJh6M0IKiBY+ORkRHy2nNblZM5qndrPnr0wk21xS/jRE3jbF15sZUsHXoxiyQiOwXkcuB62YdD4VV15zGmg+ciRs45S3SF6Yk4N30dizMVLcDqFJ+bIriD/KUfjxJ+ZFCvEa8WYK5QN+vD7H2Y2elBfOHsWBuTCoboZsVp6rbgA8u8WV3J1/VRoD7Kx6Pisj9Kd9Xl4i8TVW/CfwvKorlui7rZ9155zDy7r2nbP31QmkEou7EPuiicQt3jXPv6rQpl7gEGzOs/q+byL0gdV/6zwPvWEw7V1XdCmxJHq4GtqV82/ZGr59GRF60lNczph4L6KYZrGaJ30RPRrKWG+Bfk3/urvwSkTurf0ZEPqGq9wE3UDGvHmzIMPT3W5m8bZTjHzqYthf68ohACAGN59JVkvp28BpB0CzD8ZiEQu8bh+h/+7q0KvYFzZer6mXJH7dX/XNr8mVMW7OAbswJ29MOJgF/N/HIfvrrThF5EDhfVf8P8JuVP9P9klV0XdLP2EcPMfGZo2h5mSfXI4EoONHHHVDv46Vrqiz91iyNy17Qzao/3UTm3K600w8Dr0v+roGZjM5FxEF6OxawjQEsoBuzUFuTrx3TB1T1fuJR/U3ErWLfT0UKXnocA+88jZ5XDDL6P/ZT+P4ypuG9IJGDQECno/eJuXQNVz7l7taE9L99Hb2vXlOvxdV1yfTGZar6LuLgvY04o2OMqWIB3ZjGbUu+rk4efwXoBS6t/Kbw7BxD/7CVqW+PMf6JwxR/mOeUU8ETgMvEbdvVgfcQRTgPuFO7dn4ublVA35vX0vv6NWnpdYhb2H6JOPuxzKkNY1qXBXTTlHZNFPmtH+476Z8LROgJHL1B/M/pP/eHAWuzAetzAeuzIeuyIetyAWsyS1qV/rKKPx8DBitPdl3ST9cl/RT/bYKx6w5TuGd8KZ+7ViSQAZesR59uLKN6sluzLA3XH9D760P0/dpQvVa2U8AB4nT6RUv1vIeLEQcKZQ4XyxwveybKnolIGY+m/1zxlZybiDzRSX6WWBUG3PScM5bqto05aRbQTVMajzx3HlmGkSywqStkQy5kQzZkfS5gc1eGzV0h5/ZmObc3yzk9NUunFmI6mHuqlodmn9nL0DN7KT08ydh1h5m68/jSLxk7kV1PmstI0vo1/lIXLVvKPdiYoWfHIL2vXYPrr/sBqgx00cBc+MFCmZ9PFPnZRJFdE0V+Ol5kX6HEk5Ml9k4tX0OcoWyTLFk0HcsCuul4+6bK7Jvnjf/c3iwX9ue4bKiXy4Z62DaQWsCVZjqY1wT2zHndrPnvZ1DeU2TylhHyXxkl2lc86fuvkXSFc94BijiHquJ9hPc+3nktOMXh3Aldv9hHz6sH6Xp+/0I6XizovehIMeLukUm+NzLJvSOT3HNskqOllZs+MKaZWEA3ZgF2JaO/LxwYA2AwE/DCoR5evLaX3zh9NavCeSNW3cAenp6l/7fX0//b6yn+IE/+1hEm7xhFJxoftosK4pOnUWEmyquicbRv+NpzCbfm6H7xAD07Buvt6z4tAhY0pH0kX+Qz+45zw77j3H98eTaCMaYVWUA3pgHHShE3HRjjpgNjvOPBA/za5lX8+qYBrtjQP9+PTgfzIlCTy88+o4fsM3pY9UcbmfrGcabuHKPwgwn8kZNMHSsQhcnTKRChGsbBXFm6xjJOyD69m65L++m6bIDwzHmnJwpAjnmC+aFCmY88McJn9o3y4FhhKe7UmLZnAd2YJfCpvaN8au8oG3Ih/+HMQd5x1hrWzT2nmgUmk6811SclK3S/dBXdL10FxNuVFu6biHc8+7f8vJulqBdEsyABzsUbtHhfRLUcr6vPNJamllAIz8mReWo32Yt66HpBP271vAPtceJit3OJg3ldtw2P85EnRvj8/uMN3Z8xncwCujFL6GChzF/9fJi/+vkwbz9zkD86Z4hze+uOWruTrxuIh9IvoWIde6Vwa45wa47e18axv/xogdJPJyk/WaT8RJHyk0WiJ4szW7kK4CKJW78m/V8VjavcidBgngpugWAoJDgtQ7A5S+b8brJP6yZzfnf6dq3pHibeS/5XgKfN9Y0ffeIYH3jkCLsmlqCGwJgOZQHdmFPko08c46NPHON1GwfY+bTT2NRV9+X2OuBG4EzixjVvomJHtzTh2TnCs2sHu/5YmfLjRaJjJca6DiBjAsl+6F49ikdVCbZk6H3jENIlSLdDcg7X6wg2ZAg2ZQk2ZpBMQ0n5h4HvAp8AzqZqI5tq//j4Md6/6zCPT65Qi1xj2ogFdGNOsRv2H+eWQ2Nc++/W80fnDNX7th3ES7ZelfSJ3wi8AbgEeD6waSHP5QZDsoMhqGfyiS74abwpi4hDfcT00ursBV2sesVpi/w3m3Ev8GXgc9MtWlX1KuYI5l8+NM5v/2g/T1ggN2bJWEA3ZhlMRsp//clB/mnPCB97+iaeN9id9m3bgB+o6ouSHeB2Jl+o6gXEo/aFBXgRnAviNejJobjpWpx2Rxuuch8DfgJ8B7gTuKd69zNV/SAnuufNMlr2XP3QAT7x5Eijz2+MqcMCujHL6KGxAs+/6zE++LTTuPqsmlo4iPuUf6MiqAOQjHwf5ESA3whcTDyq3wJcAAwAz634mWT+XE50igO8KgvoqLoP2AM8mXw9ANxXuUlKGlW9Drgq7dwdhyd4y/17513zb4xpjAV0Y1bANQ8d4O5jea67aDPdtU1epoP6WSKSOpRNRsU3pp1TVVHV1xTyw28H/5Iw2RndRxHlUhmnjmhq7BHgk8zeGx5g13xBux5V3UmdYL7zsaP8lx8fwFtndmNOGQvoxqyQz+w7zkNjBW557pls6a5pwlI5Uj/p/HQ+//hNxamjlwlcLrh4Dh1Q9ahHi2OHfga8W0SWJMQmc+bvTDv3ew8e4MO7jy7F0xhj5tBEuyIb03keHCtwyV272Z1PLQ7bRhzUT3q7UNVulCgCRURwEuCUuJ+793iNluzDvKruIKUAbjJSXn7vExbMjVkmFtCNWWF7pkpc+p05g/oHT/aaqr0qKmXn4pe4SMXcuQhedbqN3KKo6jZSgnmksOO+J/nyoVO8o5wxZoYFdGOawDxB/apkFLxQmoty6pByXBCXNJdxSaW7KighLK77a5I5uI54euDEceA37t/LbcMWzI1ZThbQjWkSe6ZK/NLduxkrpy4pu05Vty7kOiJCdnUWES3Gle7xHLrgko5xkYIPWPzr/1riDMIs//mhA3xq7+giL22MOVkW0I1pIo/lS7z1/r1pp1YDXziJS6kEuaKK4MWDQOhcvCOK84gQwLGGN/BW1e2kFMH94+PH2PmYzZkbsxIsoBvTZL5wYIy/TS8k26aq1y70Oo6grMSpdhcIgQsIRBAHCCFHCg0F9CTVXvPh4tF8kWseOtDIJY0xS8ACujFN6A9+fLDe3t/vXGDqXRXKAEJA4EICFyJJNAeCsWCy0df/Tqrmzb3C676/hylbaG7MirGAbkwTKnrltfftSTu1mnjuel6CFgSHE0GcEIYBgQsQQFUD9VMn/fpPqtrfWn38vbsO82+jqR9AjDHLxAK6MU3qkXyR9+46nHbqrckc9lxUnJREnIg4nDjCMIMLAhBFUedK5UZS7jVL6B4aK/AXPz3UwKWMMUvJArppOef15egLO+NX9z0/H+ZAIbX3+bvm+rmkur3kXIA4h3MBQZDBSYAgOOfCyKtbQE/3GcmHiO3Vx9/xYOfMm3e5Ra30M+aU6ox3RdNy5nrbLHrl5ev7lu1eVtJkpPzpw6mj3+1Ju9W6hLCAihdxOBfGAT1wiBNEJYg8ASe3Fr2mgcyth8b5xpGJk7hEa3vR2t665yzUm5VmAd00pbnGjWPliFefNrBs97LSrntypF6B3Jyj9CDIFEFUnBAEYTJKd4gojshldeFV7smHh63Vx//wxwcXeomWd9FAF31B/bdMKwc0K80Cumk5w8WoY0bo0/4gPXBunWsu3SFR4JwG4nDOxQVxIki8Lt15dSfTz73mw8Pf7z7GT8YLJ3GJ1nblaf0cT2/6Y0xTsIBuWlJ/6PjVDgrqdxyeqDdKvzrtoCqoUBInStL61TkXB/S4zj0UCgsK6MmHhq3Vx9/98+GF/wu0gddvHOB4OVrp2zCmLgvopiUdLUW8qoPS7gB/8+iRtMNX1lmXLpH3kQsCBeLWry5uAYs4EIJyqVSzZ2sdNaPz6/eMcCi9WK8tndeX42n9uXpteY1pChbQTUs6XvLsOK2foIMqkT619zgH04PotWkHQ+fKQCTJBi1OJNlKNW4s4wKZdw49+bCwvfr4zkc7q73razf2A1jK3TQ1C+imJY1FnqFswGVD9auO201ZtV5L2CtT90xXSiJOhTiQT++8Fv+fOi1HCxmhX1t94FtH8/XS/21rR5INsoBumpkFdNOSxpM31h2n9a/wnSyvf3z8WNrh1UDN9qoimRLqIkQIAghDwYkDPOJ8WI6muhfwlFdWH/hfHbb5yqaukGet6gJgpGRz6KZ5WUA3LWksKU565YbOCuhHihH/vCd1a9KqgK6gGgnT69ADnLh4+lwUUCfOzzlCT/ZgnzXy3zdV5nP7jy/uX6LFXJn8jk1GtjDNNDcL6KYlTRcnbenOcGF/boXvZnl9Mn2v8ariuDNQ0UhRFQnUuQzOhXHqPV4x7RSdL+V+VfWBf+nAfc5/dcP0/LmNzk1zs4BuWtLRitTnqzZ2VrX7bcPj9SrMK0bprwGVknqNR+iSJQiyCIKiqEZO1Nctikvm5GvS7Z02Ou8JTiyPtPlz0+wsoJuWdLh4IqC/usPm0QE+vS81sFbsgrYTCbU83UUm6e1OslFL3F5GdK4q95o5+ScmS9w7Mrnoe28lL113oujySNFG6Ka5WUA3LakyoF800MWW7oUuqW4P/zc99b2tMu2uqhGiPi5wd/HGLBJvp4qISEQ4RwfymoDeaaNzgNdUZH8OFztn3b1pTRbQTUsarnpz7bRq93tGJtk1UUw7NROIwyAsqriyBqAhKmGECwTBkUFEvKZ2iquXbv9selagbWVEZhVdHrIRumlyFtBNS6pOf3Za1zioO0qfCegeVxbBu7jtq7hkdB63fhURCEVS9xTZXn1gz1SJezos3X7Fhj76K7bptZS7aXYW0E1LGq56c71kTQ8DHbJH+rQb0lPgl003mVGNIqCMOALn1AVxL3cF1Hvnte6ytZp0+xcPji/ZfbeKV1QtiazOChnTbDrrHdC0jerRUiCz5zs7wYNjBR6fLKWd2gEQ+LCkouVkhE4QBgRBgHMCgqivu2ytJt1+68GxJbzz1lAd0A/bCN00OQvopiWljZZe1WHz6AA3HkgNtPEIOyMl51xZXNxYJnABzsUveR/n3EPV2Rl3Vd1GVTOZolduPzxxKm6/aV2ypoe12dmLAKqzQsY0GwvopiWl7Xr1ig399HVY2v2L6SPny+J/ZBCRshNwTmb2Q49juKKetGVrNen224bHKfrO6pKW9uHwiKXcTZPrrHc/01b2pzRXuXxt52zWAvE+6SkfblYDO7QnGxGFEcRpdnWCBEIogHpcsu1alZp0+y2HbP4c4FDBRuimuVlANy1r31RtQE97I253X0oPuFf6bJ8XgjK4uK7dTTeYEURVEAmoWIierGHfVn2hOlmAtnVWT4an9GZrjltRnGl2FtBNy9qTUhDWiQG9Xtq9P+qOnARlQZKwnWyjCmiybK3qZ7ZXX+RHY4XUD07tbEfKEsjxsrfWr6bpWUA3LWvPVG1AX5sNuGRNzwrczcq5NX2EvpXVZ1yojrKDmZE5IgQiOAmIRKoDes38eSdWt6c1KXoy5XfNmGZjAd20rL11Ro6d1jVupBTxzaP5lDPuTaBlAEGYbgEbD9cV1XKG2b1fL6u+Qp0PC21rKBvwwpQPhE+mLw80pqlYQDctq96b7Ks7sGvczanL1+QKoATTUXs6qAsSv/JnXv9pe5+Plj13pX5QaF/TO6tVe2Kys6YdTGuygG5a1p46I/SzejKc39dZe6T/vwOpXeO24HICCKpxYRzgnEdEcMzabW179Q/fenAstS9sO6tXg2Epd9MKLKCblrVvjjfZKzss7f5YvsTPUjZrCXL9a0VAFEDiF/xMjZxkoTidcq/tDtdh6XaAl61LH6HvtYBuWoAFdNOyHsvXf5N9ZQdWu6d1jQtzvWfGVe5xuh2onDUP4fB0d7itlT8XKdzSYQVxL1nXV7cx0eNz/K4Z0ywsoJuWVVLlWCm92cfzB7vZkEvdHbRtpS1fcy43GG9+XnUiPhBS9EJKuv3bR/Mdt0zrlRvSR+dQf3rHmGZiAd20tN1zjJxeMccbdDv69tF8zZpxcQE6MxN+IqonS9hy5EsCvLX6WnXm5Nta2vrzaY9Ppu49b0xTsYBuWtrPU+aNp13ZgWn3z1VtqSouQMQlATypcI8Duyp0af+ms6jqDqfAZ/d1VkC/aKCLzV3pGZ39hTKTUaeVB5pWZAHdtLRd+foB/SXr+ugO0tqVt6/qeXSRgGStWlIYR/xYFfVRDglq1p7fNzLJgZQ++e1sriLKXXN8aDSmmVhANy3tkTnebLNO+NX1nTVK/8aR2Zu1SJAFBHGCS0bn8ZapivioS0ReWX2NL3dgdftc2Zy5fseMaSYW0E1LmyvlDnBFh82jA3xl+ERAdi7AuRARJ05cUu2eZC3i4fsV1T9/c4dVt2/MhTxzVVfd8/P9jhnTLCygm5Y235vty9f301lJd/j03hPz3yIh4hzOuenM+8xXkOk5o3pmeNdEke+PTi3vDa+wl8/zoc8CumkVFtBNSztQKFPw9QuW1mUDnru6exnvaOXdcmhspohLnCNIArpzgscTb9YCLshtrv7ZG/Z3VjEcMO+0zFx1GsY0EwvopuX9dLww5/krOqzaveiV2w/HaXfnQnAzW6aCCjOff4LMEDr7w9AXUnvCt7fL1/bOed7m0E2rsIBuWl5ay9NKL6+z4UY7mylskxAhBHV4DyrCdFd3kWBW6uJwMeJ7I5MrcLcr56VzdIcDGC5GHddgx7QuC+im5T04NvcI/Zmrujitw7rG3T48AYALsigZkAyBC/EeSuqIIieoVPaa4bbhzqtun69F8E/myf4Y00wsoJuW98Pj8xdx/UqHjdIfyRf56XgRF2YJu7rj4jgJCcQRCgTiEednFQx2WnU7wKs2zh3QH1jA75YxzcICuml5P5pnhA7197luZ188OIYLAghCokgpleI2uWEQIEGA12jW9qhf6rD15xcNdLFxnszNQj4sGtMsLKCblrdroshENPc858vX95N1nbWA7caDYygOJIPXpK+7QiGKiERBTrz8bzk4NqshTSe4fN3cxXAAPzxuKXfTOiygm7bw0Dyj9O5AeEmdva7b1V1H84yWFJEgHqmLJ3CK+EjQCOHETnU3dmC6/cXzVLfD/PUZxjQTC+imLSxkJNWJm7V8d3QyqWwH1IGCE8GhVObbb+6w5WqhCNuH5g7oP58okp8n82NMM7GAbtrCj8bmn+ucawOOdvWtI5Ooejwl1EV4cSiCRJ5AHaLxKHS4mL6vfLt6wWA3uXmmYGz+3LQaC+imLSykGnldNuBF84zK2s0dR/KETghQQgIcjgBBnEPEgcTFc51mIaseFlJsaUwzsYBu2sK9C2yI8vpNA6f4TpqHoOydLDKen8J5EF9GfBmiMt5HePWgnRnQX7eA34P7OqzJjml9FtBNW5iMdEEp0tdvGuiozVq8V47lp5iYGGP//n0c2L+XgwcOMDExQeQjRiPPPcc6K3A9c1UX5/Rk5/2+bx3NL8PdGLN0LKCbtnHPAkZUazIBL1pAdXN7EDww4ZVIy+Tzk0zk8yAQhiGC8NVD49Tf2qY9vWHTqnm/55F80Vq+mpbTWf0wTVv73sgUbz9z/u976+mr+frhiVN/Q01AESaDLH39/XR35ci4ADRCgxwi8PXDndVMBuDNm+cP6N8bsYI403pshG7axt3HFpYifcOmAdZkglN8N81BASIliIRskEUJUOdwgRAEjjs65IPNtDduGmBT1/zjmIX+LhnTTCygm7bx0HhhZh/wueSc8HtnrVmGO1p5HvBOcS6CKEK1jNcyoOS950ips9LKf3Lu2gV930Kmb4xpNhbQTdvwCnePpI6sHq8+8J+2DJ76G2oCHqEkDpwgEm+NLklV4Ggp6qgCwUvW9PD0ga4Ffe/dHVYoaNqDBXTTVr5xODWgj1Qf2JALeWcHjNIjFfJRFqdZUBANcOpQlJFCCYGOKYp733nrF/R9d1l1u2lRFtBNW/n6kdQ54YuAd1cf/IunrKM3aP+XQKFUYqowhfeKagHVKcrlEiOTeeKyufb3y2t7uWRNT9qpmuzN7R1WV2DaR/u/m5mOcs+xScbTlxv9KzBaeWAoG3D12e0+SlemJkc5cGA3j+1+iMd2P8Sjjz7EgYN7iUqFuKd7B3j/+amj8ztJSVDcPmwB3bQmC+imrZRV6zUE2QHsrD74x+esZf08e2K3Mo/gwxyK5+ixw4wdP065HNHT00t3V7x0rd1D+q9vXsWzV3WnnboR2Fp54HjZ8x2rcDctqn3fyUzHuuPwRFqv7suAFwFXAzMLkftCx3t/YT2/9cN9y3iHy0cRpGsVp59+Fhs2rCdwId1dOQpkGQ6z0OYJ957A8T+fuiHt1E1pBzulP4FpTzZCN22nzjz6NmA1cUCf5W1nruYZqxZW/dxqFCgTImEXznWDdFEoOaJIiMqKtPnw/E/OXcvG9AzM1cRZm1lu78BGO6Z9WEA3becHo1McKJTTTm0XkU9QVQglwEeevnEZ7mz5eSAvGZQAgjAugRNA41x7O8fzp/bn+POnpK47v5545cNl1Se+fMgCumldFtBNW7rlYOob8/SIrGaU/uxV3Xzg/NTUbEvzCJMI3hcJJAIpoRQIwyKieaRNq9y7nHDTs89IOzUKXEvK6PzHYwUey5dO8Z0Zc+pYQDdt6eb0LUGvBBCRG4lHabP84TlDvLjNNm4RlNLUBEePHmDs+DDlwijFqRGm8oeRqcMERLTjOP3DF27k3N7UHdWuEpHdwPbqE3V+Z4xpGVYUZ9rSV4fHKXol62aPP1V1RxLQryaeV7+o8vxnn3U6z/zWo+xug5GaAkUPfzZ2Hn/GefHBDmiA9tbTV/O2M1annbo++W8PyYe7ShbQTauzEbppS0WvfGW4ftpdREaAq6pPDmYCbrt4C4MdsnlLu3nx2l4+ftGmtFMPkEy1qOoO4gLJGUeKkbV7NS3PArppW/XS7qq6GkBE7geuqf6Gp/Rmuek5qfOvpok9a1UXNz7nDIL0ooCrkg9xkDJ/fvPBsTaceDCdxgK6aVs3HkgN6KupeEMXkZ2krEm+dE0Pd75gK911ooNpLs9e1c0dz99ar5XvNcmHN5IPczXp9s/vP36K79CYU88CumlbR4pRvaBePUK7ijglO8sL1/Tw1Yu3dES/91Z28epuvv78LawKU/87XZ98aJtWk24fLkbcasvVTBuwdyrT1q7fU7PRGsRp963TD5JU7HZSgvqla3r42vO2MJAeLMwKu3RND3c8fwv99YP5VVXHatLtn0z/HTGm5di7lGlrtx4c51gpSjs16429okhutPobnzfYzbdesJXVVijXVH5lfR+3P69uBuXO6mBeL91+/Z6a/+TGtCQL6KatlVT5l72pb9jvrD6QzLNuJyWoP32gi+9dcla9tc1mmf3u1jV88TlnknOpNQ4PkDISJ2VVw8PjBR44PrXEd2fMyrCAbtrex59ITaluTZYvzTJXUD+3N8v3Lz2bl62r2fjFLKPrLtrE311wWr1q9geIW/ym/Uev+RD3kfTfDWNakgV00/buPz7F90ZS1xjXvMHD3EF9IHTc+twz+cD5G2qa1phT6/y+HP926dlcld40BuYI5qp6FVVbpeYjz8eeOLbUt2nMirGAbjrC/05/496uqtvTTiRBfRsphXJO4jax37/0bC7ozy3pfZp015w9xI+3nzPXrnjXU39kDvCu6gOf3DvKWNkv1S0as+L+PwAAAP//7d15fFTV3fjxz5nJvhNCVpawCWERVAS3IqDUWq1iibW2WkFrbV0q+NSl9WcJPrZWrYJLW22roHWpAg9YtbWKCyooiCiyhVUgJBASErKvM+f3x72BZHLvnUkySSD5vl+vvp6HO3funJmM873nnO/5Hgnoold48UAZ5dY/3q02amnSrOa35d7ZY2LD2TB5CPcMS7Ib/hUdNCAylE/OyeQx6z3Nm8xVSs2yC+bmTVum7/GFe0qC0kYhThQS0EWvUOfVvBDAEjZfSqmjSqkZwHyrx0OV4sGRyXx8zmCGRknCXDD9fFAftk0ZyrmJUXanlAFX+Kwzt9Kqd/5+cRXbKus62kQhTigS0EWv8eQ3tj2yHH/PVUrlAFPx2Uu9ydl9Itk8ZShzBie2t3nClBYewsqzBvGXsWlORX1WAeObbbZiSWs9Houd1RbafxeEOGlJQBe9xo6qel6xXsJ2nVMvvYlS6kOMefVWW6+CsQf3gtGpfHxOJqfG2c71CgdzBieSO3UYFzhvYztXKTXFnBLxe0nfA5sr6nhDdlYTPZAEdNGr3L+z2O6hWYE83xyCnwVcgUUWPMB5iVFsnDyE58alkxIuOxQH4rKUWHZNG8aC0alOVfk2AqcFMMQOgHmTdp3v8Yd22X4HhDipSUAXvUpuZZ1toZmmXdgCYQ71ZmLTWweYPSCB3dOGcc+wJLsCKL3e6NhwPjw7k9fPHOCUg1AGzFdKjW/aZCVAOb4H9tU08HKBVIYTPZMEdNHrPGDdS08AAur5NWnWW7edW492u3hwZDLbpw7jxoF92trUHmtkTDjPj89g8/lDOb+vbdIbHJ8rz2nL9c2581a984d3F+OVfVJFDyUBXfQ6uZV1dpu2XGe3Lt2JUupDpVQmNpnwAIMiQ/nrqWkUTD+FX/bixLkRMWEsPaM/26YM5Sf9451O3YeRwR7oXLmvBb4H9lTX8+e9UkhG9FwS0EWv9NvtRTRqy65aq0AQKLMXORijV2kpLTyEx0enssN/4leP0ifUzeOjU9ly/jBmpsX5O30+AWSw2zGrwk3xPf7r3MPtuZwQJw0J6KJX2l/TYFfjfbzW2rbYjD9Kqb1KqSkYw/Ctqsw1GR4dxsqzBvEv57njk55bwc2Zfdg1bRi/HJzorwDP68BgpVSOQ8U3R2YeRKubsg1ltbxWUN6eSwpx0pCALnqtB3YWU2s9oTqvLQlyVsxh+PHAbGyy4QG+Z2Z3PzgymcQetj3rJckxbJw8lD+NSfP33lYBU5VSM9o5vN5cDkY+RAtzthzq4GWFOPFJQBe91oHaBv53R5HVQ21OkLOjlFqMkQ0/H4fAfs+wJPZdMJwHRyYTb79s66RwYVI06781hDcnDmS0c637fcBsc578w46+rpkI12rDndcKyvm4pLqjlxfihHdy/3II0UEP7S5mc4VlCdB2JchZMbPhc3AoSgMQE+LinmFJ7Jw2nB9lOCaMnZAGRYayYsIA3j1rEGfYb6IC5jI0jHnyxUFsQquh9hqP5nbpnYteQgK66NU8Gq7fWGD3cLsT5KyY8+uzMObXbRPn+oW5eem0DFaeNYiBkaHBbEKnuWtoX3KnDuPy1Fh/pz4PZHZkntyKXSLc/TuLOFTXGKyXEeKEJgFd9HqfH62xq+09XmudE+zXM+fXp2DMr1uuXwe4ICma3CnDuGto32A3IWhOj4/gy8lDeCgrhQjn4jmrMKq82e6K1l52iXC5lXX8QarCiV5EAroQwG9yC9lb3WD10DxzbjbolFKLm61ft5xfj3QrHspK4d2zBp1wc+s/G9iHT88dzHjnuvXN15O3pcpbWyzHJxGuUWt+8MWBTno5IU5MJ9YvhBDdpMajnYbel3c0691Js/l122H4C5Oi+fr8of6CZ5f5x2kZPHNqGmHOvfLH6cB68kCYSwyn+B6ft72ITda5EUL0WBLQhTB9cKSKv+63rCSWCSzqzNdutn7ddtOXgZGhrD43M5B56k6TFh7C598azDXOSXtNm6jMCfbwenPmyEmrofY1pdX8XobaRS8kAV2IZuZsOcQW657djI4UnAmUv01fotwuVkwYwNwhXT+vPiImjPXfGsKE+Ei7U9q7iUqbmSMmH/ger/J4+fGX+Z350kKcsCSgC9FMjUczY30elY1eq4cXBGspm5NAtmh9bFQKc7qwJvyImDA+OWcw6RG228FuBKa0dROVDmg1bw5w6+ZDdrkQQvR4EtCF8LGrqp7ZzvPpmV3RDrO3Ph6bErILRqdyW2bnB/Vh0WF8dHYmSWG21d6exwjmndorb6K1XojFvPmKQxUszuu0EX4hTngS0IWwsPRgOU9YL2VLoJOT5Joz59bHYySYtfL4mFSu7sQiNOkRIbx/1iCSwy175mUYld6CvhTNjrnevFU1uJ1V9Vz3lQy1i95NAroQNm7fcoi1R2usHrJMxupMSqk5GOvWWx4HXj4tg6l9g79zW6Rb8d5ZgxhgXdymDKNXvjjoL2zDTIJrlZxY3ujlknX7KbeeJhGi15CALoSDmevzKGnwWD00qzOKzjgxg2eroA7wyukZ9LMfEm+XZ09NZ2SMZS32pmDeJUPsYJ8EB8bfaGdVfVc1RYgTlgR0IRzk1zZyxed5dg/PM4eAu4xdUE8JD+GV0/sH7XVuHNjHbii/O4N5q2mO2zYfYmVxVVc1RYgTmgR0Ifz4qKSaa+2XQi3qrEpydsyg3mpO/YKkaG4JQpLcwMhQFoxOsXt4VlcGc9MijGmOlgfzjvLUXss8ByF6JQnoQgTgxfwyuyQ5gA+6KvO9iTmn3ir7/Y+jUsiM6tiGLv84LYNot+VPw+OdWfXNipnRPsP3+Ecl1U6V/YTolSSgCxGguVsP8Z718G6XZr43MwufdeoRLsW84f3afcFLU2KZnBhl9dBGIKfdF24Hu4z2vJoGZthPgwjRa0lAFyJAXm0kYO2ptkzAsszA7kzm0HeO7/Fr+se3u5d+/ymWNwNlGEPtXbbI266sa2Wjl++s20+pdaKiEL2aBHQh2qCs0csl6/LsAsoMc4i4yyilFuKzBWuIUtw5JKnN15reL5rT4i03f1l8oiTBXf1lPltl0xUhLElAF6KNcivr+O66/dR7tdXDt3d15jsWvfTrBsTbzYPbunmQbUJdl92kOAXzn35dwJuFFV3VFCFOOhLQhWiHz0pruNa+MtmCrsx8N7PeW8ylR7td/LgNFeTSwkOYYb2L2+tKqb0daV8bLcAio/0Pu4p5dr+UdRXCiQR0IdrptYJyfp172OqhBIzM965MkmvVi762f+AB/boBtk3tyt75HIxEvxaWHLT9nIUQzUhAF6ID/rCrmEXWG4IkYOwI1lVaBd6z+kQGPOz+nX4xVoc3KqU+7FizAmOXBLe+rMapBoAQohkJ6EJ00PUbC1hTWm310JSuKg9rZqC/3vxYiFJ8u5//Gu8xIS7O72u5VG1xUBrnhzmS0ermp6C2ke+u3U+dda6CEMKHBHQhguCqL/I5ap35Pq8r9lA3tcpEvyDJf0CfYr+xy4cda07AFgGZvgd/uOEARfWyPE2IQElAFyIIDtQ2cPUG26Hhrio686HvgdPjI/0+aYL1UjW6YqmaOW/eqhLcvbmH+bjEctRDCGFDAroQQfJ2USUP7Cy2eiiBLig6YzXfPS7Ocre0FmzWnq/qeIucmfPm83yPryyu4sFdlp+jEMKBBHQhgui32w/b7f41o4vWp7cIxFFuF6dEhzk+4bQ4y4D+YfCaZGsRPuvNd1fXk70+D5k1F6LtJKALEUQaozxsXk2D1cMLumDovdUwuc2e5oAR8AdEWpaJ/TB4TWrNHGpvtd58xud5lDV6O/OlheixJKALEWTljV5mWe8E1hVD763W0NkEbAAG2T/WaVVczJ3pWg2137WtkM1S1lWIdpOALkQneL+4ir/sK7V6aIbWulUSWBB96HtgYDsCeicnxLUaav+irJY/7j7SiS8pRM8nAV2ITvKrrYUU1DZaPbSoK6vIDYgIsX0s3eGxzmDmEUzxPX7Nl/kyby5EB0lAF6KTVHu83LWt0OqhBGBOV7UjJdw+aHu6Poq2Gmp/bM8RcitlqF2IjpKALkQneim/jLVHa6weur2Teul7fQ84BfQ6r2UC2sbgNec4s3ee2fxYUb2HnB1FnfFyQvQ6EtCF6GS3bjpkdbhTeulWO6OlOgT0BuseetAT4sybl1a985wdh6mQrHYhgqJrJ9CE6IXWl9Ww4lCF1fakt2utF5p12DtN3zA3807pZ/nYCD9r1INoDj6982+qG/jzXsvEQSFEO0hAF6IL3JNbyGUpsbhUi8MJGNuFdvoWpTk2Ab0LXed74L7tsiWqEMEkQ+5CdIHtlfUsOVhu9dDtXd2WrmaWeM1sfmx3dT0v5Zd1T4OE6KEkoAvRRf68t8TqcKYZ8HqyVrkCT1uv0RdCdIAEdCG6yEcl1eyqqrd6qMuWsHWTy5v/o1FrFuV1atqAEL2SzKEL0YX+tLeEBaNTfQ9fbnVuB8zv4PP3BqMRcGypWovlea8VlHNE9jkXIugkoAvRhZ4/UMYfR6Xi9kmO01rPUkotDsZrKKVygnGdIGlV5vb5AzJ3LkRnkCF3IbpQaYOHt4sqrR7qzPru3cLchKXF6MPhukbeK7Z8/0KIDpKALkQXe/GA5fxxsIfdTwRTfA+8XFDeHeVmhegVJKAL0cXeKLTuoWqtp3RtSzrdFN8DS62X7gkhgkACuhBdrMrjZXVJtdVDU7q4KZ1tXPN/VHm8rLF+30KIIJCALkQ3+PBIzw7oZu32Fuvr3yuuki1ShehEEtCF6AYfHqmyOjzO6uBJaorvgZVFlu9ZCBEkEtCF6AafllpuqZrQg6rGTfE98LEMtwvRqSSgC9ENqjxevi6vtXpoShc3pbOc3/wfDVrzdYXl+xVCBIkEdCG6yRdlPTqgtxhp+Lq8Dq9MoAvRqSSgC9FNbAJ6gtXBk4nVtMFX1u9VCBFEEtCF6CZfWQ+5n2918CTT6qbE5r0KIYJIAroQ3WR7ZV13N6GzTPE9sL2qx75XIU4YEtCF6CbF9R5qLOqg9sCKceyuaujuJgjR40lAF6Ib7am23B/9ZJ9Hn9L8Hx4N+2os36cQIogkoAvRjfbWWPZce8padMAI5rIhixCdTwK6EN1ov3VAP9l76C0S+/ZZv0chRJBJQBeiGx2qa7Q63KN66IfrPN3dBCF6BQnoQnSjI/U9K9hZJfSVNPSs9yjEiUoCuhDdqLjesoc+qKvb0ZlKethNixAnKgnoQnQjmx56Zhc3o1NJD12IriEBXYhudKQXBDsJ6EJ0DQnoQnSj0l4Q7OpkVxYhuoQEdCG6UVmDt7ubEGyZvgdCVTe0QoheSAK6EN2orLHH9dAzfQ+EKInoQnQFCehCdCOvhorG1r10rfXJXlzmmFCXBHQhuoIEdCG6mU0vvccUlwmVHroQXUICuhDdrAfOo7cQIvFciC4hAV2Iblbl6dkBXYbchegaEtCFEEKIHkACuhBCCNEDSEAXogfSWqdprcd0dzuEEF1HAroQPYwZyHOBTVrrA1rrJVrr67q7XUKIziXZKqLbmVtuftDd7TjBTFVKfdjWJ2mtZwGXaO3NXrvzF4SHJpEYM56MxIsJcceUA+8ALymlVgS5vU2vnwPM64xrn6yUknV7omtID12InuXx0qpN2QDD026kqHw1Ww88xvubL2X97v+Jyy/5T7ZXNyzXWn8mQ/JC9CwS0IXoWSqr6/bz2c6fcbRqEyGuaAA83jqKytfw9b77+Xjb1RQeXTUJWK21nty9zRVCBIsEdCF6lqszEi/JTY47lx0H/0pdY0mrE6rr8tnwza/ZXfhCHPCGBHUhegYJ6EL0IEqpj4C3E6LH+jlTs6PgL+Qd+Vcc8HAXNE0I0clCursBQpjJX5I4FESawKrP7Sx4hrSECyZprecopRZ29HWVUjlATkevI4RoO+mhC9EDeb11AZ1X11hCfsl/AC7p1AYJITqdBHQheiCtA99nvdFTCRDXaY0RQnQJCehC9HKhIXEAed3dDiFEx0hAF6KXS4wZD7C5u9shhOgYCehC9GKRYanERAwBeL+72yKE6BgJ6EL0Yv37fg+gwFzuJoQ4iUlAF6KXighLYXDyjwDu7e62CCE6TgK6EL1UavwU3K6IXKXU4u5uixCi4ySgC9FLmcVnyru7HUKI4JCALkQPpVQIyuE/ca0DqyYnhDg5SOlXIXqofnFnU1OXT0XtHsvHNYEXn9FaPwdoYADwsgzTC3HikYAuRA8V6o6lzhVmf0KAPXRz3/TZjZ5KahoOExsxZLrW+r9KqYPBaakQIhhkyF2IHkopF07/iQe6gQswDCA3/0l2FjxDTX0BwFUdbZ8QIrikhy4CprW+HDgfOMfnoXJgNfBXf702rfUM4B7zOZuBVQBKqdeD3uCTiNY6Dfg2MBkY7fNwHvCJUurxtl7XCOrBcejo+7jd0Xxz+FVG9Z87X2ut29OmrqK1zgG+g/H5bQa+Akq7Y829+fedCIwH4n0eXtXbv/8iOCSgC0fmcOtcILtR67hVRYWsLTlCrcfD4OgYEkJDSQgL47SEPtMTQsNytNbvAn9WSq2wudZTFO3OYM86SB81nbSRcwkJR2sNRpBfCvw/uxsD84fxB8B5GIEvy3zoXaXUt9vwvq4DLvW5RnPbgC2YgaCzfnDNG5wfA9lU1cAXW2HHPoiKgKQ+EBMJ8bGTGJGZrbW+H3gHmK+U8luq1Skhro3Gl1Vvo8FTSYOnkn1FrwHeuBHpNy/UWt8J/E0pNb+jL2L+bX+GEfDOwdgwpulvkw8cANYAz/l7/1rrWcDcN4tr4g7VeSdNjA/LHhMdikvR9F3L99du8/s6EzgXGAVkYHxHn1NKzQ3g/cwAvgdcBGTg9UJ+ARw5AlVV4HZD374waOBcrXU5bfjbCmFF9qAWlswf1yeA7M9Kinlu7x6WHcjjaEM9AEOjYxiX0IdBUdGMi0/gwpRUtpSXkV9TzXWDhgDM9d1fW2s9C0/DItYvgW3vwaHtgILQcIiMg6TBMPUW6DdkrVLqLIs2PQbcQG1lHHs+g7yvoDQfXC648hFQriusbiR83tOdwA3UN8SRuxe+OQiHS6CsCkLdoBREhkNqX+gTC+n9IDMNXK584JFg9Ui11pOBh/F4JrFmI7z1EazdBA2NxgljhkH/FEjrB1lD4LQR8MHnRnvGjywHvmfX09RaLyg8+uGcooq1VNTs4miVdXzo3/dSxg68d51SapKftm7dXvCXrD2FL7Q4HuqOo3/fSxiccg3hIYnbgAvaM6/e4u9Sty+O0neh8gtoOAiN5eCOhpBECB8Eid+F2LPAuPGzDX5a6+f21TbOfvFgNU8eqKCo3otbQbTbRUqYi7Pjw3lyRB9i3Gqhb3Bu/t3fV9vI20dq+bSsnv21jUyKC+fBYfEopSx/O5vdcN6E15vF2nXo996HNZ/C9h1QW9v6SZGRMG0K6hc3wWmnlQPzgrE3veh9JKCLVszezeNflx2Nu+2r9XxSXOT3OW6lmNovhZkZA6jzerll6HBcSs1ung1t/ti9z/4vR/LybdYXShwAP3sFYGzTj7XZngeoKcvgsxdh/VLwNBx/ztSbYdKPCpRSGQ7vaR5wB4UlcazaAFv2GL3gsUMhNARCQ8Htgk274MDhlk+ODIfxp8B546BPnN+enT/mjclcPt4AT7wMB/1/vkSEwwUT4dRTIDoKpkwoB861CmhNAf1I5ReUVed2KKBrred4vHULPt52FTX1hZbnhLrjOHPYAuKjRi1TSmX7fzPHrp0GPABcT8m/IH8BlH0E/ub2YyfCgHsh8TKAHKu/hXnD9Ob8PWWx939jvdT+hvRo/pqVmK+U6t/seY8BN+yqaYz7nx1Heau4Bm0+FqLgkwkpnBkXZvk+zR75Uxw9msFrS9Bfb4LYOKiugqX/F8hHAtf8GPXAfAgNbXVDLIQ/MuQuWtBaL2nUOvs3m7/iiV07aPAGljjl0ZqVhw+x8vAhJiX25WhDPfdljXm8eTa0Uuqg1vptQsNH2l6oJA+OHoSEtGyt9RFgOY31k9i73nh8x8ctg3naKJj4Q4BbbN6P0duqb8jm36vh860c+4WuroVPNvp/czV18OkmWLcFJmRlcOGkHK31VcAP2jI8arblPY5WZPHgs7D6y0CfCrV18NbH8PYaGDsMYiLjmDD670CrkYwmCnfg17dv7/xvDr+E2xVle16Dp5wteY9yzohnZ7bh2pOBl6nZkcGun0PZB4E3rGIdbL3cCOinvJCjtR6jlLqy+SlKqY+01tui3K6JdpdZWVIHkGG2BeDl/DpPxq7qRnKrG1hVWnvsqwJw+4BYzowLqwBa3I02mx9fzkuvoNeuRZ1jppm8/Ao0Ngb+3l58CR0VhZr3/+YDEtBFm0iWuzhGa72kqK4ue9qq93h0R27AwdzX2pIj/D53C3urq+KAmyxeyPkCZQfBmEP9nJK8SWz/APZvgGX3QOmB4+eFhMMlvwHlWuQw1P48JWXZPPkarGsWzOH48HagPF5YuwUeewl27s8CVpvzrH4dC+Y79mZx/W/bFsxbtMEDX22HhS+BV09qFoxasx4VbosnKmp2xYWHJFLX4DyKUF6di9aepl6qI7PNb1D0zwy+mtC2YN5cyb9g84XQeDTbXCffitfhu5Zfd+zvfxvwxkdH6zI+K6vj4X3l3JxbSoXn+HNHRody/9B4gF82n1Yw38t2tm5boe+6xxjtcYegf3UXLH+9bcG8ycefgJE/IESbSEAXgBHM82tqss/94B1WHwlgCNiPeq+XV/P2AVzc6kF/NwqNtQDT2b4qg6LdsPENWPfP1uumL7gVkjILsNlcRGs9Bs10Fr8FR8ra8zas1dTBC/+GnfvjgNf8nX4smG/YlsXNvzfm7Dtqbz7s2AtwRccv1prW+jGtPdmlVRspLFtFg6fS8fwQdwxKuQF2+bnuHOAN9v4mju0/Ak9FxxpauR62zQCYbXUz4VQ6p1Eb//Nosp8+UBlXWOfhrp1lvH2k5Tx3lFvx0ui+RLjUSp8pJOPGZOV7sfqNN1EDBqB/cx+8tsT/TauT0aMAOvjBiN5IArpAa51T3tCQ/e2P32d3lfMPd1uU1tfbvKCfCmW1lbDycag4DB/8GfZ/1fqciT+E066oAK52TMRSGD3rQLkC/E/C44V/vgt19VlmkHLyPDv3Z3H3QmPoPFjKq4J3rWa01gsaPVVzq+r2U1m7j6Lyz/w+p3/fSwFynaYgjFwIvYCdN8Rx4EFaDpfYiBgMyddA/FT7c8pWQcHjAL/3fcjj5yV21zRy47YSaryan24rYW9tyx51iIKXRvdlfGxoLvATn6c/zVv/jtOvvgZv/Rv9h4ehpsb/e0pMhCFD4MwJEOUzldEvCXXfvQDP+r+QEC3JHHovp7WeoWHeVWtXk1sR3H06BkZFg9XmH/566O8uhFqHtpwxE6bdCvATpzXFSqnNWusCTh+RznufW50Ag1Jh1GDITDcy290u2HsQvtoBG3KdbwZq6mD9Njh33NXYzHdqrRdQVjGdexZCjUWGc0ek9gUI4tCD0YPW2jvnm8Ov4PHWsq9oid/nxEYOZ3jajQAPOVx3MvA4e+ZAoeXouM9FJ8KgByFhGkABkM7hf8COWVgmzeU9CCk39Ndaz2meTObx01M+b30hJQ3Wf+NQpXhhdCKX9YssAK70GWqfQ1lZlp77K2MJmj/Jyahbb4aLL4L09OPHCwvRi/8BL78MxUeMnn2fBIDl/i8qREsS0Hsxcyj4+T/kbuGdwsBXG/UNC2dMfDxJYeGEulwU1tbyeekRKn3mC0fExoKxjtvnhf310B2C+fjLYfpcMJbF2S5Ra+Zepk1YRHIf2LAdtu8zjoaHwaxLYFAawEqaFblhcPplDE7PZkhGLK++63z1Evu2mkPAc/jfv0LhkQCaakpNgiEZEBVp/LvwCGzdY8yfN3G7jWVtRrGUoDBXEyw4UPIGtQ2FHDjypt/nxEQM5syhC3C7IpbZ1Xc3v2dPc+jpOAqecL6gckP/u2HQ7wCWYWSxb9ZazyD52uUUvQylb7d+XkMhFL0SS+qNpzY/7K+HbhfMXQoWj07kBylRTaNAvt/jX/HcYv/B3OWCW29G/fJWiIxcB7wCbDCT9tJISblL3f2rH3D7ren6mutQMy43/s5u9xCgywvgiJObBPTe7a5dlRVx92/zn6g9MCqKnw0exhUZAxgZeyxfJ9f8vyNrPB5ytm7ijzu2HXtO/8gogH2tLtbeXb7GfAe+cydYrHG3o5RarLU+ythhlzF22Gx2H4D6RhiQAjGRucA0iyH7FVrrxxg3fBMffQkHi+1fICLc6eXv4e3V8NnX/hs6djhcOhnOPQ0SYpuOrgP6A+mUlsP/PgPrzL9Vn9im6QHbOWvVhlWpTT3oA0feoPDoKorKP/X7nJiIIUwa/hRhIX38LVd7kurNWXzzK+cLqhAY/iwk/6QCI/ls8bGHlFqh/c1Ll/6nkdQbZwLXNx1qzzdNAX/LSuSHRjC/1HcUyEyEzNCv/8v5QrExqL/8CaZOqQB+6/udNb93c4G5Wuul6uk/z0QBYWGLZPMb0R4S0Hsp80dpzv98/SX1DkPgIUrxm5GjuTdrDCFK5QKvAu9b/MjNemjs+EUbjpbwRWkJFY2NDDKG3Pe2umh7sufTR8PFd0MbgnkTsydvBOmh/Rdg9Mb3OV3H7BVCfIxzQDeGvbf4HtZaz6G2bhJ/XercuPgYuGs2nD8BjJGCt4CVzXuEWus0+sTdxYO3z2HGHGNYNqXvsXbaXzywgG7mACzYcfAZ9hf9Hw0e/1Mv/eLOYVzmfELdMY7B3LhR0DPZeQN4nHqzrubB3C6IQs1O+0vU7QvBJzvc35C7lbkDY5mVFm3ZDtMwAA76GdX6/vdh6pRyYKS/gjtKqWyzVO0YpdT1TucKYUcCeu91x4ajpbx5MN/2hEi3m39OOpdL0zJa9Zh8mT3hS389YvRMpeDh7duIcNtkPWsNiQOhZH9gLe3TH37wKLhDl3Wk2IYZ/Ka3bo6eDPQBMoFBGPPSxlB2Q4Pv6ceFhUJWJlgPjf6M1z90zmjPSIbH7oSM5FzgJrt8gKaenNb6B/ziB+kMHQD//hiMuWUHAQX0kVp7F2zcl8PBUj/TC6b+fS9lzIBfo5RrvlIqx8/pD3PwL8bacScZt9sGc9MN1OVB7Tf21zCX1mmt05oCaJhLkRkR0irZzU52chSPDE8Ao0ftPOTt715h/XrQOg6lntBaP+nvegF8lkI4koDee337hX3W+2QDuJRi2dnf4qKUtFyMhKBACqg8MS055dtA7KTEJIACy+dpDwyZFFhAj0qAqx6FCOeeYFs0q9F9MWBUSaurh6paIws9IhzioiHEDdUOWemxURDixvdGx7x+Fv9dY//cxHh46jfQr88y4LYAS6Y+wmVTFgAwbACA47h4IBuzeL31cV/u/Q2Hy1b7PVcpFyPSb2Zw8o8hgJESrfUMvDWTyPud84WjRkPmw2DcNLYKeuYc/PXsz8FxED18kNnO459lpEtxbkIYew/5D+jnxIfzwuhE8P/e1gKQlgq7dtuftWUrOvsq1M0/z2ba1Gyt9TaMES6/mxgJ0R4S0HshrfVkr9YZSw/k2Z5zYXIqF6WkVWA9x2zJ/DGO01qvjXK784AcmwZAiMM+3U3cofD9ByEhY10wgrmZpPZ7IItDR2Dzbsg7bAypV1b7vLYL+sY7Jr0RFmr3SDb7DjatE7d21UXQr0+b3pcZZBZqrcsJD3sWeNjPMxwfrW0oYu2uW2xLwzYXGzGEMQN/TUL0GKdetK9bOPQ3qHcaSFAw9ElQIZZJdcer670fx+EXWj+9ueTrwJi2OMarIcLlf6RicGQIy8clEe5SC/3dqJgVDwuYOiXdMaADfLYW/dlaGDQI9cMrs7j8shwGDXLcxEiI9pKA3jtd8cXRUg7W2q+ZvXZgJsDadvYkZjg+z+sxspn9mXoz9B9bAfitPubk+EYo3kms3WyUcD1c6vwkj9f/OSG27+Fi1jgkn7vdcNG5AP9xfgFbI4LRwysuX+v3nBB3DMNSZ5HZ74co5V6JsVTQ72uboxQXcugZ5xOjT60lfmoEFjd/WuvbgTspX5PB9qtBO/Syo0ZByiyAPzU/7MHIA3ES4VK8OrYvSaGudYHsomZ6Td1y8xz9+htw+LD/s/ftQz/0R3jkMRg/DnX5ZdO59sfTtdb5GLsLLg7wdYWwJQG9dzrnwyLrjTbA2GhlRsYAgJfac/GAgo2/sqTDvwUTrgSjN9ju4HVsI5QNufDuOigLUuGc0BDjf9Ym8mWu3WMwIhOSEgD8RDtrXTVcG+qO4byRLxIRllIA3NLG3mQ2lV9A9Vbns8IHLQa2N9uIp2k65EYaSzM48CAUPAleP2v4hz4FKmSlbxu11vjroD84LJ4zYsMKaMONo1Jqrtb6O+qfL43Us2+AfQHmg3i9sOFL9IYv4W9/R82elcGNNyzSWl+CT1lZIdpKKsX1ThOddlDLiIwkykhoW98pr6694DS/G5XQtDxtYYBDu9Yvo/USauvn8vJ/Yen7wQvmAOefbhnQj5Uf3eyQjT0wFYz8gk7/8dbtXSIIeLUHbWR+vdaOoeGLKXnD/1lD//Rz4Fda663aWJe2ido9Oey5PYPPB8KBR+yDeeQIcMdA3+9D/NQKjCVgLd8Dzj9ykxPCuW1ALBg3LG39e0xjxCm56s3XYZpDJTs7B/LR//s79IyZsD8vG3jPnGIQol2kh97LNC3/2XjUfjjZXD/uZ0lUhxrh/Pj4yyE6saANw58WL6GXUFmTzV+XQ/HR9l7GXliI3fvI5GCxc1lWY8nZAfsTgsWL1g5Z+n4o5Wqqz94eI6nZAfGTzS1RrV4gFA49A96aDBpLMqgvgOptUBdAbzfpB5B6ExT9AwYvBHjW6vvq9fNVyxkSj4Jl7ZnLNm8AsrTWz6l/LJ7N6jVG+dcNbdx4Z8OX6O9+D/Xi81mMH/ee1rpd+8oLIT303mdCRWMDB2qqbU9IDo+AztwcQnudh9xjk8BPBrfj5bVeQG1dNs/9q3OCOQDKru77qey2TzYEjGQ7q5K4waRc7D38KuVO67aByLAUIsPSLR9r9FSxJe8hgDmOu7r5MHuZcdQfgujTHU5sgLwHIP9RKFwEpf/1H8yVG/rfAzGnwZH/g2HPQEj8MrubP43zVy0jwg3wib/35NgkY934+Zx7zjr1xgrU22/BT6+H5OTAL1Jaiv7RtZCbmwW815H2iN5Leui9z7ht5eWOS2iTwsMBtjmcEhBzNOACpdTjPg8499LDYwH8REXH17yeJe/BoQDKrSqMEqrD+hvV45ISjOVoYWHGGvScvzm00zLLfTT7/XSu4m1K4rZR0/C+Ve9SofD66Z2n9bmA8ZkPUFL5JWt33mx5zuGy1Rw48ib9+176NDAqwKYZSwE9ZeByrKQXOFc4JH4P0m42NmrRDaBCLSuwNefF+auWEOICq+JHbWRODU3SWo9h7Jg71NgxFzHvvnRWfYRevgLefsd/mdiyMvSPfoL697+MXr8UmBFtJD30XqjK47wmt09oAEvK/NBaz/BovelwXe1CrbXFDh8Ov7KhER156Rx27I9j217/Z44aDHOuhl/MhOmT1jEycyFJCfMJD7sCxXzHrp32NmW5t85+87ejWmy0/7b5YWz6UrmcRs9yq93eAlmDHuKKBihIjDmNqPAM2/NyC56ivvFollnJLHDeelAd/C6FpcLA+TD4MfBUw0Ezj1CFzsXI9j8WzLXWz2qtP/P9PJxuXmPcHd4zvgWl1Gal1PVKqQxcriuYOmWZemJhhfryc9S9v4bISOcLFBaib70djO1gxwS1caLHk4DeC/krhxka6Baizn7/u9wtXPjR+9R5vdmtgo5T+ddA1qjbm84aP7XTlYLvT4VrLoZ+fRYCY5VSk5RSc5VSOWaP13nTk4NHmiJF66Fzf9u12i93C8ixUYh5f4bHXgBY4Pvj71L+e8ZudyQYc/m5GYnftT2vobGMrQceA5jXlqF30B3voTcUQ9n7RmLc8L/ByH9WYCRLLvTZ/WwJDUXXU/LWJODq5pew26BFEdga9fZSSq1QSmUrpeKIjp7LzT8vUK++bIz+OPn0M1jzKcAdndY40SNJQBet1Hj87Ibmh9Z6waHa2qxHd2xjS3kZC3bmQosfWe28QYu7fQFdaz2ZRk8cu/3km11wJkzIqgDON4O49fC3Uw/9qx3+k/vs1NnsEx+4v7PmqzjWb4E3Vhk7scENzU8IJJlNHZ9xe2ZQvytxu+x7jwdL3yWveAXAywFnYqtQcMf6P6/5+eH9Ie4cSP4JDH4UJuyBsR9Cxh0rCUtv6pW3mC/XWi+h/lA2m85vmoPPOP6YfW05f+vTg8kcSZjAGadXcMNsv+fr/74DcFZnt0v0LBLQeyG3nx+y4vo6aPaj2BZmD+76uzd9eWw71bcPFQBMPH6WAq/DsL+73T3YaRQece4hR0fAt8aDn73UAfwuYLb7HN1+/rMyls8NcD7JmtZ6Do2eSTz5StMB+GwjwDnNz3Mp2yp2zc4xPmel1MJQd2zBgKTLHc/flv8EFTW7M4Dnnc47PqfvgSg/o8YD/h+cvgUmHYJz6+DMPDh1NZzyfAEZd6wkfMBcIF0pNd23Vw5NPfPibDZPh5odRoGZxrKMphEhpaDeJtU9tIO/flrrWVrreYHe4Jht/636aQBT49tyAbI61EDR60hA74Ui/QTM/dVV0I6A3rTv9esFB+Je2r/32PEQ3/lcBdSU2V8ogPlfG/FU2GfvA5CeDKEhlolkrbhcztVT7R4L9zPCcLAI2hHQzZul+Tz9GuQdOv6Axd9TKf/5rqEhCXB8yuCRYamzCXXH2J7v8dbw1d778HjrplvN27d+gX7GlqhOowU1O40gHJpyBagrMKY/lFIqwy6INzGH2bPZfCFUbwbcsGcORn04gwKO2O157vcN2NNaz6CxcREFBTnA8jY8dS+pqRDrZ+SizOG/DyFsSEDvfTaOio13jFNrS45Q2diI1npWoBc1g83nX5SWZM1e/1mLRKQBUVHQfGcw5YZNDlVPOzIU6m/hcXw0GPuM2zLfy1PUNbTn5mILA/102D7fAjCxLUVEzAD6Bm99FMer/235oLGFa4tVAW6X/2mLiNBkMLPtjV56XEFm8tW250eHD6ShsYwteQ8DzPczn76OuPOMpWWxZ9ufVfpW0y5p4805Z7/Z/1rrMVrrd6g7kM2mKVC10XygHlKug5DEgqZkuZIGL28WW5c4dnVsyP18du1CX3k1VFZNakPCYAKVVVDhZ1Wo8d+MEG0iAb33WR8XGsrY+ATbE2o9Hp7ZswvggUCCjlle9Y3/Fh7MmP7x+5Q123L0ukFD+M3I0QDHa4D6+yFtfzET//PadQ3gMPpgLgV7g6LSDBa+4py8Z33z8DXjRjhPG2zeCdv3gp+ha7M9aeYqgQW89FYcf3iu5Xucey2cNQ5aLoNbFUhSXIi7Vbb9vUOSr7Fdl15dX0Bm8g85dPQD9hcvjwPecMjEXkPCt6HoZejrMJTvqYT988DYHtbxu2Z+Fo8BqylbNZ1NU1qXlvXWQbOiPU6zJh2cQV/F4MFGjfY7/geMhMFASsf+nNf/5f+spL4da53olSSg9zJmDyj3svT+jufdt2Ujn5UUZ2CUo7xda3252TO63Pzf7VrrJVrrA5WNjXPv2Lgh7nurV7UI5vGhoTw27jSGx8QuA35yvBH+vnadmKxUUASQ4du7NN/bs2iWs3pjHE8t8V8qtroWWuQGAPAqcdEw7hT753k1zPszlFVO11q/o7W+zuLznae1fgfI5WBxNnc+Bn95rWUwHz8SZl4I8TGt9iUPcfvv4fkGdKXUYpcrbN2I9F9Ynq91I3sK/8Gw1Nlsy1/I4bJP4oDXbALxKuLOMYbcy/3UbTn0Nyh9Ow7ItRoVMj+XeUAudXlz2fGTODZNg1qLnc58ysQ6fdM6/C0LD4f4eHjrP/DEkwDPOwV1oxRx7ST956f9XlpNnAg+O8cJ4Y8UlumdXv3p4KHz/pC7hUabHm2d18tFH3/AfVljsq4ekLkwo9n6WQ0crqtlVdFh3jt8iKUH8jja0Dpz+9ahp5BgrGnPaTEP6vLztevIL22sn0B2pAw++QrOG79Ka9203VgckEVRKaxYBd84bffZjEXv3dxacyWXTbmQDQ61eQ4Uwk33w40zp3PWqdOJbpZh7vUaW7p+sRU+3wwfb4BGi5UHP70CIN83mIOxS5o/kWEpABt9Dt+Z1ufCVXuL/snRqi2tntPgqWB/8TKGJF/L1/vmc+awx7Pio0a9h0/RGaXUCq11AWk3p7PvPueG6EbY+j3of3ccA+5dpLV+nOOFjfoDGVRvNtagFz4LXptdAt3RRjnYZrvYhTqMBnUwoBvfnaS+cPQo+qE/orw6jjm/XK61Xgq8CDTdcVwA3ElRcYb+xS2wd6//q3/3YoC3OtZE0dtIQO+dnhkQGXXHjwZmxr6w7xvbkyobG7l701fcvekr4kJDiQ8Jpdrj4WhDvd+17AOjokiOsCkQE+I/A7udVtE/eQ7hoU1D69b+vQY27YYBKZOICDN62vsPQUFx217tSBmUVWJR1etPTJt4Ic+twLFq3IFCo6cORvW4iDCoqoaqWv9TB5PPgMIjYBOXXCoUlysMr9d6iZzbFU5EaD+AFrVxlVIfaa2Xjer/q5mf7vgpWre+kaipL+Rg6bsMSfkJX+y5m7OGP52ltV6ilLrS59RHyLhjAQf/4mdPdIygnvc7o7Z7/LQ4wgdOQjdCfb5R3706gMJ66XdAWGoBzXaxC++kdebmjRskHJ+60o88Cus+R91+WzZnTsg+Vhq4oACWv47++7Nw2H5TpGPOnAAZ6SA9dNFGMuTeC5m95WcfHDOefuGBFf4ob2ggr6aaI/V1foM5wIDIaIbHxAKsbJXo5PIzR97OLHel1ApcrgLOCGC1T14hrPka3l8Pn21uezAHKCnHrEj3ba31sYlisx3ruONa/0vfmpRVGAG6siaw9e1aw8SxAFa1aXcBhLrjbJ8eHT4I817AalP02+KjRlak9/m27fOr6vaTX/I2GYnfZf2e/6HBU57tWxFQKbUQV9Q6Bv3O79s5pqEYil+D/D9CwUIoXhJYMM98GAbdD/BI89GgEIePPyixPjW15b9XfYT+/pXoEaPR501BTzwbfebZ6N//IbBgDqgfXw2wrtM2RxI9lgT0XkopNTc1IiL3+TPP7mi2r6XEsDAuSkkDiy0t/Q65R8YB7GvnSz/ClNMhMkg1xP1ZvRH25GfQ0LjCZ/70BiaMruCaSzvndU8fBX3iCqyG25sCQXhIou3T+8ScCjZbuDbd8A1Puwm3y74Mb2XtHg6WvktqwjTW7byNusaSbDOvovmc+g2kzII+9pXoOixlFvS/E4xCQS3qujsFdLOOO5g3QO2wTp061vqR6mr45hvID3D6psnoUXDFDIAH29km0YtJQO/dbrooJa3CzEIPmvjQUB4ffwYYJTpb9zLCHOa5Y/pCbDLAhva8tlJqITFRucycFpzcuhA3RDjcHBwpg1ffbZXVbr7v3/LT78OE4H6+ZA2GmRcA3OJwVkFUuH3iY9/YMwH+a3sCPBwZllKQ2e8qx6bU1B8kr3g5/eLP4fOdt1FVt7/Fvt7m57CIES9BrG/+YBAkXwvD/g4w16pQUEyI/U/c6XFhABUd6Am/wjU/gr5BykhPSUE993cICWnXdq5CSEDvxcwfwF/OHzWW+7LGEB0SwvxRY/0WnnESohTPTTiLQVHRucDDFqesou8g+6CeMQaMH1nnKm7OrmTU4AouOa9jQT25j7Fxy5l+hvBr6izHb40hZ9ciHpoD54yHwRlGVnpH9ImD+28Fl8vfj/7WfnHWlUMjw1JIjjsPYLHdk81e+iNDU2c3Jc/Zqm88yr6ipaQnfoevvrmP8pqdWbQM6tcTkrCMMe8FsaeuoP9dcMoLoNxzbXZcWzMh1n49/rcSwsF6yiGwFii1kPj4XPXowx2pbmiIj0ct+jv0z8gFbuvYxURvJQG9l1NKLQZm54waW/HqpHN582A+vxszjkmJbe91JIdH8K9zz2dGev8K4Cab4dwVhEYUMPGH1hcZPhngnTa/eMvX2AxcyjmnVjBzGoS1Iwnv9JFwy5WQllTA2WOdy7meMrDp/2sVHJRS1xMetpCH5sAlk2FvAdx+DSTbD4fbGpEJz/wW0pIC+dF/K63PhZb12QcmfR+lXLn+bpqUUgvdrvB1o/rfib87o0ZPJbsOLWJo6nUcLF2J1p4smrZRNa6VjTtmIaPfgkEPdGzTFnc0DH0KMh+qAGY7bJ/67Pl9wpnap/W0gUvB9/tFQsczyW9i+oUV6rE/Qmg7kz2HDUUtfRXGnZoLTLOrjCeEP123O4E4oZkFQp6taGyYePemryhraOCMPolUNjZysLaGBq+XaHcIXx4tZfWRlsk9kW431wwczAOjTyUpPDwXuNJpGFNrPQvtXcQrt8P+L48/ENMXfv4ahIRfEYwhR3Ot+SsUlabz5iew088W67FRMLQ/nD4Chg2oAB7DyJjezlurY1ntu8ILo0rbDZdBdORC301DfNoyA/gTBwrTeWYJ9E0w9mEvLYejFUaSW1QErPqiqTTscX0T4IffgasuApdrGXBbID/6WuvyrQcejd1XtPTYsfDQJM4ftQS3K8KuV+t7jTHAmk37fxd74MibludEhqWSknA+fWPOICnuLFzGPuXbgBkWtddnAC9QszOWvXfDkRU4b3DanAv6fAcyH4ToUyuAS/3dlGitnztQ55l99ueFFNQdz9i/NCmS18clVWBs9tKhAGp+z95k/Rexeu6vYM+ewJ6YnIz6xc9g9iwIDV2Jsb+ABHPRbhLQRQtmCcs7SurrY986mM+q4sMU19UR4XZT4/Gwq7KCw3W1JISGcU7fJKanpHF5egaxIaEFGBnGfoOE+TrPUVc1m1dug0M7jIPf/TWcesk6pdQk52e36f2kAU8CM9l/CDZshz35x4vG9I2HwenGvPSQDHCpCowRgpymmxKt9SwaPYv4++vG8rYm44Yb27CGhixTSmUH2JbfAbM5WAyrv4Stu6G+AUJCoKoG9uYb/ze1H4wfAZPGwpmjweVaBzzYlhsdrfUcj7dmwafbf0pFrRFkxgy8hwF9L89VSgW88YfWOsfjrZnX/DpuVyQDki6jf+KlxEYOA6O073+Bj8xRH3+fw13AHGp3Q+nbxsYqVZugsdjY97ypHrsKhdBUiD0TUn8OkcMBAr6pMV9v26bKhpHTNhympMFLpEvxxaRURkSFON6EtYX5nlbQ2DiRZf+HXrIMPl8P5gZFKGWsWU9Ph7FjUdOmwAXTICSkALjX32cmRCAkoItWzB+nq4BLMIZN7XaSCPhH3OZ1llJbPpNXbodTJsO5swPqdbWH2dO8A7gI8K1t2vQ+Ftu9ttZ6KfUNM1n2PtQ3Gr34scMAWlVpC7At2cDFtK4011wu8DawvL2fidZ6aW3D4Zmf75pDdMRATh/8BzCywdt0Pa310gZPxcwteQ9T21DEmAH3EBORWYCxbG5pexLLzO/ZTcAYYDQw0ubUCiAf47N4uK29WPN13l9fXj9y5tfF/H1UItMTIzpleNscgbgFuJDGRmOTlbo6I3Hu+BLRAuBT4EVJfhPBJAFdtIk5vJgI7ArGOlmzqtZMjB/tTgnmFq+ZxvH53bVt6OktAJp2GVsGPBHs9jZb+hZwuwK45lKPt2am1h5C3K3LxLbhOjnAPPOfi3yK6ZzQmoI6xk1Dp89VN/uOjcco3rMXKOmK77fovSSgi25n3iSUnAyFNLTWaSfjPKd5o5AJvBqEOeOT8jOAY59D0G6WhDiRSEAXQgghegAJ6EIIIUQPIAFdCCGE6AEkoAshhBA9gAR0IYQQogeQgC6EEEL0ABLQhRBCiB5AAroQQgjRA0hAF0IIIXoACehCCCFEDyABXQghhOgBJKALIYQQPYAEdCGEEKIHkIAuhBBC9AAS0IUQQogeQAK6EEII0QNIQBdCCCF6AAnoQgghRA8gAV0IIYToASSgCyGEED2ABHQhhBCiB5CALoQQQvQA/x+pRBn0xUNcPQAAAABJRU5ErkJggg=="
  doc.addImage(imgData, 'JPEG', 17, 22, 22, 22);
 doc.setFontSize(10);
 doc.setTextColor(255, 0, 0);  
 // Set font to bold and add the text
 doc.setFont('helvetica', 'bold');
 doc.text('GM CRACKERS', 44, 21);
 doc.setTextColor(0, 0, 0);
 // Reset font to normal
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(8.5);
 // Add the rest of the text
 doc.text('61.A2K5/3, Radhakrishnan colony, Thiruthangal-626130', 44, 28);
 doc.setFontSize(9);
 doc.setFont('helvetica', 'bold');
 doc.text('Phone number:', 44, 35); // Regular text
doc.setFont('helvetica', 'normal');
doc.text('+91 98433 90105', 68, 35); // Bold text
 doc.setFont('helvetica', 'bold');
 doc.text('Email:', 44, 42);
 doc.setFont('helvetica', 'normal');
 doc.text('svksgmcrackers@gmail.com', 54, 42);
 doc.setFont('helvetica', 'bold');
 doc.text('State:', 44, 49);
 doc.setFont('helvetica', 'normal');
 doc.text('33-Tamil Nadu', 53, 49);
 doc.setFontSize(10);
 doc.setTextColor(255, 0, 0);  
 doc.setFont('helvetica', 'bold');
  doc.text(`INVOICE`, 138, 22);
  doc.text(`CUSTOMER COPY`,138, 29);
  doc.text(`Invoice Number: GMC-${invoiceNumber}-24`, 138, 43);
  doc.setTextColor(0, 0, 0);
doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.setFontSize(9);
const formattedDate = selectedDate.toLocaleDateString(); 

doc.text(`Date: ${formattedDate}`, 138, 36);
doc.setFont('helvetica', 'bold');
doc.text('GSTIN: 33AEGFS0424L1Z4', 138, 49);


doc.rect(14, 15, 182, 40  );

doc.setFontSize(12);
doc.setTextColor(170, 51, 106);  
// Set font to bold and add the text
doc.setFont('helvetica', 'bold');
doc.text('BILLED TO', 19, 65);
doc.setTextColor(0, 0, 0);


doc.setFont('helvetica', 'normal');
doc.rect(14, 15, 182, 40);
doc.setFontSize(9);
    doc.setTextColor(170, 51, 106);  

    
    doc.setTextColor(0, 0, 0);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const startX = 21;
    let startY = 72;
    const lineHeight = 8; 
   
    const labels = [
      'Name',
      'Address',
      'State',
      'Phone',
      'GSTIN',
      'AADHAR'
    ];
    
    const values = [
      customerName,
      customerAddress,
      customerState,
      customerPhone,
      customerGSTIN,
      customerPAN
    ];

    const maxLabelWidth = Math.max(...labels.map(label => doc.getTextWidth(label)));

    const colonOffset = 2; 
    const maxLineWidth = 160; 
    const maxTextWidth = 104; 

    labels.forEach((label, index) => {
      const labelText = label;
      const colonText = ':';
      const valueText = values[index];
    
      // Calculate positions
      const colonX = startX + maxLabelWidth + colonOffset;
      const valueX = colonX + doc.getTextWidth(colonText) + colonOffset;

      const splitValueText = doc.splitTextToSize(valueText, maxTextWidth - valueX);

      doc.text(labelText, startX, startY);
      doc.text(colonText, colonX, startY);

      splitValueText.forEach((line, lineIndex) => {
        doc.text(line, valueX, startY + (lineIndex * lineHeight));
      });

      startY += lineHeight * splitValueText.length;
    });
       
doc.setFontSize(12);
doc.setTextColor(170, 51, 106);  

doc.setFont('helvetica', 'bold');
doc.text('SHIPPED TO', 107, 65);
doc.setFont('helvetica', 'normal');
doc.setTextColor(0, 0, 0);
doc.setFontSize(9);
const initialX = 110;
let initialY = 72;
const lineSpacing = 8;  
const spacingBetweenLabelAndValue = 3; 
const maxValueWidth = 65; 
const labelTexts = [
  'Name',
  'Address',
  'State',
  'Phone',
  'GSTIN',
  'AADHAR'
];

const valuesTexts = [
  customerName,
  customerAddress,
  customerState,
  customerPhone,
  customerGSTIN,
  customerPAN,
];

const maxLabelTextWidth = Math.max(...labelTexts.map(label => doc.getTextWidth(label)));

const colonWidth = doc.getTextWidth(':');

labelTexts.forEach((labelText, index) => {
  const valueText = valuesTexts[index];

  const labelWidth = doc.getTextWidth(labelText);
  const colonX = initialX + maxLabelTextWidth + (colonWidth / 2);

  const valueX = colonX + colonWidth + spacingBetweenLabelAndValue;

  const splitValueText = doc.splitTextToSize(valueText, maxValueWidth);

  doc.text(labelText, initialX, initialY);
  doc.text(':', colonX, initialY); 

  splitValueText.forEach((line, lineIndex) => {
    doc.text(line, valueX, initialY + (lineIndex * lineSpacing));
  });

  initialY += lineSpacing * splitValueText.length;
});

    const rectX = 14;
    const rectY = 58;
    const rectWidth = 182;
    const rectHeight = 75;

    doc.rect(rectX, rectY, rectWidth, rectHeight);

    const centerX = rectX + rectWidth / 2;

    doc.line(centerX, rectY, centerX, rectY + rectHeight);

    const tableBody = cart
      .filter(item => item.quantity > 0)
      .map(item => [
        item.name,
        '36041000',
        item.quantity.toString(),
        `Rs. ${item.saleprice.toFixed(2)}`,
        `Rs. ${(item.saleprice * item.quantity).toFixed(2)}`
      ]);

    tableBody.push(
      [
        { content: 'Total Amount:', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
        { content:  `${Math.round(billingDetails.totalAmount)}.00`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
      ],
      [
        { content: `Discount (${billingDetails.discountPercentage}%):`, colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
        { content: `${Math.round(billingDetails.totalAmount * (parseFloat(billingDetails.discountPercentage) / 100) || 0).toFixed(2)}`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
      ],
      [
        { content: 'Sub Total:', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
        { content:  `${Math.round(billingDetails.discountedTotal)}.00`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
      ]
    );
  
    if (taxOption === 'cgst_sgst') {
      tableBody.push(
        [
          { content: 'CGST (9%):', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
          { content:  `${Math.round(billingDetails.cgstAmount)}.00`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
        ],
        [
          { content: 'SGST (9%):', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
          { content:  `${Math.round(billingDetails.sgstAmount)}.00`, styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } }
        ]
      );
    } else if (taxOption === 'igst') {
      tableBody.push(
        [
          { content: 'IGST (18%):', colSpan: 4, styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
          {
            content: formatGrandTotal(grandTotal),
            styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
          }
        ]
      );
    }
    const grandTotal = billingDetails.grandTotal;
    tableBody.push(
      [
        {
          content: 'Grand Total:',
          colSpan: 4,
          styles: { halign: 'right', fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
        },
        {
          content: `${Math.round(billingDetails.grandTotal)}.00`,
          styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
        }
      ]
    );

    doc.autoTable({
      head: [['Product Name','HSN Code', 'Quantity', 'Rate per price', 'Total']],
      body: tableBody,
      startY: 150,
      theme: 'grid',
      headStyles: { fillColor: [255, 182, 193], textColor: [0, 0, 139], lineWidth: 0.2, lineColor: [0, 0, 0] }, // Reduced lineWidth
      bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [0, 0, 0] }, // Reduced lineWidth
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    const totalAmount = cart.reduce((total, item) => total + item.quantity * item.saleprice, 0);
const pageSizeWidth = doc.internal.pageSize.getWidth();
const pageSizeHeight = doc.internal.pageSize.getHeight();

const borderMargin = 10;
const borderWidth = 0.2; 
const additionalTopPadding = 30; 
let currentPage = 1;

// Draw page border
const drawPageBorder = () => {
doc.setDrawColor(0, 0, 0); // Border color (black)
doc.setLineWidth(borderWidth);
doc.rect(borderMargin, borderMargin, pageSizeWidth - borderMargin * 2, pageSizeHeight - borderMargin * 2);
};

// Check if content will fit on the current page
const checkPageEnd = (currentY, additionalHeight, resetY = true) => {
if (currentY + additionalHeight > pageSizeHeight - borderMargin) { // Ensure it fits within the page
doc.addPage();
drawPageBorder();
currentPage++; // Increment the page number
// Apply additional top padding on the new page if it's the second page or later
return resetY ? (currentPage === 2 ? borderMargin + additionalTopPadding : borderMargin) : currentY; // Apply margin for new page or keep currentY
}
return currentY;
};

// Initialize the y position after auto table
let y = doc.autoTable.previous.finalY + borderMargin; // Start Y position after the auto table

// Grand total in words
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
const grandTotalInWords = numberToWords(billingDetails.grandTotal); 
const backgroundColor = [255, 182, 193]; // RGB for light pink
const textColor = [0, 0, 139]; // RGB for dark blue
const marginLeft = borderMargin + 7; // Adjusted to be within margins
const padding = 5;
const backgroundWidth = 186; // Fixed width for the background rectangle
const text = `Rupees: ${grandTotalInWords}`;
const textDimensions = doc.getTextDimensions(text);
const textWidth = textDimensions.w;
const textHeight = textDimensions.h;

const backgroundX = marginLeft - padding;
const backgroundY = y - textHeight - padding;
const backgroundHeight = textHeight + padding * 2; // Height including padding

// Check if there’s enough space for the content; if not, create a new page
y = checkPageEnd(y, backgroundHeight);

doc.setTextColor(...textColor);

// Add text on top of the background
doc.text(text, marginLeft, y);

// Continue with "Terms & Conditions" and other content
const rectFX = borderMargin + 4; // Adjusted to be within margins
const rectFWidth = pageSizeWidth - 2 * rectFX; // Adjust width to fit within page
const rectPadding = 4; // Padding inside the rectangle
// const lineHeight = 8; // Line height for text
const rectFHeight = 6 + lineHeight * 2 + rectPadding * 2; // Header height + 2 lines of text + padding

// Ensure there's enough space for the rectangle and text
y = checkPageEnd(y + backgroundHeight + 8, rectFHeight);

doc.setFont('helvetica', 'normal');
doc.rect(rectFX, y, rectFWidth, rectFHeight);

// Drawing the "Terms & Conditions" text inside the rectangle
doc.setFont('helvetica', 'bold');
doc.setTextColor(0, 0, 0);
doc.setFontSize(10);

let textY = y + rectPadding + 6; // Adjust as needed for vertical alignment
doc.text('Terms & Conditions', rectFX + rectPadding, textY);

// Adjust vertical position for the following text
textY = checkPageEnd(textY + lineHeight, lineHeight, false);
doc.setFont('helvetica', 'normal');
doc.text('1. Goods once sold will not be taken back.', rectFX + rectPadding, textY);

textY = checkPageEnd(textY + lineHeight, lineHeight, false);
doc.text('2. All matters Subject to "Sivakasi" jurisdiction only.', rectFX + rectPadding, textY);

// Add "Authorised Signature" inside the rectangle at the bottom right corner
const authSigX = rectFX + rectFWidth - rectPadding - doc.getTextWidth('Authorised Signature');
const authSigY = y + rectFHeight - rectPadding;
doc.setFont('helvetica', 'bold');
doc.text('Authorised Signature', authSigX, authSigY);

// Continue with additional content
y = checkPageEnd(y + rectFHeight + 8, 40, false);

// Reset font and color for additional text
doc.setFontSize(12);
doc.setTextColor(170, 51, 106);

// More content with additional checks
y = checkPageEnd(y + 45, 10, false);
doc.setFontSize(9);
doc.setTextColor(0, 0, 0);

y = checkPageEnd(y + 5, 20, false);
doc.setFont('helvetica', 'bold');

y = checkPageEnd(y + 7, 23, false);
doc.setFont('helvetica', 'normal');
doc.setTextColor(0, 0, 0);
doc.setFontSize(10);

// Draw the page border at the end
drawPageBorder();



  doc.save(`invoice_${invoiceNumber}_CUSTOMERCOPY.pdf`);
};



const handleSearch = (event) => {
const term = event.target.value.toLowerCase();
setSearchTerm(term);

setFilteredProducts(
products.filter(product => {
const productName = product.name ? product.name.toLowerCase() : '';
const productCode = product.sno !== undefined && product.sno !== null
  ? product.sno.toString().toLowerCase()
  : '';
return productName.includes(term) || productCode.includes(term);
})
);
};
 
  // const addToCart = (product) => {
  //   let productName = product.name;
  //   let price = product.saleprice;
  
  //   // If the product is 'Assorted Crackers', prompt the user for a new product name and price
  //   if (product.name === 'Assorted Crackers') {
  //     productName = prompt("Enter product name:");
  //     if (!productName) {
  //       alert("Product name is required.");
  //       return;
  //     }
  
  //     price = prompt(`Enter price for ${productName}:`);
  //     if (!price) {
  //       alert("Price is required.");
  //       return;
  //     }
  //     price = parseFloat(price); // Convert the input to a float number
  //     if (isNaN(price)) {
  //       alert("Please enter a valid price.");
  //       return;
  //     }
  //   }
  
  //   // Add the product as a new entry in the cart, even if the product ID is the same
  //   const newItem = {
  //     productId: product.id,
  //     name: productName,
  //     saleprice: price,
  //     quantity: 1,  // Each entry starts with a quantity of 1
  //   };
  
  //   const updatedCart = [...cart, newItem];
  //   setCart(updatedCart);
  //   updateBillingDetails(updatedCart);
  // };
  // const addToCart = (product) => {
  //   // Prevent adding out-of-stock products to the cart
  //   if (!product.inStock) {
  //     alert("This product is out of stock.");
  //     return;
  //   }
  
  //   let productName = product.name;
  //   let price = product.saleprice;
  
  //   // Handle 'Assorted Crackers' special case
  //   if (product.name === 'Assorted Crackers') {
  //     productName = prompt("Enter product name:");
  //     if (!productName) {
  //       alert("Product name is required.");
  //       return;
  //     }
  
  //     price = prompt(`Enter price for ${productName}:`);
  //     if (!price) {
  //       alert("Price is required.");
  //       return;
  //     }
  //     price = parseFloat(price);
  //     if (isNaN(price)) {
  //       alert("Please enter a valid price.");
  //       return;
  //     }
  //   }
  
  //   const newItem = {
  //     productId: product.id,
  //     name: productName,
  //     saleprice: price,
  //     quantity: 1
  //   };
  
  //   const updatedCart = [...cart, newItem];
  //   setCart(updatedCart);
  //   updateBillingDetails(updatedCart);
  // };
  
  const addToCart = (product) => {
    if (!product.inStock) {
      alert("This product is out of stock.");
      return;
    }

    const newItem = {
      productId: product.id,
      name: product.name,
      saleprice: product.saleprice,
      quantity: 1
    };

    const updatedCart = [...cart, newItem];
    setCart(updatedCart);
    updateBillingDetails(updatedCart);
  };

  const handleRemoveFromCart = (productId) => {
    // Find the index of the first item with the matching productId
    const itemIndex = cart.findIndex(item => item.productId === productId);
  
    if (itemIndex !== -1) {
      // Create a new cart array without the item at itemIndex
      const updatedCart = [...cart];
      updatedCart.splice(itemIndex, 1); // Remove one item at the found index
  
      setCart(updatedCart);
      updateBillingDetails(updatedCart);
    }
  };
  

  const handleDateChange = (event) => {
    const newSelectedDate = new Date(event.target.value);
    console.log('Selected Date:', newSelectedDate);
    setSelectedDate(newSelectedDate);
  };

//   return (
//     <div className="billing-calculator">
//       <div className="product-list">
//         <input
//           type="text"
//           placeholder="Search Products"
//           value={searchTerm}
//           onChange={handleSearch}
//           className="search-input"
//         />
//            <select  className="custom-select1" onChange={handleCategoryChange} value={category}>
//            <option value="">All Category</option>
//            <option value="ONE SOUND CRACKERS">ONE SOUND CRACKERS</option>
//               <option value="SPARKLERS">SPARKLERS</option>
//               <option value="BIGILI CRACKERS">BIGILI CRACKERS</option>
//               <option value="VANITHA SPECIALS">VANITHA SPECIALS</option>
//               <option value="CHILDRENS HAPPY CRACKERS">CHILDRENS HAPPY CRACKERS</option>
//               <option value="SKYSHOTS">SKYSHOTS</option>
//               <option value="REPEATING SHOTS">REPEATING SHOTS</option>
//               <option value="SHOWERS">T.STARS / CANDLE / PENCIL</option>
//               <option value="TWINKLING STAR">TWINKLING STAR</option>
//               <option value="GARLAND">GARLAND</option>
//               <option value="MATCHES">MATCHES</option>
//               <option value="WALA CRACKERS">WALA CRACKERS</option>
//               <option value="GIFT BOXES">GIFT BOXES</option>
//               <option value="BOMBS">BOMBS</option>
// </select>
//         {/* <ul>
//           {filteredProducts.map(product => (
//             <li key={product.id}>
//               <div className="product-details">
//                 <span>{product.name}</span>
                
//                 <span> {`(Sales Rs. ${product.saleprice ? product.saleprice.toFixed(2) : '0.00'})`}</span>
//               </div>
//               <button onClick={() => addToCart(product)}>Add to Cart</button>
//             </li>
//           ))}
//         </ul> */}
//           <ul>
//         {filteredProducts.map(product => (
//           <li key={product.id}>
//             <div className="product-details">
//               <span>{product.name}</span>
//               <span>{` (Sales Rs. ${product.saleprice ? product.saleprice.toFixed(2) : '0.00'})`}</span>
//               <span>
//                 {product.inStock ? (
//                   <span className="in-stock">In Stock</span>
//                 ) : (
//                   <span className="out-of-stock">Out of Stock</span>
//                 )}
//               </span>
//             </div>
//             {/* Disable button if out of stock */}
//             <button onClick={() => addToCart(product)} disabled={!product.inStock}>
//               {product.inStock ? 'Add to Cart' : 'Out of Stock'}
//             </button>
//           </li>
//         ))}
//       </ul>
//       </div>
//       <div className="cart">
//         <h2>Cart</h2>
//         <button className="remove-button" style={{display:"flex",position:"relative",left:"540px",bottom:"34px"}} onClick={() => ClearAllData()}>Clear cart</button>
//         <ul>
//           {cart.map(item => (
//             <li key={item.productId}>
//               <div className="cart-item">
//                 <span>{item.name}</span>
//                 <input
//                   type="number"
//                   value={item.quantity}
//                   onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
//                 />
//                 <span>Rs. {item.saleprice ? (item.saleprice * item.quantity).toFixed(2) : '0.00'}</span>
//                 <button className="remove-button" onClick={() => handleRemoveFromCart(item.productId)}>Remove</button>
//               </div>
//             </li>
//           ))}
//         </ul>
        
//         <div className="billing-summary">
//           <div className="billing-details">
//           <label>Invoice Number</label>
//           <input
//             type="text"
//             placeholder="Enter Invoice Number"
//             value={manualInvoiceNumber}
//             onChange={(e) => setManualInvoiceNumber(e.target.value)}
//             required
//            />
//             <label>Discount (%)</label>
//             <input
//               type="number"
//               value={billingDetails.discountPercentage}
//               onChange={handleDiscountChange}
//               min="0"
//               max="100"
//             />
          
//             <label>Date</label>
// <input
//   type="date"
//   className="custom-datepicker"
//   value={selectedDate.toISOString().substr(0, 10)} 
//   onChange={handleDateChange}
// />
//             <br />
//             <br />
//             <label>Tax Option</label>
//           <select value={taxOption} onChange={(e) => setTaxOption(e.target.value)}>
//             <option value="cgst_sgst">CGST + SGST</option>
//             <option value="igst">IGST</option>            
//             <option value="no_tax">No Tax</option>
//           </select>
//           </div>
//           <div className="billing-amounts">
//           <table>
//             <tbody>
//               <tr>
//                 <td>Total Amount:</td>
//                 <td>Rs. {billingDetails.totalAmount.toFixed(2)}</td>
//               </tr>
//               <tr>
//                 <td>Discounted Total:</td>
//                 <td>Rs. {billingDetails.discountedTotal.toFixed(2)}</td>
//               </tr>
//               {taxOption === 'cgst_sgst' && (
//                 <>
//                   <tr>
//                     <td>CGST (9%):</td>
//                     <td>Rs. {billingDetails.cgstAmount.toFixed(2)}</td>
//                   </tr>
//                   <tr>
//                     <td>SGST (9%):</td>
//                     <td>Rs. {billingDetails.sgstAmount.toFixed(2)}</td>
//                   </tr>
//                 </>
//               )}
//               {taxOption === 'igst' && (
//                 <tr>
//                   <td>IGST (18%):</td>
//                   <td>Rs. {billingDetails.igstAmount.toFixed(2)}</td>
//                 </tr>
//               )}
//               <tr className="grand-total-row">
//                 <td>Grand Total:</td>
//                 <td>Rs. {billingDetails.grandTotal.toFixed(2)}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//         </div>
//         <div className="customer-details-toggle">
//           <button onClick={() => setShowCustomerDetails(!showCustomerDetails)}>
//             {showCustomerDetails ? 'Hide Customer Details' : 'Show Customer Details'}
//           </button>
//         </div>
//         {showCustomerDetails && (
//           <div className="customer-details">
//             <div>
//               <label>Customer Name</label>
//               <input
//                 type="text"
//                 value={customerName}
//                 onChange={(e) => setCustomerName(e.target.value)}
//               />
//             </div>
//             <div>
//               <label>Customer Address</label>
//               <input
//                 type="text"
//                 value={customerAddress}
//                 onChange={(e) => setCustomerAddress(e.target.value)}
//               />
//             </div>
//             <div>
//               <label>Customer State</label>
//               <input
//                 type="text"
//                 value={customerState}
//                 onChange={(e) => setCustomerState(e.target.value)}
//               />
//             </div>
//             <div>
//               <label>Customer Phone</label>
//               <input
//                 type="text"
//                 value={customerPhone}
//                 onChange={(e) => setCustomerPhone(e.target.value)}
//               />
//             </div>
//             <div>
//               <label>Customer GSTIN</label>
//               <input
//                 type="text"
//                 value={customerGSTIN}
//                 onChange={(e) => setCustomerGSTIN(e.target.value)}
//               />
//             </div>
//             <div>
//               <label>{`Customer AAHDR(OPTIONAL)`}</label>
//               <input
//                 type="text"
//                 value={customerPAN}
//                 onChange={(e) => setCustomerPAN(e.target.value)}
//               />
//             </div>
//             <div>
//               <label>Customer Email</label>
//               <input
//                 type="email"
//                 value={customerEmail}
//                 onChange={(e) => setCustomerEmail(e.target.value)}
//               />
//              </div>
//           </div>
//         )}
//          <button onClick={() => addToCart({ id: 1, name: 'Assorted Crackers', saleprice: null })}>
//   Assorted crackers
// </button><br></br>
//        <button onClick={handleGenerateAllCopies}>Download All Copies</button><br></br>
//        <button style={{display:"none"}} onClick={() => transportCopy(invoiceNumber)}>Transport Copy</button>
//        <button style={{display:"none"}} onClick={() => salesCopy(invoiceNumber)}>Sales Copy</button>
//        <button style={{display:"none"}} onClick={() => OfficeCopy(invoiceNumber)}>Office Copy</button>
//         <button  onClick={() => CustomerCopy(invoiceNumber)}>Customer Copy</button>
//       </div>
//     </div>
//   );
// };
// return (
//   <div className="billing-calculator">
//     <div className="product-list">
//       <input
//         type="text"
//         placeholder="Search Products"
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="search-input"
//       />
//       <select className="custom-select1" onChange={(e) => setCategory(e.target.value)} value={category}>
//         <option value="">All Category</option>
//                    <option value="ONE SOUND CRACKERS">ONE SOUND CRACKERS</option>
//               <option value="SPARKLERS">SPARKLERS</option>
//                <option value="BIGILI CRACKERS">BIGILI CRACKERS</option>
//              <option value="VANITHA SPECIALS">VANITHA SPECIALS</option>
//              <option value="CHILDRENS HAPPY CRACKERS">CHILDRENS HAPPY CRACKERS</option>
//               <option value="SKYSHOTS">SKYSHOTS</option>
//               <option value="REPEATING SHOTS">REPEATING SHOTS</option>
//              <option value="SHOWERS">T.STARS / CANDLE / PENCIL</option>
//               <option value="TWINKLING STAR">TWINKLING STAR</option>
//              <option value="GARLAND">GARLAND</option>
//              <option value="MATCHES">MATCHES</option>
//             <option value="WALA CRACKERS">WALA CRACKERS</option>
//              <option value="GIFT BOXES">GIFT BOXES</option>
//               <option value="BOMBS">BOMBS</option>
//       </select>
//       <ul>
//         {filteredProducts.map(product => (
//           <li key={product.id}>
//             <div className="product-details">
//               <span>{product.name}</span>
//               <span>{`(Sales Rs. ${product.saleprice ? product.saleprice.toFixed(2) : '0.00'})`}</span>
//               <span>
//                 {product.inStock ? (
//                   <span className="in-stock">In Stock</span>
//                 ) : (
//                   <span className="out-of-stock">Out of Stock</span>
//                 )}
//               </span>
//             </div>
//             <button onClick={() => addToCart(product)} disabled={!product.inStock}>
//               {product.inStock ? 'Add to Cart' : 'Out of Stock'}
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>

//     <div className="cart">
//       <h2>Cart</h2>
//       <ul>
//         {cart.map(item => (
//           <li key={item.productId}>
//             <div className="cart-item">
//               <span>{item.name}</span>
//               <input
//                 type="number"
//                 value={item.quantity}
//                 onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
//               />
//               <span>Rs. {(item.saleprice * item.quantity).toFixed(2)}</span>
//             </div>
//           </li>
//         ))}
//       </ul>
//       <button onClick={handleGenerateAllCopies}>Download & Update Stock</button>
//     </div>
//   </div>
// );
// };

return (
  <div className="billing-calculator">
    {/* Product Search and Filter */}
    <div className="product-list">
      <input
        type="text"
        placeholder="Search Products"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <select
        className="custom-select1"
        onChange={(e) => setCategory(e.target.value)}
        value={category}
      >
        <option value="">All Category</option>
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

      {/* Product List */}
      {/* <ul>
        {filteredProducts.map((product) => (
          <li key={product.id}>
            <div className="product-details">
              <span>{product.name}</span>
              <span>{`(Sales Rs. ${
                product.saleprice ? product.saleprice.toFixed(2) : "0.00"
              })`}</span>
              <span>{`( InStock Rs. ${
                product.quantity ? product.quantity : "0"
              })`}</span> */}
              {/* <span>
                {product.inStock ? (
                  <span className="in-stock">In Stock</span>
                ) : (
                  <span className="out-of-stock">Out of Stock</span>
                )}
              </span> */}
            {/* </div>
            <button
              onClick={() => addToCart(product)}
              disabled={!product.inStock}
            >
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </button>
          </li>
        ))}
      </ul> */}
  <ul>
  {filteredProducts
    .sort((a, b) => {
      // Sort sno as strings
      return a.sno.localeCompare(b.sno, undefined, { numeric: true, sensitivity: 'base' });
    })
    .map(product => (
      <li key={product.id}>
        <div className="product-details">
          <span>{product.name}</span>
          <span>{`(Sales Rs. ${product.saleprice ? product.saleprice.toFixed(2) : '0.00'})`}</span>
        </div>
        <button onClick={() => addToCart(product)}>Add to Cart</button>
      </li>
    ))}
</ul>

    </div>

    {/* Cart Section */}
    <div className="cart">
      <h2>Cart</h2>
      <button
        className="remove-button"
        style={{ display: "flex", position: "relative", left: "540px", bottom: "34px" }}
        onClick={() => ClearAllData()}
      >
        Clear cart
      </button>
      <ul>
        {cart.map((item) => (
          <li key={item.productId}>
            <div className="cart-item">
              <span>{item.name}</span>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
              />
              <span>
                Rs.{" "}
                {item.saleprice
                  ? (item.saleprice * item.quantity).toFixed(2)
                  : "0.00"}
              </span>
              <button className="remove-button" onClick={() => handleRemoveFromCart(item.productId)}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Billing Summary */}
      <div className="billing-summary">
        <div className="billing-details">
          <label>Invoice Number</label>
          <input
            type="text"
            placeholder="Enter Invoice Number"
            value={manualInvoiceNumber}
            onChange={(e) => setManualInvoiceNumber(e.target.value)}
            required
          />
          <label>Discount (%)</label>
          <input
            type="number"
            value={billingDetails.discountPercentage}
            onChange={handleDiscountChange}
            min="0"
            max="100"
          />

          <label>Date</label>
          <input
            type="date"
            className="custom-datepicker"
            value={selectedDate.toISOString().substr(0, 10)}
            onChange={handleDateChange}
          />
          <br />
          <br />
          <label>Tax Option</label>
          <select
            value={taxOption}
            onChange={(e) => setTaxOption(e.target.value)}
          >
            <option value="cgst_sgst">CGST + SGST</option>
            <option value="igst">IGST</option>
            <option value="no_tax">No Tax</option>
          </select>
        </div>

        <div className="billing-amounts">
          <table>
            <tbody>
              <tr>
                <td>Total Amount:</td>
                <td>Rs. {billingDetails.totalAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Discounted Total:</td>
                <td>Rs. {billingDetails.discountedTotal.toFixed(2)}</td>
              </tr>
              {taxOption === "cgst_sgst" && (
                <>
                  <tr>
                    <td>CGST (9%):</td>
                    <td>Rs. {billingDetails.cgstAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>SGST (9%):</td>
                    <td>Rs. {billingDetails.sgstAmount.toFixed(2)}</td>
                  </tr>
                </>
              )}
              {taxOption === "igst" && (
                <tr>
                  <td>IGST (18%):</td>
                  <td>Rs. {billingDetails.igstAmount.toFixed(2)}</td>
                </tr>
              )}
              <tr className="grand-total-row">
                <td>Grand Total:</td>
                <td>Rs. {billingDetails.grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Section */}
      <div className="customer-details-toggle">
        <button onClick={() => setShowCustomerDetails(!showCustomerDetails)}>
          {showCustomerDetails ? "Hide Customer Details" : "Show Customer Details"}
        </button>
      </div>
      {showCustomerDetails && (
        <div className="customer-details">
          <div>
            <label>Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div>
            <label>Customer Address</label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />
          </div>
          <div>
            <label>Customer State</label>
            <input
              type="text"
              value={customerState}
              onChange={(e) => setCustomerState(e.target.value)}
            />
          </div>
          <div>
            <label>Customer Phone</label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
          <div>
            <label>Customer GSTIN</label>
            <input
              type="text"
              value={customerGSTIN}
              onChange={(e) => setCustomerGSTIN(e.target.value)}
            />
          </div>
          <div>
            <label>{`Customer PAN (OPTIONAL)`}</label>
            <input
              type="text"
              value={customerPAN}
              onChange={(e) => setCustomerPAN(e.target.value)}
            />
          </div>
          <div>
            <label>Customer Email</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <button onClick={() => addToCart({ id: 1, name: "Assorted Crackers", saleprice: null })}>
        Assorted Crackers
      </button>
      <br />
      <button onClick={handleGenerateAllCopies}>Download All Copies</button>
      <br />
      <button style={{ display: "none" }} onClick={() => transportCopy(invoiceNumber)}>
        Transport Copy
      </button>
      <button style={{ display: "none" }} onClick={() => salesCopy(invoiceNumber)}>
        Sales Copy
      </button>
      <button style={{ display: "none" }} onClick={() => OfficeCopy(invoiceNumber)}>
        Office Copy
      </button>
      <button onClick={() => CustomerCopy(invoiceNumber)}>Customer Copy</button>
    </div>
  </div>
);
};
export default BillingCalculator;
