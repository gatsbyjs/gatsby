const Promise = require("bluebird");
const PDFParser = require("pdf2json");

const convertToJson = (path) =>
  new Promise((res, rej) => {
    const pdfParser = new PDFParser(this, 1);
    pdfParser.loadPDF(path);
    pdfParser
      .on("pdfParser_dataReady", () => {
        res(pdfParser.getRawTextContent());
      })
      .on("pdfParser_dataError", () => {
        rej(new Error("PDF to JSON conversion failed!"));
      });
  });
exports.convertToJson = convertToJson;
