<script setup>
import {ref} from 'vue'

// 定義發送訊號的工具
const emit = defineEmits(['submit-product'])

// 1. 變數直接在這裡定義，App.vue 不需要知道這兩個暫存變數
const localName = ref('')
const localPrice = ref('')
// 2. 處理點擊事件
const handleSubmit = () => {
    // 防呆：如果沒填東西就不送出
    if(!localName.value || !localPrice.value) return alert('請填寫完整資訊！')

    // 發送訊號給爸爸 (App.vue)，把資料包成一個物件傳出去
    emit('submit-product',{
        name: localName.value,
        price: localPrice.value
    })

    // 清空表單
    localName.value = ''
    localPrice.value = ''
}
</script>

<template>
    <div class="bg-white rounded-xl shadow-sm p-6 mb-8 border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">上架新商品</h2>

        <div class="flex flex-cols sm:flex-row gap-4">
            <div class="flex-1">
                <input v-model="localName"
                       type="text"
                       placeholder="請輸入商品名稱"
                       class="w-full border-gray-300 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm">
            </div>

            <div class="w-full sm:w-48">
                <input v-model="localPrice"
                       type="number"
                       placeholder="請輸入商品價格"
                       class="w-full border-gray-300 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm">
            </div>

            <div class="flex flex-col sm:flex-row gap-4">
                <button @click="handleSubmit"
                        class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow-md transition-colors active:scale-95 whitespace-nowrap">
                        確認上架
                </button>
            </div>

        </div>

    </div>
</template>
