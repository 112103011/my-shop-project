/** 
1. 引入剛剛安裝的 express 工具
2. 定義一個「門牌號碼」
3. 設定一個簡單的路由：當有人拜訪首頁 (/) 時做什麼
4. 讓伺服器開始在 3000 埠口「聽候差遣」
**/
const express = require('express');
const app = express();

const port = 3000;

app.get('/', (req, res) => {
    res.send('hello!');
});

app.listen(port,() => {
    console.log(`伺服器啟動了 http://localhost:3000`);
});
