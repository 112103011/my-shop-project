<script setup>
import { ref, onMounted } from 'vue';
import ProductCard from '../components/ProductCard.vue';

const products = ref([]);
const cart = ref([]); //購物車變數：用來裝使用者選購的商品

//跟後台很像，但這裡只要「讀取(GET)」就好
const fetchProducts = async() =>{
    try{
        const res = await fetch('http://localhost:3000/api/products')
        products.value = await res.json()
    }catch(err){
        console.error('讀取失敗:', err)
    };
};

const handleAddToCart = (product) => {
    // product 就是子元件傳過來的那個商品物件 {id: 1, name: '...', price: 100}
    
    //先檢查有沒有登入
    const token = localStorage.getItem('token');
    if(!token){
        alert('請先登入會員！');
        return;
    };

    // A. 把商品推入購物車陣列
    cart.value.push(product);
    // B. 存入 localStorage (瀏覽器的口袋)
    // 因為 localStorage 只能存「字串」，所以要用 JSON.stringify 把陣列變字串
    localStorage.setItem('my-cart', JSON.stringify(cart.value));
    // C. 給使用者一點回饋
    alert('已加入購物車！');
    console.log('目前的購物車:', cart.value);
};

onMounted(() =>{
    fetchProducts();
    // D. 每次進來這個頁面，先檢查口袋裡有沒有上次沒結帳的東西
    const savedCart = localStorage.getItem('my-cart');
    if(savedCart){
        // 如果有，把它變回陣列 (JSON.parse) 放回變數中
        cart.value = JSON.parse(savedCart);
    };
});


</script>

<template>
    <div class="p-6 max-w-7xl mx-auto">
        <div class="text-center py-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl mb-10">
            <h1 class="text-4xl font-extrabold text-blue-900 mb-2">✨ 精選好物商店</h1>
            <p class="text-gray-600">挑選你最喜歡的商品，帶回家吧！</p>          
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            <ProductCard 
              v-for="item in products"
              :key="item.id"
              :product="item"
              @add-to-cart="handleAddToCart"
            />         
        </div>

        <div v-if="products.length === 0" class="text-center text-gray-400 py-20">
            老闆還沒上架商品，請稍後再來... 
        </div>


    </div>
</template>

