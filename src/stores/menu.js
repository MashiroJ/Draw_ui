// src/stores/menu.js
import { defineStore } from "pinia";
import { ref } from 'vue';

export const useMenuStore = defineStore('menu', () => {
    //1.定义菜单状态
    const menus = ref([]);
    //2.定义设置菜单的方法
    const setMenus = (newMenus) => {
        menus.value = newMenus;
    };

    //3.定义移除菜单的方法
    const removeMenus = () => {
        menus.value = [];
    };

    return {
        menus,
        setMenus,
        removeMenus
    };
}, {
    persist: true
});
