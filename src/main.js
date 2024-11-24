// main.js
import { createApp } from 'vue';
import './assets/main.scss'; // 全局样式
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'; // Element Plus 组件样式
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import App from './App.vue';
import router from '@/router';
import { createPinia } from 'pinia';
import VueCropper from 'vue-cropper';
import 'element-plus/theme-chalk/dark/css-vars.css'; // Element Plus 暗色主题变量
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const app = createApp(App);
const pinia = createPinia();

// 使用持久化插件  
pinia.use(piniaPluginPersistedstate);

// 将 Pinia 应用到 Vue 实例  
app.use(pinia);

// 使用 ElementPlus 并设置语言  
app.use(ElementPlus, { locale: zhCn });
app.use(router);
app.use(VueCropper);

app.mount('#app');
