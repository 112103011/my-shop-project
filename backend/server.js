/** 

**/
const express = require('express'); //引入 express 套件
const cors = require('cors'); //引入 cors 套件
const app = express(); //引入剛剛安裝的 express 工具
const port = 3000; //定義一個「門牌號碼」

//告訴伺服器：允許所有人來敲門（開發階段先全開）
app.use(cors());

//設定一個簡單的路由：當有人拜訪首頁 (/) 時做什麼
app.get('/', (req, res) => {
    res.send('hello!這是從後端傳來的資料');
});

//讓伺服器開始在 3000 埠口「聽候差遣」
app.listen(port,() => {
    console.log(`後端伺服器跑起來了： http://localhost:3000`);
});
