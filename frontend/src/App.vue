<script setup>
import { ref, onMounted } from 'vue';

// 【建立狀態】
// ref 就像是一個「會自動更新的顯示板」。
// 當 message 的值改變時，網頁畫面上用到它的地方會「砰」的一聲自動變換，不用手動去改 HTML。
const message = ref('正在連線到後端...'); // 建立一個變數來存資料，預設是「載入中...」

// 【非同步動作】
// 因為網路傳輸需要時間（可能 0.5 秒），我們不能讓網頁卡住死掉。
// async/await 就像是「點餐後拿號碼牌」，等餐點（資料）好了再繼續執行。
const fetchData = async() =>{// 定義一個「拿資料」的動作
  try{
    // 1. fetch: 這是瀏覽器內建的「外送員」，叫他去 3000 埠口拿東西。
    const response = await fetch('http://localhost:3000/')// 向後端發送請求
    // 2. 解析資料: 把外送員拿回來的包裹打開，取出裡面的文字。
    const data = await response.text()// 把得到的內容轉成文字
    // 3. 更新顯示板: 把 message 改成拿到的資料，畫面會同步變更。
    message.value = data // 把資料塞給變數
  }catch(error){
    message.value = '連線失敗，請檢查後端是否有啟動'
  }//end try
}//end const fetchData

// 【生命週期鉤子】
// onMounted 的意思是：「當這張網頁在螢幕上『掛好（渲染完畢）』後，立刻執行的事」。
// 我們希望網頁一打開就自動去拿資料，而不是等使用者按按鈕。
onMounted(() => {
  fetchData()
})//end onMounted

</script>

<template>
  <div style="text-align: center; margin-top: 50px;">
    <h1>我的購物網站</h1>
    <div style="padding: 20px; border: 1px solid #ccc;">
      <h3>後端回傳：</h3>
      <p style="color: blue; font-size: 20px;">{{ message }}</p>
    </div>
  </div>
</template>
