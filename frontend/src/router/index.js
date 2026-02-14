// 1. 從 vue-router 套件中引入兩個核心功能：
//    createRouter: 用來建立路由器實體
//    createWebHistory: 用來管理網址歷史紀錄 (讓你按上一頁能回到上一頁)
import{createRouter, createWebHistory} from 'vue-router';
// 2. 引入剛剛蓋好的兩個房間 (組件)
//    注意路徑：../ 代表上一層資料夾
import ShopView from '../views/ShopView.vue';
import AdminView from '../views/AdminView.vue';
import ProductDetail from '../views/ProductDetail.vue';
import LoginView from '../views/LoginView.vue';
import CartView from '../views/CartView.vue';

// 3. 開始建立路由器
const router = createRouter({
    // 設定歷史模式：使用 WebHistory 模式 (網址看起來會很乾淨，像 http://localhost/admin)
    history: createWebHistory(),

    // 4. 定義路線表 (Routes)
    //    這是一個陣列，每一項代表一條規則
    routes:[
        {
            path:'/',            // 當網址是根目錄 (http://localhost:5173/)
            name:'home',         // 給這條路線取個名字叫 home (方便以後程式呼叫)
            component: ShopView  // 就顯示 ShopView 這個組件
        },
        {
            path:'/admin',
            name:'admin',
            component: AdminView,
            meta: {requiresAuth: true} // 貼上標籤：此頁面需要驗證
        },
        {
            path:'/product/:id',
            name:'product-detail',
            component: ProductDetail
        },
        {
            path:'/login',
            name: 'login',
            component: LoginView
        },
        {
            path:'/cart',
            name:'cart',
            component:CartView
        },
    ]

});

// 全域路由守衛：每次換頁前，都會經過這裡
router.beforeEach((to, from, next) => {
    // 1. 檢查要去的地方，需不需要權限 (看有沒有 requiresAuth 標籤)
    if(to.meta.requiresAuth){
        // 2. 如果需要權限，檢查口袋有沒有 token
        const token = localStorage.getItem('token');

        if(token){
            // 3. 有 token，放行！
            next();
        }else{
            // 4. 沒 token，踢去登入頁
            alert('請先登入！');
            next('/login');
        };
    }else{
        // 5. 如果要去的地方不用權限 (像首頁)，直接放行
        next();
    };
});

// 5. 匯出這個設定好的 router，讓 main.js 可以使用
export default router
