<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const cartKey = ref();
const cart = ref([]);

// 1. 讀取購物車資料
onMounted(() => {
    // 檢查：口袋裡有沒有 token？
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    if(!token){
        alert('請先登入會員，才能查看購物車喔！');
        router.push('/login');
        return; // 讓程式停在這裡，不要再往下執行了
    };

    const user = JSON.parse(userString);
    cartKey.value = `my-cart-${user.username}`;

    const savedCart = localStorage.getItem(cartKey.value);
    if(savedCart){
        cart.value = JSON.parse(savedCart);
    };
});

// 自動計算總金額 (Computed)
// 只要 cart 變動，totalPrice 就會自動重算
const totalPrice = computed(() => {
    // reduce 是陣列加總的高級寫法
    // 意思：把每個 item.price 乘上數量加到 sum (累積值) 上面，初始值是 0
    return cart.value.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
});

// 更新商品數量
const updateQuantity = (index, change) =>{
    // change 會是 1 (按加號) 或是 -1 (按減號)
    const newQty = cart.value[index].qty + change;
    // 防呆：數量最少只能是 1，不能變成 0 或負數
    if(newQty < 1){
        // 彈出視窗問他要不要刪除，wantsToDelete 會是 true (確定) 或 false (取消)
        const wantsToDelete = confirm('確定要從購物車移除這個商品嗎？');
        if(wantsToDelete){
            // 如果他按確定：用 splice 把這個商品從陣列中「切掉」
            // splice(從第幾個開始切, 切掉幾個)
            cart.value.splice(index, 1);
            localStorage.setItem(cartKey.value, JSON.stringify(cart.value)); // 存檔更新
        };
        // 如果他按取消，就什麼事都不做，直接結束函式 (數量維持 1)
        return;
    };

    cart.value[index].qty = newQty; // 更新畫面上的數量
    localStorage.setItem(cartKey.value, JSON.stringify(cart.value)); // 存檔更新
};

//移除商品
const removeFromCart = (index) => {
    // splice(位置, 刪除幾個)
    cart.value.splice(index, 1);
    // 同步更新 localStorage
    localStorage.setItem(cartKey.value, JSON.stringify(cart.value));
};

//結帳功能
const checkout = () => {
    if(cart.value.length === 0) return;

    const confirmCheckout = confirm(`總金額是 NT$ ${totalPrice.value}，確定要結帳嗎？`);
    if(confirmCheckout){
        // 清空變數
        cart.value = [];
        // 清空 localStorage
        localStorage.removeItem(cartKey.value);
        alert('感謝您的購買！商品將儘速寄出 🚚');
        router.push('/'); // 回首頁
    };
};
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-10 px-4">
        <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

            <div class="bg-blue-600 text-white p-6 flex justify-between items-center">
                <h2 class="text-2xl font-bold flex items-center gap-2">🛒 我的購物車</h2>
                <span class="bg-blue-500 px-3 py-1 rounded-full text-sm">
                    共 {{ cart.length }} 件商品
                </span>
            </div>

            <div v-if="cart.length === 0" class="p-20 text-center text-gray-400">
                <p class="text-xl">購物車是空的</p>
                <RouterLink to="/" class="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                    去逛逛
                </RouterLink>
            </div>

            <div v-else>
                <div class="p-6 flex flex-col gap-4">
                    <div v-for="(item, index) in cart" :key="index"
                         class="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">

                        <div class="flex items-center gap-4">
                            <img :src="item.image || 'https://placehold.co/100'"
                                  class="w-20 h-20 object-cover rounded-lg bg-gray-100">
                            
                            <div>
                                <h3 class="font-bold text-gray-800">{{ item.name }}</h3>
                                <p class="text-sm text-gray-500">NT$ {{ item.price }}</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                            <button @click="updateQuantity(index, -1)"
                                    class="text-gray-500 hover:text-blue-600 text-lg font-bold px-2 cursor-pointer transition-colors">
                                    -
                            </button>
                            <span class="font-bold text-gray-700 w-6 text-center">{{ item.qty }}</span>
                            <button @click="updateQuantity(index, 1)"
                                    class="text-gray-500 hover:text-blue-600 text-lg font-bold px-2 cursor-pointer transition-colors">
                                    +
                            </button>
                        </div>

                        <button @click="removeFromCart(index)"
                                class="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition"
                                title="移除">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                 <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="bg-gray-50 p-6 flex flex-col md:flex-row items-center justify-between border-t border-gray-200">
                    <div class="text-xl">
                        總金額：<span class="text-3xl font-bold text-orange-600">NT$ {{ totalPrice }}</span>
                    </div>

                    <button @click="checkout"
                            class="w-full md:w-auto mt-4 md:mt-0 bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 shadow-lg active:scale-95 transition-all">
                        前往結帳 💳
                    </button>
                </div>

            </div>

        </div>
    </div>
</template>
