const express = require('express'); //引入 express 套件
const cors = require('cors'); //引入 cors 套件
const sqlite3 = require('sqlite3').verbose();// 引入 sqlite3 套件，並開啟 verbose (冗長) 模式，可以讓錯誤訊息更詳細

const app = express(); //引入剛剛安裝的 express 工具
const port = 3000; //定義一個「門牌號碼」

//告訴伺服器：允許所有人來敲門（開發階段先全開）
app.use(cors());
// 告訴後端：如果有人傳 JSON 資料過來，請幫我解析成 JavaScript 物件
app.use(express.json());

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
        description TEXT,
        image TEXT
    )`);

    // 檢查表裡有沒有資料
    db.get("SELECT count(*) as count FROM products", (err, row) =>{
        if(row.count ===0){
            console.log('no products');
        }
    });
});

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

// 注意這裡用的是 .post，代表我們要「新增」資料
app.post('/api/products', (req,res) =>{
    // 1. 從 req.body 中拿出前端傳來的 name 和 price
    const {name, price, description} = req.body;
    // 2. 隨機生成一張圖片網址（讓畫面好看一點）
    const image = `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`;
    // 3. 準備 SQL 指令：插入資料
    const sql = 'INSERT INTO products(name, price, description, image) VALUES(?, ?, ?, ?)';
    const params = [name, price, description, image];

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
            image
        });
    });

});

// DELETE 方法代表「刪除」
// :id 是一個動態參數，代表前端會傳入商品的編號
app.delete('/api/products/:id', (req,res) => {
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
app.put('/api/products/:id', (req, res) =>{
    const id = req.params.id;
    const {name, price, description} = req.body; // 從包裹裡拿出新的名字和價格

    // SQL 更新語法：UPDATE [表名] SET [欄位] = [新值] WHERE [條件]
    const sql = 'UPDATE products SET name = ?, price = ? , description= ? WHERE id = ?';

    db.run(sql, [name, price, description,id], function(err){
        if(err){
            return res.status(400).json({error:err.message});
        }
        res.json({message:"update", changes: this.changes});
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
