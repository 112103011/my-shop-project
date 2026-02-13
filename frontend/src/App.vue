<script setup>
import { RouterView } from 'vue-router';
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
// 控制是否顯示登出按鈕
const isLoggedIn = ref(false);

//監聽路由變化：每次換頁時，都檢查一次口袋裡有沒有 Token
watch(route, () =>{
  const token = localStorage.getItem('token');
  // !!token 是一種縮寫，把 token 轉成布林值 (有值變 true，沒值變 false)
  isLoggedIn.value = !!token;
});

//登出功能
const handleLogout = () =>{
  // 1. 清除口袋裡的通行證
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // 2. 更新狀態
  isLoggedIn.value = false;
  // 3. 踢回首頁
  alert('已登出');
  router.push('/');
}
</script>


<template>
  <nav class="bg-gray-800 text-white sticky top-0 z-50 shadow-md">
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
      <div class="flex items-center gap-8">
        <h1 class="text-xl font-bold tracking-wider">My Shop 🛍️</h1>

        <div class="hidden md:flex gap-6">
          <RouterLink to="/" class="hover:text-blue-300 transition-colors font-medium">首頁</RouterLink>
          <RouterLink to="/admin" class="hover:text-blue-300 transition-colors font-medium">後台管理</RouterLink>
        </div>

      </div>

      <div>
        <button v-if="isLoggedIn" @click="handleLogout" 
                class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md">
                登出
        </button>

        <RouterLink v-else to="/login" 
                    class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md">
                    登入 / 註冊
        </RouterLink>
      </div>

    </div>  
</nav>

  <RouterView></RouterView>

  <footer class="bg-gray-800 text-white p-16 flex "> test</footer>

</template>

