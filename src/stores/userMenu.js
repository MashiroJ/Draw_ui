// src/stores/userMenu.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { getUserMenus } from "@/api/user"; // 引入获取用户菜单的 API

export const useUserMenuStore = defineStore('userMenu', () => {
    // 1. 定义用户菜单数据
    const userMenus = ref([]);

    // 2. 定义获取用户菜单的方法
    const fetchUserMenus = async (userId) => {
        try {
            const response = await getUserMenus(userId);
            if (response.code === 200) {
                userMenus.value = response.data; // 存储用户菜单数据
            } else {
                console.error('获取用户菜单失败:', response.message);
            }
        } catch (error) {
            console.error('请求用户菜单失败:', error);
        }
    };

    // 3. 定义清空用户菜单的方法
    const clearUserMenus = () => {
        userMenus.value = [];
    };

    // 4. 暴露出去
    return {
        userMenus,
        fetchUserMenus,
        clearUserMenus,
    };
}, {
    persist: true // 参数持久化
});
