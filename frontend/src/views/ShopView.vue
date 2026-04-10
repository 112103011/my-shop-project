<script setup>
import { ref, onMounted, computed } from 'vue';
import ProductCard from '../components/ProductCard.vue';
import { useCart } from '../composables/useCart';

const userRole = localStorage.getItem('user_role') || 'user'
const products = ref([]);
const cart = ref([]); //購物車變數：用來裝使用者選購的商品
const {addToCart} = useCart(); 
const searchQuery = ref(''); //搜尋關鍵字變數

//跟後台很像，但這裡只要「讀取(GET)」就好
const fetchProducts = async() =>{
    try{
        const res = await fetch('http://localhost:3000/api/products')
        products.value = await res.json()
    }catch(err){
        console.error('讀取失敗:', err)
    };
};

onMounted(() =>{
    fetchProducts();
});

// 計算符合搜尋條件的商品
const filteredProducts = computed(() => {
    // 如果客人沒有輸入任何字，就回傳全部商品
    if (!searchQuery.value) {
        return products.value;
    }
    
    // 把關鍵字轉成小寫，這樣客人打大寫或小寫 A 都能搜到
    const keyword = searchQuery.value.toLowerCase();
    
    // 用 filter 把符合條件的商品留下來
    return products.value.filter(product => {
        // 檢查商品名稱有沒有包含關鍵字
        const matchName = product.name.toLowerCase().includes(keyword);
        // (選用) 也可以順便檢查敘述裡有沒有包含關鍵字
        const matchDesc = product.description && product.description.toLowerCase().includes(keyword);
        
        return matchName || matchDesc;
    });
});

</script>

<template>
    <div class="p-6 max-w-7xl mx-auto">
        <div class="text-center py-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl mb-10">
            <h1 class="text-4xl font-extrabold text-blue-900 mb-2">✨ 精選好物商店</h1>
            <p class="text-gray-600">挑選你最喜歡的商品，帶回家吧！</p>          
        </div>

        <div class="max-w-2xl mx-auto mb-8 px-6">
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                <input 
                    v-model="searchQuery" 
                    type="text" 
                    placeholder="搜尋商品名稱或關鍵字..." 
                    class="w-full pl-11 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                >
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            <ProductCard 
              v-for="item in filteredProducts"
              :key="item.id"
              :product="item"
              :is-admin="userRole === 'admin'"
              @add-to-cart="addToCart"
            />         
        </div>

        <div v-if="filteredProducts.length === 0" class="text-center py-20">
            <p v-if="searchQuery" class="text-gray-500 text-lg">
                找不到包含「<span class="font-bold text-gray-800">{{ searchQuery }}</span>」的商品 😢
            </p>
        </div>

        <div v-if="products.length === 0" class="text-center text-gray-400 py-20">
            老闆還沒上架商品，請稍後再來... 
        </div>


    </div>
</template>

