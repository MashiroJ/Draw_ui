import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserInfoStore = defineStore('userinfo', () => {
    // 1. 定义用户信息
    const userInfo = ref({});

    // 2. 定义设置用户信息的方法
    const setUserInfo = (info) => {
        userInfo.value = info;
    };

    // 3. 定义移除用户信息的方法
    const removeUserInfo = () => {
        userInfo.value = {};
    };

    // 4. 暴露状态和方法
    return {
        userInfo,
        setUserInfo,
        removeUserInfo,
    };
}, {
    // 持久化参数
    persist: true,
});
