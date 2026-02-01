<script setup>
import { ref } from 'vue'

// 1. 定義「插槽」：接收從外面傳進來的商品資料
const props = defineProps({
    product: Object, // 規定傳進來的必須是一個物件
    // 接收一個 isAdmin，預設是 false (客人模式)
    isAdmin:{
        type: Boolean,
        default: false
    }
})
// 2. 定義「訊號」：告訴父元件我要觸發什麼事件：刪除、修改
const emit = defineEmits(['click-delete', 'submit-edit'])

// --- 編輯模式的邏輯 ---
const isEditing = ref(false) // 狀態開關：預設是「關」(顯示模式)
const editName = ref('') // 暫存修改的名字
const editPrice = ref('') // 暫存修改的價格
const editDescription = ref('') // 暫存修改的敘述

// 進入編輯模式
const startEdit = () =>{
    // 把原本的資料，複製一份到暫存區
    editName.value = props.product.name
    editPrice.value = props.product.price
    editDescription.value = props.product.description || ''
    // 打開開關，畫面會變身
    isEditing.value = true
}

// 取消編輯
const cancelEdit = () =>{
    isEditing.value = false // 關掉開關，變回原本樣子
}

// 儲存編輯
const saveEdit = () =>{
    // 發送訊號給 (App.vue)，把 ID 和新的資料傳出去
    emit('submit-edit',{
        id: props.product.id,
        name: editName.value,
        price: editPrice.value,
        description: editDescription.value
    })
    isEditing.value = false // 關掉開關
}

// 當刪除按鈕被按下，發送訊號並附帶 ID
const handleDelete = () => {
    emit('click-delete', props.product.id)
}
</script>

<template>
    
    <div class= "bg-white rounded-x1 shadow-md overflow-hidden hover:shadow-x1 transition-shadow duration-300">
        

        <div class="h-35 overflow-hidden relative">

            <img :src= "product.image" alt= "picture" class="w-full h-48 object-cover">

            <button v-if="isAdmin && !isEditing" @click="startEdit"
                    class="absolute top-2 right-2 z-10 bg-white/90 p-2 rounded-full shadow-md hover:bg-blue-500 hover:text-white transition-colors cursor-pointer text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
            </button>
        </div>
        
        <div class= "p-3 flex flex-col flex-1">

            <div v-if="isEditing" class="flex flex-col gap-3">
                <p class="text-xs text-gray-500 mt-1 line-clamp-2 h-4 leading-4">名稱</p>
                <input v-model="editName" class="border rounded p-1 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none">
                <p class="text-xs text-gray-500 mt-1 line-clamp-2 h-4 leading-4">價格</p>
                <input v-model="editPrice" type="number" class="border rounded p-1 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none">
                <p class="text-xs text-gray-500 mt-1 line-clamp-2 h-4 leading-4">敘述</p>
                <textarea v-model="editDescription" 
                          rows="3"
                          class="border rounded p-1 text-sm w-full rows-3 focus:ring-2 focus:ring-blue-500 outline-none">
                </textarea>

                <div>
                    <button @click="saveEdit" class="flex-1 bg-green-500 text-white py-1 rounded hover:bg-green-600 text-sm p-2 m-2">確認</button>
                    <button @click="cancelEdit" class="flex-1 bg-gray-300 text-gray-700 py-1 rounded hover:bg-gray-400 text-sm p-2 m-2">取消</button>
                </div>

            </div>

            <div v-else class="flex flex-col h-full">
                <h3 class="text-lg font-bold text-gray-800 mb-2 truncate">{{product.name}}</h3>
                <p class="text-xs text-gray-500 mt-1 line-clamp-4 h-14 leading-4 whitespace-pre-wrap break-words">{{ product.description || '暫無敘述...' }}</p>
                <p class="mt-auto p-2 border-t text-orange-500 font-bold text-xl">NT$ {{product.price}}</p>
                <button v-if="isAdmin" @click="handleDelete(product.id)" 
                        class="mt-auto w-full bg-red-50 text-red-500 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                        🗑️ 撤下
                </button>
            </div>
                     
        </div>
    </div>
    
</template>