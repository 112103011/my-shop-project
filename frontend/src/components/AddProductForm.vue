<script setup>
import {ref} from 'vue';

// 定義發送訊號的工具
const emit = defineEmits(['submit-product']);

// 變數直接在這裡定義，App.vue 不需要知道這個暫存變數
const localName = ref('');
const localPrice = ref('');
const localDescription = ref('');
const localImage = ref('');
const fileInput = ref(null);

//處理圖片上傳的函式
const handleFileUpload = async (event) =>{
    // 1. 抓取使用者選的檔案
    const file = event.target.files[0];
    if(!file) return;
    // 2. 準備信封
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    
    try{
        // 3. 寄給後端
        const res = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}` 
            },
            body: formData
        });
        const data = await res.json();

        if(res.ok){
            // 4. 成功！把回傳的網址存入變數
            localImage.value = data.url;
            alert('圖片上傳成功！'); 
        }else{
            alert('上傳失敗：' + data.message);
        };
    } catch(err){
        console.error(err);
        alert('上傳錯誤');
    };
};

// 處理點擊事件
const handleSubmit = () => {
    // 防呆：如果沒填東西就不送出
    if(!localName.value || !localPrice.value) return alert('請填寫完整資訊！');

    // 發送訊號給爸爸 (App.vue)，把資料包成一個物件傳出去
    emit('submit-product',{
        name: localName.value,
        price: localPrice.value,
        description: localDescription.value,
        image: localImage.value
    });

    // 清空表單
    localName.value = '';
    localPrice.value = '';
    localDescription.value ='';
    localImage.value = '';
    if(fileInput.value){
        fileInput.value.value = '';
    };
};
</script>

<template>
    <div class="bg-white rounded-xl shadow-sm p-6 mb-8 border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">上架新商品</h2>

        <div class="flex flex-cols sm:flex-row gap-4">
            <div class="flex-1">
                <input v-model="localName"
                       type="text"
                       placeholder="請輸入商品名稱"
                       class="w-full border-gray-300 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                >
            </div>

            <div class="w-full sm:w-48">
                <input v-model="localPrice"
                       type="number"
                       placeholder="請輸入商品價格"
                       class="w-full border-gray-300 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm">
            </div>

            <div class="flex-1">
                <textarea v-model="localDescription" 
                          placeholder="請輸入商品敘述" 
                          rows="2"
                          class="w-full border-gray-300 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none">
                </textarea>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 items-start">

                <div class="flex-1 w-full">
                    <input type="file"
                       ref="fileInput"
                       class="w-full border-gray-300 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm bg-gray-50 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                       accept="image/*"
                       @change="handleFileUpload"
                >
                </div>
                
                <div v-if="localImage" class="w-24 h-24 border rounded-lg overflow-hidden flex-shrink-0">
                    <p>預覽：</p>
                    <img :src="localImage" class="w-full h-full object-cover" alt="預覽圖">
                </div>

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
