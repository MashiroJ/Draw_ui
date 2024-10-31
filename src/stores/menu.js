// src/stores/menu.js
import { defineStore } from "pinia";
import { ref } from 'vue';

export const useMenuStore = defineStore('menu', () => {
    const menus = ref([]);

    const setMenus = (newMenus) => {
        menus.value = newMenus;
    };

    return {
        menus,
        setMenus
    };
}, {
    persist: true
});
