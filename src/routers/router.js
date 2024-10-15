const express = require('express');
const router = express.Router();
const productController = require('../controller/controller');
const multer = require('multer');
const fs = require('fs');

// Cấu hình multer để lưu file ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'public', 'uploads')
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Routes cho sản phẩm
router.get('/add', productController.getAddProduct);
router.post('/', upload.single('image_product'), productController.postAddProduct);


// getAllProducts
// router.get('/getall', productController.getAllProducts);
// router.get('/categories', productController.getNameCategory)
module.exports = router;
