<script setup>
import { ref, onMounted } from 'vue';
import ProductCard from '../components/ProductCard.vue';

const products = ref([]);
//跟後台很像，但這裡只要「讀取(GET)」就好
const fetchProducts = async() =>{
    try{
        const res = await fetch('http://localhost:3000/api/products')
        products.value = await res.json()
    }catch(err){
        console.error('讀取失敗:', err)
    }
}

onMounted(fetchProducts)
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
            />         
        </div>

        <div v-if="products.length === 0" class="text-center text-gray-400 py-20">
            老闆還沒上架商品，請稍後再來... 
        </div>


    </div>
</template>

