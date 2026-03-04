<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const cart = ref([]);
const cartKey = ref('');

// 顧客填寫的表單資料
const form = ref({
    name: '',
    phone: '',
    address: '',
    payment: 'cash' 
});

// 1. 讀取專屬購物車資料
onMounted(() => {
    // 檢查登入
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    if(!token || !userString){
        alert('請先登入會員！');
        router.push('/login');
        return;
    };

    const user = JSON.parse(userString);
    cartKey.value = `my-cart-${user.username}`;

    const savedCart = localStorage.getItem(cartKey.value);
    if(savedCart){
        cart.value = JSON.parse(savedCart);
    };

    if(cart.value.length === 0){
        alert('購物車是空的哦！');
        router.push('/');
    };
});

// 2. 計算總金額
const totalAmount = computed(() => {
    return cart.value.reduce((total, item) => total + (item.price * item.qty), 0);
});

// 3. 送出訂單
const  submitOrder = () => {
    // 簡單防呆：檢查必填欄位
    if(!form.value.name || !form.value.phone || !form.value.address){
        alert('請填寫完整的收件資訊！');
        return;
    };

    alert('結帳成功！感謝您的購買！');
    // 清空購物車
    localStorage.removeItem(cartKey.value);
    // 回首頁
    router.push('/');
};
</script>

<template>
    <div class="max-w-6xl mx-auto p-6 min-h-screen">
        <h1 class="text-3xl font-extrabold text-gray-800 mb-8 pb-4 border-b">結帳</h1>

        <div class="flex flex-col lg:flex-row gap-8">

            <div class="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 class="text-xl font-bold text-gray-800 mb-6">📍 收件人資訊</h2> 
                <form @submit.prevent="submitOrder" class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                        <input v-model="form.name" type="text" required placeholder="例如：王小明"
                               class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">聯絡電話</label>
                        <input v-model="form.phone" type="text" required placeholder="例如：0912345678"
                               class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">寄送地址</label>
                        <input v-model="form.address" type="text" required placeholder="請填寫完整地址"
                               class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                    </div>
                    <h2 class="text-xl font-bold text-gray-800 mb-4 mt-8 pt-6 border-t">💳 付款方式</h2>
                    <div class="space-y-3">
                        <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                               :class="{'border-blue-500 bg-blue-50': form.payment === 'cod'}">
                            <input type="radio" v-model="form.payment" value="cash" class="w-4 h-4 text-blue-600">
                            <span class="ml-3 font-medium text-gray-700">貨到付款</span>
                        </label>
                    </div>
                </form>
            </div>

            <div class="w-full lg:w-1/3">
                <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200 sticky top-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4">🛒 訂單摘要</h2>
                    <div class="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                        <div v-for="item in cart" :key="item.id" class="flex items-center gap-4">
                            <img :src="item.image || 'https://placehold.co/100'" class="w-16 h-16 object-cover rounded-md">
                            <div class="flex-1">
                                <h3 class="text-sm font-bold text-gray-800 line-clamp-1">{{ item.name }}</h3>
                                <p class="text-xs text-gray-500">NT$ {{ item.price }} x {{ item.qty }}</p>
                            </div>
                            <p class="text-sm font-bold text-gray-800">NT$ {{ item.price * item.qty }}</p>
                        </div>

                        <div class="flex justify-between text-gray-600">
                            <span>商品小計</span>
                            <span>NT$ {{ totalAmount }}</span>
                        </div>
                        <div class="flex justify-between text-gray-600">
                            <span>運費</span>
                            <span class="text-green-600 font-medium">免運費</span>
                        </div>
                        <div class="flex justify-between text-xl font-black text-blue-600 mt-4 pt-4 border-t border-gray-200">
                            <span>總金額</span>
                            <span>NT$ {{ totalAmount }}</span>
                        </div>
                    </div>

                    <button @click="submitOrder" 
                            class="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200">
                        確認結帳，送出訂單
                    </button>
                </div>

            </div>

        </div>
    </div>
</template>

