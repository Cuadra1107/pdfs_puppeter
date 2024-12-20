require('dotenv').config();

const Koa = require('koa');
const { koaBody } = require('koa-body');
const Router = require('koa-router');
const cors = require('@koa/cors');
const static = require("koa-static");
const mount = require('koa-mount')
const path = require('path')

const pdfs = require('./pdfs');
const { env } = require('process');

const app = new Koa();
const router = new Router();

const QRCode = require('qrcode');


router.get('/api', (ctx, next) => {
    ctx.body = {
        "message":"Hello World PDF maker",
        "version":"1.1.0"
    }
});

router.post('/api/generate_qrcode', async (ctx, next) => {
    let data = ctx.request.body.data;

    await new Promise((resolve, reject) => {
        QRCode.toDataURL(`${data}`, (err, dataURL) => {
          if (err) {
              reject(err);
          } else {
              resolve(dataURL);
          }
      });
    }).then((url)=>{
        ctx.response.body = {url}; 
        console.log(url);
    });
});

router.get('/api/pdfs', (ctx, next) => {
    ctx.body = pdfs.message();
});

router.get('/api/pdfs/generate',async (ctx, next) => {
    let url = ctx.request.query.url;
    let filename = ctx.request.query.filename;

    //starpi files to append file to record
    let recordId = ctx.request.query.recordId;
    let module = ctx.request.query.module;
    let field = ctx.request.query.field;
    let fileInfo = {
        name: `${filename}`,
        caption: `${filename}`,
    };

    ctx.response.body = await pdfs.generate(url, filename, recordId, module, field, fileInfo).then((res)=>{
        //generate file and upload it to the strapi record. 
        const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
        console.log('Status Code:', res.status);
        console.log('Date in Response header:', headerDate);

        const response = res.data;
        console.log(response);
        ctx.status = 200;
        return {path: response};
    },(error)=>{
        ctx.status = 500;
        return {error: error.message};
    })
});

router.post('/api/pdfs/generate_html',async (ctx, next) => {
    let html = ctx.request.body.html;
    let filename = ctx.request.body.filename;

    //starpi files to append file to record
    let instance = ctx.request.body.instance;
    let recordId = ctx.request.body.recordId;
    let module = ctx.request.body.module;
    let field = ctx.request.body.field;
    let fileInfo = {
        name: `${filename}`,
        caption: `${filename}`,
    };

    ctx.response.body = await pdfs.generatePdfHtml(html, filename, instance, recordId, module, field, fileInfo).then((res)=>{
        //generate file and upload it to the strapi record. 
        const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
        console.log('Status Code:', res.status);
        console.log('Date in Response header:', headerDate);

        const response = res.data;
        console.log(response);
        ctx.status = 200;
        return {path: response};
    },(error)=>{
        ctx.status = 500;
        return {error: error.message};
    })
});




app.use(mount('/public',static(path.join(__dirname,"/files"))));
app.use(cors());
app.use(koaBody());
app.use(router.routes());
//404
app.use(async (ctx, next) => {
    try {
      await next()
      if (ctx.status === 404) {
        ctx.status = 404;
        ctx.body = {
            "message":"Page was not found"
        };
      }
    } catch (err) {
      // handle error
    }
})

app.listen(3010, function(){
    console.log('Server running on https://localhost:3010')
});