import './assets/main.scss'

import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import locale from 'element-plus/dist/locale/zh-cn.js'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus, {locale})
app.mount('#app')
