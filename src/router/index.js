import { createRouter, createWebHistory } from 'vue-router';
// 导入组件
import LoginVue from '@/views/Login.vue';
import LayoutVue from '@/views/Layout.vue';
import { useTokenStore } from '@/stores/token';
import { ElNotification } from 'element-plus';

// 定义路由关系
const routes = [
  {
    path: '/login',
    component: LoginVue,
  },
  {
    path: '/',
    component: LayoutVue,
    children: [
      { path: '/', component: () => import('@/views/Home.vue') },
      { path: '/user', component: () => import('@/views/User.vue') },
      { path: '/role', component: () => import('@/views/Role.vue') },
      { path: '/menu', component: () => import('@/views/Menu.vue') },
      { path: '/404', component: () => import('@/views/404.vue') },
      { path: '/Text2Img', component: () => import('@/views/Text2Img.vue') },
      { path: '/Img2Img', component: () => import('@/views/Img2Img.vue') },
      { path: '/Gallery', component: () => import('@/views/Gallery.vue') }
    ]
  }
];

// 创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes: routes
});

// 在路由守卫中
router.beforeEach((to, from, next) => {
  const tokenStore = useTokenStore();
  console.log('路由守卫检查，Token:', tokenStore.token);
  if (to.path !== '/login' && !tokenStore.token) {
    ElNotification.error('请先登录！');
    next('/login');
  } else {
    next();
  }
});


export default router;