import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import './App.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


function App() {
  const [images, setImages] = useState([]);
  const imageShowerRef = useRef(null);
  const [showImageShower, setShowImageShower] = useState(false);


  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const filePromises = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...filePromises]);
  };
  useEffect(() => {
    AOS.init({
      duration: 500, 
      easing: 'ease-in-out', 
      once: true, 
    });
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
  
    // Function to add an image to the PDF
    const addImageToPDF = (img, index, callback) => {
      const imgElement = new Image();
      imgElement.src = img;
  
      imgElement.onload = () => {
        const imgWidth = imgElement.width * 0.75;
        const imgHeight = imgElement.height * 0.75;
        const ratio = imgHeight / imgWidth;
        const pdfWidth = pageWidth;
        const pdfHeight = pdfWidth * ratio;
  
        if (pdfHeight > pageHeight) {
          const scaledWidth = pageHeight / ratio;
          const scaledHeight = pageHeight;
          doc.addImage(imgElement, "PNG", 0, 0, scaledWidth, scaledHeight, null, 'FAST');
        } else {
          const y = (pageHeight - pdfHeight) / 2;
          doc.addImage(imgElement, "PNG", 0, y, pdfWidth, pdfHeight, null, 'FAST');
        }
  
        // Add a new page if it's not the last image
        if (index < images.length - 1) {
          doc.addPage();
        }
  
        callback(); // Call the callback after adding the image
      };
    };
  
    // Function to process images in sequence
    const processImagesInSequence = (index) => {
      if (index >= images.length) {
        doc.save("images.pdf"); // Save the PDF after processing all images
        return;
      }
  
      addImageToPDF(images[index], index, () => {
        processImagesInSequence(index + 1); // Process the next image
      });
    };
  
    processImagesInSequence(0); // Start processing from the first image
  };


  const clearImages = () => {
    setImages([]);
  };


  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };


  const handleMouseDown = (e) => {
    e.preventDefault();
    const slider = imageShowerRef.current;
    slider.isDown = true;
    slider.startX = e.pageX;
    slider.scrollLeftAtStart = slider.scrollLeft;
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    const slider = imageShowerRef.current;
    if (!slider.isDown) return;
    const x = e.pageX - slider.startX;
    slider.scrollLeft = slider.scrollLeftAtStart - x;
  };

  const handleMouseUp = () => {
    const slider = imageShowerRef.current;
    slider.isDown = false;
  };

  const handleMouseLeave = () => {
    const slider = imageShowerRef.current;
    slider.isDown = false;
  };



  const handleReplaceImage = (index) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const newImageURL = URL.createObjectURL(file);
        setImages((prevImages) => {
          const updatedImages = [...prevImages];
          updatedImages[index] = newImageURL;
          return updatedImages;
        });
      }
    };
    fileInput.click(); // Open file dialog
  };
  useEffect(() => {
    setShowImageShower(images.length > 0);
  }, [images]);

  return (
    <div className="mainContainer">
      <div className="header">
        <h1  data-aos="zoom-out" className="HeaderText">nit.<p style={{ fontWeight: "normal" }}>Convert</p></h1>
      </div>
      <div className="micro">
        <input
          type="file"
          id="fileInput"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="inputCbox"
          style={{ display: 'none' }}  // Hide the default input
        />
        <label htmlFor="fileInput" className="fileInputLabel ButtonDesign" >
          <i  class="fa-regular fa-image"></i>
          <p data-aos="zoom-out" >Choose Images</p>
        </label>
        <div className={`Slider ${!showImageShower ? 'hidden' : ''}`}>
          <div
          data-aos="zoom-out"
            className="ImageShower"
            ref={imageShowerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {images.map((image, index) => (
              <div key={index} id={`img-${index}`} className="Images" >
                <p className="imageName">{index + 1}</p>
                <img src={image} alt={`uploaded ${index}`} className="innerImage" />
                <div className="imageActions">
                  <button className="replaceButton deleteButton" onClick={() => handleReplaceImage(index)}>
                    Replace <i className="fa-solid fa-redo"></i>
                  </button>
                  <button className="deleteButton" onClick={() => removeImage(index)}>
                    Delete <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {images.length > 0 && (
          <div className="ButtonBox">
            <button

              className="Button ButtonDesign"
              onClick={generatePDF}
            >
              Convert<i class="fa-solid fa-download"></i>
            </button>
            <button
              className="Button2 ButtonDesign"
              onClick={clearImages}
            >
              Clear<i class="fa-solid fa-delete-left"></i>
            </button>
          </div>

        )}
      </div>
    </div>
  );
}

export default App;
