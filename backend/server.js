/** 

**/
const express = require('express'); //引入 express 套件
const cors = require('cors'); //引入 cors 套件
const sqlite3 = require('sqlite3').verbose();// 引入 sqlite3 套件，並開啟 verbose (冗長) 模式，可以讓錯誤訊息更詳細

const app = express(); //引入剛剛安裝的 express 工具
const port = 3000; //定義一個「門牌號碼」

//告訴伺服器：允許所有人來敲門（開發階段先全開）
app.use(cors());

// 建立資料庫連線
// 這行會在 backend 資料夾下建立一個名為 shop.db 的檔案
const db = new sqlite3.Database('./shop.db', (err) =>{
    if(err){
        console.error('fail:', err.message);
    }else{
        console.log('---connect sqlite (shop.db)---');
    }
});

//初始化資料庫內容
//serialize(序列化)
db.serialize(() =>{
    // 建立商品表 (IF NOT EXISTS 代表如果檔案已經有了，就不要重複建立)
    db.run(`CREATE TABLE IF NOT EXISTS products(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER,
        image TEXT
    )`);

    // 檢查表裡有沒有資料，如果空空的，我們就塞入幾筆初始商品
    db.get("SELECT count(*) as count FROM products", (err, row) =>{
        if(row.count ===0){
            console.log('no products');
            const insert = 'INSERT INTO products (name, price, image) VALUES (?,?,?)';
            db.run(insert,['資料庫筆記本', 250, 'https://picsum.photos/200/200?random=10']);
            db.run(insert,['資料庫原子筆', 50, 'https://picsum.photos/200/200?random=11']);
        }
    });
});

/**

 */

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


//設定一個簡單的路由：當有人拜訪首頁 (/) 時做什麼
app.get('/', (req, res) => {
    res.send('hello!這是從後端傳來的資料');
});

//讓伺服器開始在 3000 埠口「聽候差遣」
app.listen(port,() => {
    console.log(`後端伺服器跑起來了： http://localhost:3000`);
});
