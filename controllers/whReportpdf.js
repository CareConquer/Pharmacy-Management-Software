import htmlPdf from 'html-pdf-node';

class WHHTMLToPDF {
    async generatePDF(htmlContent, filePath = null) {
        const options = { format: 'A4', margin: {
            top: '1mm',
            bottom: '1mm',
            left: '5mm',
            right: '5mm'
        } };
        const file = { content: htmlContent };

        return new Promise((resolve, reject) => {
            htmlPdf.generatePdf(file, options).then(pdfBuffer => {
                if (filePath) {
                    fs.writeFileSync(filePath, pdfBuffer);
                }
                resolve(pdfBuffer);
            }).catch(err => {
                reject(err);
            });
        });
    }
}

export default WHHTMLToPDF;
