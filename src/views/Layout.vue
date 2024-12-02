<template>
  <!-- 添加加载动画层 -->
  <div class="page-loading" :class="{ 'fade-out': !isLoading }">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <div class="loading-text">绘画梦工厂</div>
      <div class="loading-subtext">正在准备画布...</div>
    </div>
  </div>

  <el-container class="layout-container" :class="{ 'fade-in': !isLoading }">
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
          <!-- 积分显示和签到按钮 -->
          <div class="points-container">
            <el-tooltip content="我的积分" placement="bottom">
              <div class="points-display">
                <el-icon><Coin /></el-icon>
                <span class="points-value">{{ points }}</span>
              </div>
            </el-tooltip>
            <el-button 
              class="sign-in-btn"
              :type="hasSignedIn ? 'success' : 'primary'"
              :disabled="hasSignedIn"
              @click="handleSignIn"
              :loading="signingIn"
            >
              {{ hasSignedIn ? '已签到' : '签到' }}
            </el-button>
          </div>

          <!-- 主题切换开关 -->
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

          <el-dropdown placement="bottom-end" @command="handleCommand">
            <span class="el-dropdown__box">
              <el-avatar :src="imgUrl" />
              <el-icon>
                <CaretBottom />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile" :icon="User">
                  个人中心
                </el-dropdown-item>
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
  Expand,
  Coin
} from '@element-plus/icons-vue';
import { ref, onMounted, computed, nextTick } from 'vue';
import avatar from '@/assets/default.png';
import { userLogoutService } from '@/api/login';
import { useTokenStore } from '@/stores/token';
import { useUserInfoStore } from '@/stores/userinfo';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useMenuListService } from '@/api/menu';
import { getUserMenus } from '@/api/user';
import { useThemeStore } from '@/stores/theme';
import { signIn as signInApi, getPoints } from '@/api/points';

// 路由和状态管理
const router = useRouter();
const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();
const themeStore = useThemeStore();

// 头像处理
const imgUrl = ref('');
imgUrl.value = userInfoStore.userInfo.avatarUrl || avatar;

// 导入所有 Element Plus 图标
import * as ElementPlusIcons from '@element-plus/icons-vue';

// 创建图标映射对象
const iconMap = {};
for (const [key, component] of Object.entries(ElementPlusIcons)) {
  iconMap[key] = component;
}

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

// 修改获取菜单图标的方法
const getMenuIcon = (iconName) => {
  // 如果没有图标名称，返回默认图标
  if (!iconName) return ElementPlusIcons.Menu;
  // 返回对应的图标组件，如果不存在则返回默认图标
  return iconMap[iconName] || ElementPlusIcons.Menu;
};

// 修改命令处理函数
const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/');
      break;
    case 'logout':
      try {
        // 先清除状态
        tokenStore.removeToken();
        userInfoStore.removeUserInfo();
        // 再调用登出接口
        await userLogoutService();
        // 最后跳转
        router.push('/login');
        // 强制刷新页面
        window.location.reload();
      } catch (error) {
        ElMessage.error('注销失败，请稍后重试');
      }
      break;
  }
};

// 添加加载状态控制
const isLoading = ref(true);

// 积分相关状态
const points = ref(0)
const hasSignedIn = ref(false)
const signingIn = ref(false)

// 获取用户积分
const fetchPoints = async () => {
  try {
    const response = await getPoints();
    if (response && response.data) {
      points.value = response.data;
    } else {
      ElMessage.error('获取积分失败');
    }
  } catch (error) {
    console.error('获取积分失败:', error);
    ElMessage.error('获取积分失败');
  }
};

// 处理签到
const handleSignIn = async () => {
  if (hasSignedIn.value || signingIn.value) return;
  
  signingIn.value = true;
  try {
    const response = await signInApi();
    if (response && response.code === 200) {
      ElMessage.success('签到成功，积分已更新');
      hasSignedIn.value = true;
      await fetchPoints(); // 重新获取最新积分
    } else {
      ElMessage.error(response.message || '签到失败');
    }
  } catch (error) {
    console.error('签到失败:', error);
    ElMessage.error(error.response?.data?.message || '签到失败，请重试');
  } finally {
    signingIn.value = false;
  }
};

// 修改 onMounted
onMounted(async () => {
  // 先获取菜单
  await fetchDynamicMenus();
  
  // 延迟一下以展示加载动画
  setTimeout(() => {
    isLoading.value = false;
  }, 1500);

  await fetchPoints()
});

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
/* 添加加载动画相关样式 */
.page-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1a1f37 0%, #111827 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  opacity: 1;
  transition: opacity 0.6s ease-out;

  &.fade-out {
    opacity: 0;
    pointer-events: none;
  }

  .loading-content {
    text-align: center;
    color: white;
  }

  .loading-spinner {
    width: 60px;
    height: 60px;
    margin: 0 auto 20px;
    border: 3px solid transparent;
    border-top-color: #00c6fb;
    border-right-color: #005bea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
    background: linear-gradient(90deg, #00c6fb, #005bea);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .loading-subtext {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    animation: pulse 2s infinite;
  }
}

/* 内容区域淡入动画 */
.layout-container {
  opacity: 0;
  transition: opacity 0.6s ease-out;

  &.fade-in {
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.layout-container {
  display: flex;
  height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);

  /* 左侧菜单美化 */
  .el-aside {
    position: relative;
    background: linear-gradient(180deg, #1a1f37 0%, #111827 100%) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-right: 1px solid rgba(255, 255, 255, 0.05);

    .aside-header {
      padding: 16px;
      display: flex;
      justify-content: flex-end;
      align-items: center;

      .collapse-btn {
        width: 36px;
        height: 36px;
        border: none;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.7);
        border-radius: 8px;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: scale(1.05);
        }
      }
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, 
        rgba(255,255,255,0) 0%, 
        rgba(255,255,255,0.1) 50%,
        rgba(255,255,255,0) 100%
      );
      margin: 0;
    }

    .el-menu {
      background: transparent !important;
      border: none;

      .el-menu-item {
        height: 50px;
        margin: 8px 12px;
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.7);
        transition: all 0.3s ease;

        .el-icon {
          font-size: 18px;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          transform: translateX(4px);
        }

        &.is-active {
          background: linear-gradient(90deg, #00c6fb 0%, #005bea 100%);
          color: white;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0, 198, 251, 0.3);

          &:hover {
            transform: translateX(4px) translateY(-2px);
          }
        }
      }
    }
  }

  /* 右侧内容区域 */
  .el-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg-color);

    /* 头部导航栏美化 */
    .el-header {
      background: var(--bg-color);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      height: 64px;
      position: relative;

      .header-left {
        flex: 1;
        
        .greeting {
          font-size: 16px;
          background: linear-gradient(90deg, #00c6fb 0%, #005bea 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 500;
        }
      }

      .header-center {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);

        .logo {
          height: 40px;
          width: 120px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
          }
        }
      }

      .header-right {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 20px;

        .points-container {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-right: 20px;
          
          .points-display {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            background: var(--el-color-primary-light-9);
            border-radius: 20px;
            transition: all 0.3s ease;
            
            .el-icon {
              font-size: 18px;
              color: var(--el-color-primary);
            }
            
            .points-value {
              font-size: 16px;
              font-weight: 600;
              color: var(--el-color-primary);
            }
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.1);
            }
          }
          
          .sign-in-btn {
            padding: 6px 16px;
            border-radius: 20px;
            transition: all 0.3s ease;
            
            &:not(:disabled):hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.2);
            }
            
            &.is-disabled {
              cursor: not-allowed;
              opacity: 0.7;
            }
          }
        }

        .theme-switch {
          .switch-track {
            width: 56px;
            height: 28px;
            background: linear-gradient(90deg, #4B5563 0%, #1F2937 100%);
            border-radius: 14px;
            padding: 2px;
            transition: all 0.3s ease;
            
            &.is-dark {
              background: linear-gradient(90deg, #1F2937 0%, #111827 100%);
              
              .switch-handle {
                transform: translateX(28px);
              }
            }

            .switch-handle {
              width: 24px;
              height: 24px;
              background: white;
              border-radius: 50%;
              display: flex;
              justify-content: center;
              align-items: center;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              
              .light-icon,
              .dark-icon {
                position: absolute;
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
        }

        .el-dropdown__box {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: all 0.3s ease;

          &:hover {
            background: var(--el-color-primary-light-9);
          }

          .el-avatar {
            border: 2px solid var(--el-color-primary-light-5);
            transition: all 0.3s ease;

            &:hover {
              transform: scale(1.05);
              border-color: var(--el-color-primary);
            }
          }

          .el-icon {
            color: var(--text-color);
            transition: all 0.3s ease;
          }
        }
      }
    }

    /* 主要内容区域 */
    .el-main {
      background: var(--bg-color);
      padding: 24px;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 8px;
      }
      
      &::-webkit-scrollbar-track {
        background: var(--el-color-primary-light-9);
        border-radius: 4px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: var(--el-color-primary-light-5);
        border-radius: 4px;
        
        &:hover {
          background: var(--el-color-primary-light-3);
        }
      }
    }

    /* 底部美化 */
    .el-footer {
      background: var(--bg-color);
      color: var(--text-color);
      font-size: 14px;
      padding: 20px 0;
      text-align: center;
      border-top: 1px solid var(--border-color);
      
      &::before {
        content: '❤️';
        margin-right: 6px;
        font-size: 16px;
      }
    }
  }
}

/* 下拉菜单美化 */
.el-dropdown-menu {
  border: none !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  padding: 8px !important;

  .el-dropdown-menu__item {
    padding: 10px 16px !important;
    border-radius: 8px !important;
    margin: 4px 0 !important;
    transition: all 0.3s ease !important;

    &:hover {
      background: var(--el-color-primary-light-9) !important;
      color: var(--el-color-primary) !important;
    }

    i {
      margin-right: 8px !important;
    }
  }
}
</style>