<!-- src/components/Layout.vue -->
<template>
  <el-container class="layout-container">
    <!-- 左侧菜单 -->
    <el-aside width="200px">
      <div class="el-aside__logo"></div>
      <el-menu
        :active-text-color="activeTextColor"
        :background-color="asideBgColor"
        :text-color="textColor"
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
          <el-button class="theme-toggle" :icon="currentThemeIcon" circle @click="toggleTheme" />
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
import { ref, onMounted, computed } from 'vue';
import avatar from '@/assets/default.png';
import { userLogoutService } from '@/api/login';
import { useTokenStore } from '@/stores/token';
import { useUserInfoStore } from '@/stores/userinfo';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useMenuListService } from '@/api/menu';
import { getUserMenus } from '@/api/user';
import { useThemeStore } from '@/stores/theme';

// 路由和状态管理
const router = useRouter();
const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();

// 主题存储
const themeStore = useThemeStore();

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

// 主题切换逻辑
const toggleTheme = () => {
  themeStore.toggleTheme();
};

// 根据当前主题动态设置图标
const currentThemeIcon = computed(() => {
  return themeStore.isDark ? Sunny : Moon;
});

// 根据当前主题获取激活文本颜色
const activeTextColor = computed(() => {
  return 'var(--active-text-color)';
});

// 获取其他CSS变量的值
const asideBgColor = computed(() => {
  return 'var(--aside-bg)';
});

const textColor = computed(() => {
  return 'var(--text-color)';
});
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
