const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const {createWorker} = require('tesseract.js');
const worker = createWorker({
    logger: m => console.log(m)
  });


const storage = multer.diskStorage({
    destination: (req, file , cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage : storage}).single('avatar');

app.set('view engine', 'ejs');
app.use(express.static('publi'))
// ROUTES
app.get('/', (req, res) => {
    res.render('index');
})

app.post('/upload', (req, res) => {
     upload(req, res, async (err) => {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(`./uploads/${req.file.originalname}`);
        const { data } = await worker.getPDF('Tesseract OCR Result');
        fs.writeFileSync('tesseract-ocr-result.pdf', Buffer.from(text))
        res.redirect('/download');
        await worker.terminate();
    })
})
// app.get('./upload', (req, res) => {
app.get('/download', (req, res) => {
    const file = `${__dirname}/tesseract-ocr-result.pdf`;
    res.download(file);
})
// })
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`running on Port ${PORT}`))