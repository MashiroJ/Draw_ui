import { createApp } from 'vue'
import './assets/main.scss'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import App from './App.vue'
import router from '@/router'
import { createPinia } from 'pinia'
import VueCropper from 'vue-cropper';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const app = createApp(App)
const pinia = createPinia()

// 使用持久化插件  
pinia.use(piniaPluginPersistedstate);

// 将 Pinia 应用到 Vue 实例  
app.use(pinia)

// 使用 ElementPlus 并设置语言  
app.use(ElementPlus, { locale: zhCn });
app.use(router)
app.use(VueCropper);

app.mount('#app')