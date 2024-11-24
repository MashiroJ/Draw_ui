<template>
  <el-container class="layout-container">
    <!-- 左侧菜单 -->
    <el-aside width="200px">
      <div class="el-aside__logo"></div>
      <el-menu
        :active-text-color="isDarkTheme ? '#ffd04b' : '#409EFF'"
        :background-color="isDarkTheme ? 'var(--aside-bg)' : 'var(--bg-color)'"
        :text-color="isDarkTheme ? 'var(--text-color)' : 'var(--text-color)'"
        router
      >
        <el-menu-item v-for="menu in menuList" :key="menu.id" :index="menu.path">
          <el-icon>
            <component :is="getMenuIcon(menu.icon)" />
          </el-icon>
          <span>{{ menu.name }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧主区域 -->
    <el-container>
      <!-- 头部区域 -->
      <el-header>
        <div class="header-left">
          <span>您好：<strong>{{ userInfoStore.userInfo.username }}</strong></span>
        </div>
        <div class="header-right">
          <!-- 主题切换按钮 -->
          <el-button class="theme-toggle" :icon="isDarkTheme ? Sunny : Moon" circle @click="toggleTheme" />
          <el-dropdown placement="bottom-end" @command="handleCommand">
            <span class="el-dropdown__box">
              <el-avatar :src="imgUrl" />
              <el-icon>
                <CaretBottom />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 中间区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>

      <!-- 底部区域 -->
      <el-footer>绘画梦工厂 ©2024 Created by Mashiro</el-footer>
    </el-container>
  </el-container>
</template>

<script setup>
import {
  Management,
  Promotion,
  UserFilled,
  User,
  Crop,
  EditPen,
  SwitchButton,
  CaretBottom,
  Moon,
  Sunny
} from '@element-plus/icons-vue';
import { ref, onMounted, watch } from 'vue';
import avatar from '@/assets/default.png';
import { userLogoutService } from '@/api/login';
import { useTokenStore } from '@/stores/token';
import { useUserInfoStore } from '@/stores/userinfo';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useMenuListService } from '@/api/menu';
import { getUserMenus } from '@/api/user';

// 路由和状态管理
const router = useRouter();
const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();

// 主题状态
const isDarkTheme = ref(false);

// 初始化主题
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  isDarkTheme.value = savedTheme === 'dark';
  document.documentElement.setAttribute('data-theme', isDarkTheme.value ? 'dark' : 'light');
});

// 切换主题
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', isDarkTheme.value ? 'dark' : 'light');
};

// 监听主题变化（可选，确保样式同步）
watch(isDarkTheme, (newVal) => {
  document.documentElement.setAttribute('data-theme', newVal ? 'dark' : 'light');
});

// 头像处理
const imgUrl = ref('');
imgUrl.value = userInfoStore.userInfo.avatarUrl || avatar;

// 菜单图标映射
const iconMap = {
  'HomeFilled': Management,
  'User': User,
  'Promotion': Promotion,
  'Menu': EditPen,
  'Gallery': Management,
  'Text': User,
  'Image': Crop,
  'Error': SwitchButton
};

// 菜单状态
const menuList = ref([]);

// 获取动态菜单
const fetchDynamicMenus = async () => {
  try {
    const allMenusResponse = await useMenuListService();
    const allMenus = allMenusResponse.data || [];
    const userMenusResponse = await getUserMenus(userInfoStore.userInfo.id);
    const allowedMenuIds = userMenusResponse.data.roleMenuIds || [];

    menuList.value = allMenus
      .filter(menu =>
        allowedMenuIds.includes(menu.id) &&
        menu.status === 1 &&
        menu.isVisible === 1
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (error) {
    console.error('获取菜单失败', error);
    ElMessage.error('获取菜单失败，请稍后重试');
  }
};

// 获取菜单对应的图标
const getMenuIcon = (iconName) => {
  return iconMap[iconName] || Management;
};

// 注销处理
const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await userLogoutService();
      tokenStore.removeToken();
      userInfoStore.removeUserInfo();
      router.push('/login');
    } catch (error) {
      ElMessage.error('注销失败，请稍后重试');
    }
  }
};

// 组件挂载时获取菜单
onMounted(fetchDynamicMenus);
</script>

<style lang="scss">
.layout-container {
  display: flex;
  height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);

  .el-aside {
    background-color: var(--aside-bg) !important;
    .el-menu {
      background-color: var(--aside-bg) !important;
      border-right: none;

      .el-menu-item {
        color: var(--text-color);

        &:hover {
          background-color: var(--menu-hover);
        }

        &.is-active {
          background-color: var(--header-bg);
        }
      }
    }

    &__logo {
      height: 120px;
      background: url('@/assets/logo.png') no-repeat center / 120px auto;
    }
  }

  .el-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .el-header {
    background-color: var(--header-bg);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .theme-toggle {
      padding: 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--text-color);

      &:hover {
        background-color: var(--menu-hover);
      }
    }

    .el-dropdown__box {
      display: flex;
      align-items: center;
      cursor: pointer;

      .el-icon {
        color: var(--text-color);
        margin-left: 10px;
      }
    }
  }

  .el-main {
    background-color: var(--bg-color);
    flex-grow: 1;
    padding: 20px;
  }

  .el-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: var(--footer-color);
    border-top: 1px solid var(--border-color);
    padding: 20px 0;
  }
}
</style>
