<script setup>
import { ref, onMounted } from 'vue';
import ProductCard from '../components/ProductCard.vue';
import AddProductForm from '../components/AddProductForm.vue';

// 1. 宣告一個反應式變數 (ref)，初始值是一個「空陣列 []」
// 為什麼要用 ref？因為當資料從後端抓回來後，Vue 會偵測到 products 變了，自動幫你重繪網頁
const products = ref([]);

//抓取商品函式
const getProducts = async () =>{
  try{
    // 2. 使用 fetch 去抓新的網址 /api/products
    // 技巧：在網址後面加上 "?t=" 和現在的時間
    // 這樣每次網址都不一樣，瀏覽器就不會偷懶讀舊資料了
    const response = await fetch('http://localhost:3000/api/products?t={new Date().getTime()}')

    // 3. 把回應轉成 JSON 格式的 JavaScript 陣列
    const data = await response.json()

    // 4. 把資料塞進我們的變數裡
    products.value = data

  }catch(error){
    console.error('抓取商品失敗：', error)
  }
};//end const getproducts

//發送商品函式，會接收一個 "productData" 參數
const addProduct = async(productData) =>{
  // productData 就是子元件傳來的 { name: '...', price: ... }

  if(!confirm('確定上架？')) return; // 彈出視窗確認

  // 使用 fetch 發送 POST 請求
  const response = await fetch('http://localhost:3000/api/products', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    // 將變數轉成 JSON 字串寄出去
    body:JSON.stringify(productData) // 直接把整包資料送給後端
  });

  if(response.ok){
    //稍微等一下，確保資料庫存好了
    setTimeout(() =>{
      alert('上架成功');
      getProducts();// 重新抓取資料庫，讓畫面出現新商品
    }, 100) 
  };
};//end const addProduct

//刪除商品函式
const deleteProduct = async(id) => {

  if(!confirm('確定要刪除這個商品嗎？')) return; // 彈出視窗確認，防止誤刪
  
  //Fetch 請求：使用「反引號」組合網址
  const response = await fetch(`http://localhost:3000/api/products/${id}`, {
    method: 'Delete'
  });

  if(response.ok){
    alert('刪除成功');
    // 刪除成功後，重新抓取清單更新畫面
    getProducts();
  };
};//end const deleteProduct

//修改商品函式
const updateProduct = async(product) => {
  try{
    if(!confirm('確定修改？')) return; // 彈出視窗確認，防止誤刪

    // product 是子元件傳上來的物件: { id: 1, name: '新名字', price: 100 }
    const response = await fetch(`http://localhost:3000/api/products/${product.id}`,{
      method: 'PUT', // 告訴後端：我要修改！
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: product.name,
        price: product.price,
        description: product.description,
      })
    });

    if(response.ok) {
      // 修改成功後，稍微等一下再重抓，確保資料庫更新完畢
      setTimeout(() => {
        alert('更新成功');
        getProducts();
      }, 100);
    };

  }catch(error){
    console.error("更新失敗:", error)
  }
};//end const updateProduct


// 5. 網頁一載入就跑 getProducts
onMounted(getProducts)

</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans p-8">

    <header class="bg-white shadow-sm z-10 border-b border-gary-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex item-center justify-between">
        <h1 class="text-lg font-semibold flex items-center gap-2 text-gray-800">商品管理</h1>
      </div>

    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <AddProductForm @submit-product="addProduct" />

      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        <ProductCard 
          v-for="item in products"
          :key="item.id"
          :product="item"
          :is-admin="true"
          @click-delete="deleteProduct"
          @submit-edit="updateProduct"
        />
      </div>

      <div v-if="products.length === 0" class="text-center text-gray-400 py-20">
            沒有上架商品 
      </div>
    

    </main>
    
  </div>  

</template>

/**
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
**/