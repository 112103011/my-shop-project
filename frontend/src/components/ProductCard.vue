<script setup>
// 1. 定義「插槽」：接收從外面傳進來的商品資料
const props = defineProps({
    product: Object // 規定傳進來的必須是一個物件
})
// 2. 定義「訊號」：告訴父元件我要觸發什麼事件
const emit = defineEmits(['click-delete'])
// 當按鈕被按下，發送訊號並附帶 ID
const handleDelete = () => {
    emit('click-delete', props.product.id)
}
</script>

<template>
    
    <div class= "bg-white rounded-x1 shadow-md overflow-hidden hover:shadow-x1 transition-shadow duration-300">
        <img :src= "product.image" alt= "picture" class="w-full h-48 object-cover">
        <div class= "p-4">
          <h3 class="text-lg font-bold text-gray-800 mb-2 truncate">{{product.name}}</h3>
          <p class="text-orange-500 font-bold text-x1">NT$ {{product.price}}</p>
          <button @click="handleDelete(product.id)" 
                  class="mt-4 w-full bg-red-50 text-red-500 py-2 rounded-lg hover:be-red-500 hover:text-white transition-colors">🗑️ 撤下</button>
        </div>
    </div>
    
</template>
