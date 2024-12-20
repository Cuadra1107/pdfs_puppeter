module.exports = { message, generate, generatePdfHtml };

require('dotenv').config();

const puppeteer = require('puppeteer');
const axios = require('axios');
const FormData = require('form-data');
const { env } = require('process');

function message(){
    return {
        "message":"Hello from inside pdf generator"
    };
}

async function generate(url, filename, recordId, module, field, fileInfo){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, {
        waitUntil: 'networkidle2',
    });
    //await page.setViewport({width: 1080, height: 1920});
    //await new Promise(r => setTimeout(r, 5000));
    const pdf = await page.pdf({
        path: `./files/${filename}.pdf`,
        format: 'LETTER'
    });

    console.log(pdf);

    let formData = new FormData();
    let file = Buffer.from(pdf)
            
    formData.append("files",file,{
        type: "application/octet-stream",
        filename: 'pdf_recepcion.pdf'
    });
    formData.append("path",`Receptions/ReceptionDetail_${recordId}`)
    formData.append("ref",`${module}`);
    formData.append("refId",`${recordId}`);
    formData.append("field",`${field}`);
    formData.append('fileInfo', JSON.stringify(fileInfo));

    return axios.post(env.server,formData);
}

async function generatePdfHtml(html, filename, instance ,recordId, module, field, fileInfo) {
    html = decodeURIComponent(escape(atob(html)));
    console.log(html);
    const browser = await puppeteer.launch({ args: ['--no-sandbox'],headless: 'shell' });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36");

    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF for the report
    const pdf = await page.pdf({ format: "A4", margin:{ top: '0.7cm', bottom: '0.7cm' }});
    await browser.close();

    console.log(pdf);

    let formData = new FormData();
    let file = Buffer.from(pdf)
            
    formData.append("files",file,{
        type: "application/octet-stream",
        filename: `${filename}`
    });
    formData.append("path",`${instance}/Receptions/ReceptionDetail_${recordId}`)
    formData.append("ref",`${module}`);
    formData.append("refId",`${recordId}`);
    formData.append("field",`${field}`);
    formData.append('fileInfo', JSON.stringify(fileInfo));

    return axios.post(env.server,formData);

}


//linux, install 
//sudo apt-get update
//sudo apt-get install -y libgbm-dev