require('dotenv').config();

// process.env 就是「環境變數」的意思，後面接你在 .env 裡取的每一行的名字
const MY_SECRET_KEY = process.env.JWT_SECRET; 
const port = process.env.PORT || 3000; // 如果讀不到，預設用 3000

const express = require('express'); //引入 express 套件
const cors = require('cors'); //引入 cors 套件
const sqlite3 = require('sqlite3').verbose();// 引入 sqlite3 套件，並開啟 verbose (冗長) 模式，可以讓錯誤訊息更詳細
const bcrypt = require('bcryptjs'); // 引入加密
const jwt = require('jsonwebtoken'); // Token 套件
const multer = require('multer'); // 負責處理檔案上傳
const path = require('path'); // 負責處理路徑 (Windows/Mac 通用)
const { url } = require('inspector');

const app = express(); //引入剛剛安裝的 express 工具

//告訴伺服器：允許所有人來敲門（開發階段先全開）
app.use(cors());
// 告訴後端：如果有人傳 JSON 資料過來，請幫我解析成 JavaScript 物件
app.use(express.json());
// 讓外部可以透過網址讀取 uploads 資料夾裡的圖片
// 如果有請求是 '/uploads' 開頭的，就去讀取 'uploads' 資料夾的檔案
app.use('/uploads', express.static('uploads'));

// 建立資料庫連線
// 這行會在 backend 資料夾下建立一個名為 shop.db 的檔案
const db = new sqlite3.Database('./shop.db', (err) =>{
    if(err){
        console.error('fail:', err.message);
    }else{
        console.log('---connect sqlite (shop.db)---');
    }
});

//設定 Multer 的存放規則
const storageRule = multer.diskStorage({
    // 1. 設定儲存目的地
    destination: (req, file, cb) => {
        // 用法: cb(錯誤, 成功結果)
        cb(null, 'uploads/'); // (null=沒錯誤), 把檔案丟到 backend/uploads/
    },
    // 2. 設定檔案命名規則
    filename: (req, file, cb) => {
        // file.originalname 是原始檔名 (例如: dog.png)
        // Date.now() 是現在的時間 (毫秒)
        // 組合起來變成: 1770492493-dog.png (保證不重複)
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// 建立上傳物件 (我們會用這個 uploadPhoto 變數來當守衛)
const uploadPhoto = multer({storage: storageRule});

//初始化資料庫內容
//serialize(序列化)
db.serialize(() =>{
    // 建立商品表 (IF NOT EXISTS 代表如果檔案已經有了，就不要重複建立)
    db.run(`CREATE TABLE IF NOT EXISTS products(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER,
        description TEXT,
        image TEXT
    )`);

    //建立使用者表格
    db.run(`CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE, 
        password TEXT,
        role TEXT DEFAULT 'user'        
    )`);

    // 檢查表裡有沒有資料
    db.get("SELECT count(*) as count FROM products", (err, row) =>{
        if(row.count ===0){
            console.log('no products');
        }
    });
});

//註冊 API (POST)
app.post('/api/register', (req, res) =>{
    // 1. 從前端傳來的包裹中，拿出帳號和密碼
    const {username, password} = req.body;
    // 2. 基本檢查：如果沒填就報錯
    if(!username || !password){
        return res.status(400).json({error: '請輸入帳號與密碼'});
    };
    // 3. 關鍵步驟：密碼加密 
    // 我們絕對不能存明碼 (例如 "123456")，萬一資料庫被盜就慘了。
    // bcrypt.hashSync 就像一台「碎紙機」，把密碼攪碎成一串亂碼。
    // 10 是攪碎的強度 (Salt rounds)，數字越大越安全，但也越慢。
    const hashedPassword = bcrypt.hashSync(password, 10);

    // 4. 準備存入資料庫
    // 為了測試方便，我們把所有註冊的人都暫時設為 'admin' (管理員)
    // 等之後功能做完，我們再改回 'user'
    const role = 'admin';
    const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';

    // 5. 執行存檔
    db.run(sql, [username, hashedPassword, role], function(err){
        if(err){
            // 如果報錯包含 "UNIQUE"，代表帳號已經有人用了
            if(err.message.includes('UNIQUE')){
                return res.status(400).json({error: '這個名稱已經被使用過了！'});
            }
            return res.status(500).json({error: err.message});
        }
        // 6. 成功！回傳成功訊息
        res.json({message: '註冊成功！', id: this.lastID});
    });
});

//登入 API (POST)
app.post('/api/login', (req, res) =>{
    const {username, password} = req.body;
    // 1. 基本檢查
    if(!username || !password){
        return res.status(400).json({error: '請輸入帳號與密碼'});
    };
    // 2. 去資料庫找這個人
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, user) =>{
        if(err) return res.status(500).json({error: err.message});
        // 3. 如果找不到這個帳號
        if(!user){
            return res.status(401).json({error:'帳號或密碼錯誤'});
        };
        // 4. 驗證密碼
        // bcrypt.compareSync 會幫我們比對：
        // "使用者輸入的密碼" (明碼) vs "資料庫裡的亂碼" (Hash)
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if(!passwordIsValid){
            return res.status(401).json({error: '帳號或密碼錯誤'});
        };
        // 5. 發通行證 (JWT)
        // jwt.sign(內容, 密鑰, 過期時間)
        // 這裡我們把 id, username, role 寫進通行證裡
        const token = jwt.sign(
            {id:user.id, username: user.username, role: user.role},
            MY_SECRET_KEY, // 密鑰
            {expiresIn: '1h'} // 這張證件1小時後過期
        );
        // 6. 回傳 token 和使用者資料給前端
        res.json({
            message: '登入成功',
            token: token,
            user: {id: user.id, username: user.username, role: user.role}
        });
    });
});

//中介軟體
/**
req: 前端寄來的信 (包含 header, body 等)
res: 我們要回給前端的信
next: 關鍵！這是一個函式，呼叫它代表「放行，去下一關」**/
const authenticateToken = (req, res, next) =>{
    // 1. 從信封的標頭 (Headers) 拿出 Authorization 欄位
    // 前端通常會這樣傳： "Bearer <亂碼Token>"
    const authHeader = req.headers['authorization'];
    // 2. 切割字串，只拿出 <亂碼Token> 的部分
    // 如果 authHeader 是 undefined (沒帶證件)，token 就會是 undefined
    const token = authHeader &&authHeader.split(' ')[1];
    // 3. 第一關檢查：如果根本沒帶 Token
    if(token == null){
        console.log('被攔截：沒有 Token');
        return res.sendStatus(401); // 401: Unauthorized (未授權)
    };
    // 4. 第二關檢查：有帶 Token，但檢查是不是偽造的或過期的
    // jwt.verify(通行證, 密鑰, 驗證後的動作)
    jwt.verify(token, MY_SECRET_KEY, (err, user) =>{
        if(err){
            console.log('被攔截：Token 無效或過期');
            return res.sendStatus(403); // 403: Forbidden (禁止進入)
        };
        // 5. 驗證通過！
        // 把解碼出來的使用者資料 (id, username, role) 掛在 req 上面
        // 這樣後面的 API 就可以知道「現在是誰在操作」
        req.user = user;
        // 6. 放行！前往下一個步驟 (原本的 API)
        next();
    });
};

// 定義一個新的路徑 /api/products，讓它去資料庫「撈貨」
app.get('/api/products', (req,res)=> {
    // SQL 語法：SELECT * FROM products 代表「選取 products 表裡面的所有欄位」
    db.all("SELECT * FROM products", [], (err,rows) =>{
        if(err){
            res.status(500).json({ error: err.message});
            return;
        }
        
        res.json(rows);// 將從資料庫撈出來的 rows (陣列) 回傳給前端
        // res.json 會自動做兩件事：
        // (A) 把 JavaScript 陣列轉成 JSON 字串
        // (B) 告訴瀏覽器：「這是一份 JSON 資料，請用正確方式解析」
    });  
});

//根據 ID 取得單一商品
// :id 代表這是一個變數 (例如 1, 2, 100...)
app.get('/api/products/:id', (req, res) => {
    // 1. 抓取網址上的 id 參數
    const id = req.params.id;
    // 2. SQL 語法：只找 id 符合的那一筆
    const sql = 'SELECT * FROM products WHERE id = ?';
    // 3. 執行搜尋
    db.get(sql, [id], (err,row) => {
        if(err){
            // 如果資料庫出錯 (例如語法錯誤)
            return res.status(400).json({error: err.message});
        }
        if(!row){
            // 如果找不到這個商品 (row 會是 undefined)
            return res.status(404).json({error: '找不到商品'});
        }
        // 4. 成功找到，回傳該商品資料
        res.json(row);
    });

});

// 圖片上傳 API
// upload.single('file'): 這是 Multer 的守衛，它會只接收欄位名稱為 'file' 的單一檔案
app.post('/api/upload', authenticateToken, uploadPhoto.single('file'), (req, res) => {
    // 1. 如果沒收到檔案
    if(!req.file){
        return res.status(400).json({message: '請選擇檔案'});
    };
    // 2. 如果成功，Multer 會把檔案資訊放在 req.file 裡
    // 我們要回傳「圖片的網址」給前端
    // 網址格式: http://localhost:3000/uploads/檔名
    const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;

    res.json({
        message: '上傳成功',
        url: imageUrl
    });
});

// 注意這裡用的是 .post，代表我們要「新增」資料
app.post('/api/products', authenticateToken, uploadPhoto.single('file'), (req,res) =>{
    // 1. 從 req.body 中拿出前端傳來的 name 和 price
    const {name, price, description, image} = req.body;
    // 2. 圖片
    const finalImage = image || 'https://placehold.co/300x300';
    // 3. 準備 SQL 指令：插入資料
    const sql = 'INSERT INTO products(name, price, description, image) VALUES(?, ?, ?, ?)';
    const params = [name, price, description, finalImage];

    // 4. 執行存檔
    db.run(sql, params, function(err){
        if(err){
            return res.status(400).json({error: err.message});
        }
        // 5. 成功後，回傳剛剛新增的那筆資料給前端
        res.json({
            id: this.lastID, // 這是資料庫自動生成的編號
            name,
            price,
            description,
            finalImage
        });
    });

});

// DELETE 方法代表「刪除」
// :id 是一個動態參數，代表前端會傳入商品的編號
app.delete('/api/products/:id', authenticateToken, (req,res) => {
    const id = req.params.id; // 取得 URL 網址上的 id
    //SQL 語法：DELETE FROM [表名] WHERE [條件]
    const sql = 'DELETE FROM products WHERE id = ?';

    db. run(sql, id, function(err){
        if(err){
            res.status(400).json({"error":err.message});
            return;
        }
        // 如果執行成功，回傳被刪除的筆數
        res.json({"message":"deleted", changes: this.changes });
    });
});

// 修改商品 (Update)
// 動詞用 PUT，代表「更新資源」
app.put('/api/products/:id', authenticateToken, uploadPhoto.single('file'), (req, res) =>{
    const id = req.params.id;
    const {name, price, description, image} = req.body; // 從包裹裡拿出新的名字和價格

    let finalImage = image || 'https://placehold.co/300x300'; // 預設使用前端傳回來的「舊圖片網址」
    // 如果 req.file 存在，代表使用者這次有上傳「新圖片」
    if(req.file){
        finalImage = `http://localhost:3000/uploads/${req.file.filename}`;
    };

    // SQL 更新語法：UPDATE [表名] SET [欄位] = [新值] WHERE [條件]
    const sql = 'UPDATE products SET name = ?, price = ?, description= ?, image= ? WHERE id = ?';

    db.run(sql, [name, price, description, finalImage, id], function(err){
        if(err){
            return res.status(400).json({error:err.message});
        };
        // 檢查有沒有真的更新到資料 (有可能 ID 不存在)
        if(this.changes === 0){
            return res.status(404).json({message: '找不到該商品'});
        };
        res.json({
            message:"更新成功",
            data:{
                id: req.params.id,
                name,
                price,
                description,
                image: finalImage
            }
        });
    });
});


//讓伺服器開始在 3000 埠口「聽候差遣」
app.listen(port,() => {
    console.log(`後端伺服器跑起來了： http://localhost:3000`);
});
