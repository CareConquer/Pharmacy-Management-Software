import htmlPdf from 'html-pdf-node';

class HTMLToPDF {
    async generatePDF(htmlContent, filePath = null) {
        const options = { 
            format: 'A5', 
            landscape: true, // Set landscape mode
            margin: {
                top: '5mm',
                bottom: '5mm',
                left: '5mm',
                right: '5mm'
            } 
        };
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

export default HTMLToPDF;
