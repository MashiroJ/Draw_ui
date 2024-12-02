// 导入axios  
import axios from 'axios';
// 定义公共前缀和 baseURL  
const baseURL = '/api';
const instance = axios.create({ baseURL });

// 导入Element Plus 的通知组件  
import { ElNotification } from 'element-plus';
// 导入路由实例  
import router from "@/router";
// 导入Pinia的Token Store  
import { useTokenStore } from '@/stores/token';
//添加请求拦截器
instance.interceptors.request.use(
    (config) => {
        //在发送请求之前做什么
        const tokenStore = useTokenStore()
        //如果token中有值，在携带
        if (tokenStore.token) {
            config.headers.satoken = tokenStore.token
            console.log('携带token：' + config.headers.satoken);

        }
        return config
    },
    (err) => {
        //如果请求错误做什么
        Promise.reject(err)
    }
)


//添加响应拦截器
instance.interceptors.response.use(
    result => {
        if (result.status === 200) {
            return result.data;
        }
        ElNotification.error(result.data.message ? result.data.message : '服务异常')
        return Promise.reject(result.data());

    },
    err => {
        //如果响应状态码是401，代表未登录
        if (err.response.status === 401) {
            // 只有在非登录页面时才显示提示
            if (window.location.pathname !== '/login') {
                ElNotification.error('请先登录！')
            }
            router.push('/login')
        } else {
            ElNotification.error('服务异常');
        }
        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

export default instance;