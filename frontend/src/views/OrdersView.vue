<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const orders = ref([]); // 用來裝所有歷史訂單的變數

onMounted(() => {
    // 1. 檢查登入
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (!token || !userString) {
        alert('請先登入才能查看訂單喔！');
        router.push('/login');
        return;
    }

    // 2. 去專屬的訂單保險箱拿資料
    const user = JSON.parse(userString);
    const ordersKey = `my-orders-${user.username}`;
    const savedOrders = localStorage.getItem(ordersKey);

    if (savedOrders) {
        orders.value = JSON.parse(savedOrders); // 把拿到的訂單放進變數裡
    }
});
</script>

<template>
    <div class="max-w-4xl mx-auto p-6 min-h-screen">
        <h1 class="text-3xl font-extrabold text-gray-800 mb-8 pb-4 border-b">📦 歷史訂單</h1>

        <div v-if="orders.length === 0" class="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
            <p class="text-gray-500 mb-6 text-lg">您目前還沒有任何訂單紀錄喔！</p>
            <RouterLink to="/" class="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md">
                去逛逛
            </RouterLink>
        </div>

        <div v-else class="space-y-8">
            <div v-for="order in orders" :key="order.id" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-4 mb-4 gap-2">
                    <div>
                        <span class="text-sm text-gray-500">訂單編號：</span>
                        <span class="font-black text-gray-800">{{ order.id }}</span>
                    </div>
                    <div class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full w-fit">
                        成立時間：{{ order.date }}
                    </div>
                </div>

                <div class="space-y-3 mb-6">
                    <div v-for="item in order.items" :key="item.id" class="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <img :src="item.image || 'https://placehold.co/100'" class="w-14 h-14 object-cover rounded-lg shadow-sm">
                        <div class="flex-1">
                            <h4 class="text-sm font-bold text-gray-800">{{ item.name }}</h4>
                            <p class="text-xs text-gray-500 mt-1">NT$ {{ item.price }} x {{ item.qty }}</p>
                        </div>
                        <div class="font-bold text-gray-800 text-sm">
                            NT$ {{ item.price * item.qty }}
                        </div>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-50/50 p-4 rounded-xl">
                    <div class="text-sm text-gray-600 mb-3 sm:mb-0">
                        <p class="font-bold text-gray-800 mb-1">👤 收件資訊</p>
                        <p>{{ order.info.name }} ({{ order.info.phone }})</p>
                        <p>{{ order.info.address }}</p>
                    </div>
                    <div class="text-right w-full sm:w-auto">
                        <span class="text-gray-500 font-medium mr-2">訂單總金額</span>
                        <span class="font-black text-blue-600 text-2xl">NT$ {{ order.total }}</span>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>