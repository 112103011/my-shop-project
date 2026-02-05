<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoginMode = ref(true); //控制模式：true 代表現在是「登入模式」，false 代表「註冊模式」
const username = ref(''); //表單資料：綁定輸入框
const password = ref(''); 

//送出表單
const handleSubmit = async() =>{
    // 決定要打哪一支 API
    let url = isLoginMode.value;
    if(isLoginMode.value === true){ 
        url = 'http://localhost:3000/api/login';
    }else{
        url = 'http://localhost:3000/api/register';
    };

    try{
        const res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: username.value,
                password: password.value
            })
        });

        const data = await res.json();
        if(!res.ok){
            throw new Error(data.error || '操作失敗');
        };

        // 成功後的處理
        if(isLoginMode.value){ //登入成功
            alert('登入成功！');
            // 關鍵：把通行證 (token) 存到瀏覽器的口袋 (localStorage)
            // 這樣重新整理網頁，登入狀態才不會不見
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            //跳轉回後台
            router.push('/admin');
        }else{ // 註冊成功
            alert('註冊成功！請重新登入');
            // 切換回登入模式，讓使用者登入
            isLoginMode.value = true;
        };
    }catch(err){
        alert(err.message)
    };
};

</script>

<template>
    <div class="flex justify-center items-center min-h-[80vh]">
        <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
            <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">{{ isLoginMode ?'歡迎回來 👋' :'立即註冊'}}</h1>

            <form @submit.prevent="handleSubmit" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">帳號</label>
                    <input
                      v-model="username"
                      type="text"
                      required
                      class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="請輸入帳號"
                    >
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">密碼</label>
                    <input
                      v-model="password"
                      type="password"
                      required
                      class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="請輸入密碼"
                    >
                </div>

                <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                    {{ isLoginMode ?'登入' :'註冊' }}
                </button>
            </form>

            <div class="mt-6 text-center text-sm text-gray-500">
                {{ isLoginMode ?'還沒有帳號嗎？' :'已經有帳號了？' }}
                <button
                  @click="isLoginMode = !isLoginMode"
                  class="text-blue-600 font-bold hover:underline ml-1"
                >
                    {{ isLoginMode ?'去註冊' :'去登入' }}
                </button>
            </div>

        </div>

    </div>
</template>
