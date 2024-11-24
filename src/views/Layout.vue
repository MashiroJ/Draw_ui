<template>
  <el-container class="layout-container">
    <!-- 左侧菜单 -->
    <el-aside :width="isCollapsed ? '64px' : '200px'">
      <div class="aside-header">
        <el-button class="collapse-btn" :icon="isCollapsed ? Expand : Fold" @click="toggleAside" />
      </div>
      <div class="divider"></div>
      <el-menu :active-text-color="activeTextColor" :background-color="asideBgColor" :text-color="textColor" router
        :collapse="isCollapsed" :collapse-transition="false">
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
          <span class="greeting">再渺小的星光，也有属于他的光芒</span>
        </div>
        <div class="header-center">
          <div class="logo"></div>
        </div>
        <div class="header-right">
          <div class="theme-switch" @click="toggleTheme">
            <div class="switch-track" :class="{ 'is-dark': themeStore.isDark }">
              <div class="switch-handle">
                <el-icon class="light-icon" :class="{ 'active': !themeStore.isDark }">
                  <Sunny />
                </el-icon>
                <el-icon class="dark-icon" :class="{ 'active': themeStore.isDark }">
                  <Moon />
                </el-icon>
              </div>
            </div>
          </div>
          <div class="username">
            {{ userInfoStore.userInfo.username }}
          </div>
          <el-dropdown placement="bottom-end" @command="handleCommand">
            <span class="el-dropdown__box">
              <el-avatar :src="imgUrl" />
              <el-icon>
                <CaretBottom />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout" :icon="SwitchButton">
                  退出登录
                </el-dropdown-item>
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
  Sunny,
  Fold,
  Expand
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
const isCollapsed = ref(false);

// 切换菜单收缩状态
const toggleAside = () => {
  isCollapsed.value = !isCollapsed.value;
};

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

// 计算属性
const activeTextColor = computed(() => 'var(--active-text-color)');
const asideBgColor = computed(() => 'var(--aside-bg)');
const textColor = computed(() => 'var(--text-color)');
</script>

<style lang="scss">
.layout-container {
  display: flex;
  height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);

  .el-aside {
    position: relative;
    background-color: var(--aside-bg) !important;
    transition: width 0.3s;

    .aside-header {
      padding: 12px 16px 12px 0;
      display: flex;
      justify-content: flex-end;
      align-items: center;

      .collapse-btn {
        width: 35px;
        height: 35px;
        border: none;
        background-color: transparent;
        color: var(--text-color);
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;

        &:hover {
          background-color: var(--menu-hover);
        }
      }
    }

    .divider {
      height: 1px;
      background-color: var(--border-color);
      margin: 0;
    }

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
    position: relative;

    .header-left {
      flex: 1;
      
      .greeting {
        font-size: 16px;
        color: var(--text-color);
        font-style: italic;
      }
    }

    .header-center {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);

      .logo {
        height: 40px;
        width: 120px;
        background: url('@/assets/logo.png') no-repeat center / contain;
      }
    }

    .header-right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 16px;

      .username {
        font-size: 14px;
        color: var(--text-color);
        font-weight: 500;
      }

      .theme-switch {
        position: relative;
        cursor: pointer;
        
        .switch-track {
          width: 56px;
          height: 28px;
          background-color: #4B5563;
          border-radius: 14px;
          padding: 2px;
          transition: all 0.3s ease;
          
          &.is-dark {
            background-color: #1F2937;
            
            .switch-handle {
              transform: translateX(28px);
            }
          }
        }
        
        .switch-handle {
          width: 24px;
          height: 24px;
          background-color: white;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: all 0.3s ease;
          position: relative;
          
          .light-icon,
          .dark-icon {
            position: absolute;
            font-size: 16px;
            transition: all 0.3s ease;
            opacity: 0;
            transform: scale(0.5);
            
            &.active {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          .light-icon {
            color: #FCD34D;
          }
          
          .dark-icon {
            color: #6B7280;
          }
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