import React, { useState, useRef } from "react";
import "./omrSheet.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
const OMRSheet = () => {
  const omrRef = useRef();
  const [totalQuestions, setTotalQuestions] = useState("0");
  const [options, setOptions] = useState(4);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedSize, setSelectedSize] = useState("A4");
  const [optionType, setOptionType] = useState("upperCase");

  const MAX_COLUMNS = 5;
  const MAX_COLUMNS_LEGAL = 5;

  const renderQuestions = () => {
    const questions = [];
    for (let i = 1; i <= totalQuestions; i++) {
      questions.push(
        <div key={i} className="omr-question">
          <div
            className="omr-question-number"
            style={{
              color: selectedColor,
            }}
          >
            {i}
          </div>
          {renderOptionsWithColor()}
        </div>
      );
    }
    return questions;
  };
  const renderOptionsWithColor = () => {
    let optionArray;
    switch (optionType) {
      case "upperCase":
        optionArray = Array.from({ length: options }, (_, index) =>
          String.fromCharCode(65 + index)
        );
        break;
      case "lowerCase":
        optionArray = Array.from({ length: options }, (_, index) =>
          String.fromCharCode(97 + index)
        );
        break;
      case "numeric":
        optionArray = Array.from({ length: options }, (_, index) =>
          (index + 1).toString()
        );
        break;
      default:
        optionArray = [];
    }
    return optionArray.map((option, index) => (
      <div
        key={index}
        className="omr-option"
        style={{
          borderColor: selectedColor, // Change border color here
          color: selectedColor, // Also set the text color to the selected color
        }}
      >
        {option}
      </div>
    ));
  };

  const calculateQuestionsPerColumn = () => {
    const maxQuestionsPerColumn =
      selectedSize === "A4"
        ? Math.ceil(totalQuestions / MAX_COLUMNS)
        : Math.ceil(totalQuestions / MAX_COLUMNS_LEGAL);

    return Math.min(maxQuestionsPerColumn, totalQuestions);
  };

  const renderColumns = () => {
    const columns = [];
    const questionsPerColumn = calculateQuestionsPerColumn();
    const totalColumns =
      selectedSize === "A4"
        ? Math.min(MAX_COLUMNS, Math.ceil(totalQuestions / questionsPerColumn))
        : Math.min(
            MAX_COLUMNS_LEGAL,
            Math.ceil(totalQuestions / questionsPerColumn)
          );

    for (let i = 0; i < totalColumns; i++) {
      columns.push(
        <div
          key={i}
          className="omr-column"
          style={{
            maxWidth:
              selectedSize === "A4"
                ? `calc(20% - 15px)`
                : `calc(14.2857% - 15px)`,
          }}
        >
          {renderQuestions().slice(
            i * questionsPerColumn,
            (i + 1) * questionsPerColumn
          )}
        </div>
      );
    }
    return columns;
  };

  const downloadPDF = () => {
    html2canvas(omrRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("omr_sheet.pdf");
    });
  };

  return (
    <div className="main">
      <div className="fields">
        <h1>OMR SHEET GENERATOR</h1>
        <div>
          <div>
            <label>
              Total Questions:{" "}
              <input
                type="number"
                value={totalQuestions}
                onChange={(e) =>
                  setTotalQuestions(Math.min(200, e.target.value))
                }
                max={200} // Set the maximum value to 200
                min={0}
              />
            </label>
            <br />
            <label>
              Options :{" "}
              <input
                type="number"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
              />
            </label>
            <br />
            <label>
              Option type:{" "}
              <select
                value={optionType}
                onChange={(e) => setOptionType(e.target.value)}
              >
                <option value="upperCase">A, B, C, ...</option>
                <option value="lowerCase">a, b, c, ...</option>
                <option value="numeric">1, 2, 3, ...</option>
              </select>
            </label>
            <br />
            <label>
              Select Color:{" "}
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
              />
            </label>

            <br />
            <label>
              Select Size:
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="A4">A4</option>
                <option value="Legal">Legal</option>
              </select>
            </label>
            <br />
            <button onClick={downloadPDF}>Download OMR as PDF</button>
          </div>
        </div>
      </div>
      {/* conditional rendering of container */}
      <div className="parent-container">
        <div
          className={selectedSize === "A4" ? "a4-container" : "legal-container"}
          data-total-questions={totalQuestions}
          ref={omrRef}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
        >
          <div
            className={
              selectedSize === "A4"
                ? "omr-sheet-container"
                : "legal-sheet-container"
            }
          >
            {renderColumns()}
          </div>
          <div
            className="name-signature"
            style={{
              color: selectedColor,
              fontSize: selectedSize === "A4" ? "18px" : "14px",
            }}
          >
            <div className="name">Name: _________________</div>
            <div className="signature">Signature: _________________</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OMRSheet;
