const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');
const productRouter = require('./src/routers/router'); // Adjusted path
const { default: mongoose } = require('mongoose');
const multer = require('multer');
const app = express();
app.use(cors()); 
app.use(express.json());


const url = 'mongodb+srv://Nhom07:Nhom07VAA@group07.i8yw5.mongodb.net/technology?retryWrites=true&w=majority&appName=Group07';
const dbName = 'technology';

let db; 

// Connect to MongoDB
const connectDB = async () => {
  const client = new MongoClient(url);
  try {
    await mongoose.connect(url)
    // await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); 
  }
};


// Cấu hình để sử dụng thư mục public cho ảnh tĩnh
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Cấu hình multer để lưu file vào thư mục public/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public/uploads')); // Lưu vào thư mục public/uploads
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`); // Đặt tên file với timestamp
  },
});

const upload = multer({ storage: storage });


//get all products
app.get('/products', async (req, res) => {
  try {
    const productsCollection = db.collection('product');
    const products = await productsCollection.find().toArray();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views')); 

app.use(express.urlencoded({ extended: true })); 
app.use('./uploads', express.static(path.join(__dirname, 'public', 'uploads')));// Cung cấp tĩnh folder uploads

app.use('/product', productRouter);


app.get('/product/add', (req, res) => {
  res.render('addProduct');  
});


// Định nghĩa schema cho sản phẩm
const productSchema = new mongoose.Schema({
  product_id: Number,
  category_id: Number,
  name_product: String,
  description: String,
  price: Number,
  quantity: Number,
  image_product: String,
});

const Product = mongoose.model(db, productSchema, 'product');

// post add product
app.post('/products/FormAddProduct/alert',upload.single('image_product'), async (req,res)=>{
  const { product_id,category_id,name_product, description, price ,quantity} = req.body;
  const image_product = req.file;

  if (!image_product) {
      return res.send('Vui lòng tải lên một hình ảnh.');
  }

  // Tạo đối tượng sản phẩm mới
  const newProduct = new Product({
      product_id: product_id,
      category_id: category_id,
      name_product: name_product,
      description: description,
      price: price,
      quantity: quantity,
      image_product: '/uploads/' + image_product.filename // Lưu đường dẫn ảnh
  });

  // Lưu sản phẩm vào MongoDB
  await newProduct.save()
      .then(() => {
          res.json(newProduct)
      })
      .catch(err => {
        res.json(err)
          // res.send('Có lỗi xảy ra khi thêm sản phẩm!');
          console.log(err);
      });
});


// Start the server and connect to MongoDB
const startServer = async () => {
  await connectDB();
  app.listen(3003, () => {
    console.log('Server is running on port 3003');
  });
};

startServer(); 
