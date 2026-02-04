<script setup>
import {ref, onMounted} from 'vue';
// useRoute: 用來"讀取"現在網址的資訊 (例如 id 是多少)
// useRouter: 用來"控制"跳轉 (例如跳回首頁)
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const product = ref(null); // 用來放商品資料
const loading = ref(true); // 載入狀態 (還沒抓到資料前顯示 Loading)

onMounted(async () => {
    // 1. 從網址取得 ID
    // 如果網址是 /product/5，這裡的 route.params.id 就會是 5
    const productId = route.params.id;

    try{
        // 2. 向後端要資料
        const res = await fetch(`http://localhost:3000/api/products/${productId}`);
        // 如果後端回傳 404 (找不到)，這行會變成 false
        if(!res.ok) throw new Error('找不到該商品');

        product.value = await res.json();
    }catch(err){
        alert('商品不存在或讀取失敗！');
        router.push('/'); // 失敗就踢回首頁
    }finally{
        loading.value = false; // 不管成功失敗，都要把 loading 關掉
    }
});
</script>

<template>
    <div class="max-w-4xl mx-auto p-6">

        <div v-if="loading" class="text-center text-gray-500 py-20 text-xl">
            努力載入中... ⏳
        </div>

        <div v-else-if="product" class="flex flex-col md:flex-row gap-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">

            <div class="w-full md:w-1/2 h-80 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                <img :src="product.image" :alt="product.name" class="w-full h-full object-cover">
            </div>

            <div class="w-full md:w-1/2 flex flex-col">
                <h1 class="text-3xl font-bold text-gray-800 mb-4">{{ product.name }}</h1>
                <p class="text-gray-600 whitespace-pre-wrap leading-relaxed mb-6 flex-grow">{{ product.description || '暫無詳細介紹...' }}</p>

                <div class="mt-auto">
                    <p class="text-xl font-bold text-orange-600 whitespace-pre-wrap leading-relaxed mb-6 flex-grow">NT$ {{ product.price }}</p>

                    <div class="flex gap-4">
                        <button class="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-transform active:scale-95">
                            立即購買
                        </button>
                        <button @click="router.push('/')" class="px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                            回上一頁
                        </button>
                    </div>

                </div>

            </div>
        </div>

    </div>
</template>

