import { createRouter, createWebHistory } from 'vue-router';
import LoginVue from '@/views/Login.vue';
import LayoutVue from '@/views/Layout.vue';
import { useTokenStore } from '@/stores/token';
import { ElNotification } from 'element-plus';

const routes = [
  {
    path: '/login',
    component: LoginVue,
  },
  {
    path: '/404',
    component: () => import('@/views/404.vue')
  },
  {
    path: '/',
    component: LayoutVue,
    children: [
      { path: '/', component: () => import('@/views/Home.vue') },
      { path: '/user', component: () => import('@/views/User.vue') },
      { path: '/role', component: () => import('@/views/Role.vue') },
      { path: '/menu', component: () => import('@/views/Menu.vue') },
      { path: '/Text2Img', component: () => import('@/views/Text2Img.vue') },
      { path: '/Img2Img', component: () => import('@/views/Img2Img.vue') },
      { path: '/SuperText2Img', component: () => import('@/views/SuperText2Img.vue') },
      { path: '/SuperImg2Img', component: () => import('@/views/SuperImg2Img.vue') },
      { path: '/Gallery', component: () => import('@/views/Gallery.vue') }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes
});

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