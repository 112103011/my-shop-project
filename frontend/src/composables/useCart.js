import { useRouter } from "vue-router";

export function useCart() {
    // 必須在這裡呼叫 useRouter，才能控制網頁跳轉
    const router = useRouter();

    // 定義加入購物車的功能
    // 接收兩個參數：product (商品資料), quantity (數量，預設是 1)
    const addToCart = (product, quantity = 1) =>{
        // 1. 檢查登入狀態
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');
        if(!token){
            alert('請先登入會員！');
            router.push('/login');
            return;
        };
        // 解析使用者資料，組裝出他「專屬的購物車鑰匙」
        const user = JSON.parse(userString);
        const cartKey = `my-cart-${user.username}`; // 組合出像是 'my-cart-apple' 這樣的名字

        // 2. 用專屬鑰匙去拿購物車 (如果是空的，就給一個空陣列 '[]')
        let currentCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        // 3. 找有沒有重複的商品
        // 用 id 來比對，找到會回傳那個商品物件，找不到會回傳 undefined
        const existingItem = currentCart.find(item => item.id === product.id);
        if(existingItem){
            // 如果有，就加上指定的數量
            existingItem.qty += quantity;
        }else{
            // 如果沒有，把商品加進去，並幫它貼上一個「數量 (qty)」的標籤
            currentCart.push({
                ...product,
                qty: quantity
            });
        };

        // 存回並給予提示
        localStorage.setItem(cartKey, JSON.stringify(currentCart));
        alert('成功加入購物車！');
    };

    // 最後，把這個工具「交出去」，讓別的檔案可以 import 它
    return{
        addToCart
    };
};
