<template>
  <el-container class="layout-container">
    <!-- 左侧菜单 -->
    <el-aside width="200px">
      <div class="el-aside__logo"></div>
      <el-menu active-text-color="#ffd04b" background-color="#232323" text-color="#fff" router>
        <el-menu-item 
          v-for="menu in menuList" 
          :key="menu.id" 
          :index="menu.path"
        >
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
        <div>您好：<strong>{{ userInfoStore.userInfo.username }}</strong></div>
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
      </el-header>
      
      <!-- 中间区域 -->
      <el-main style="flex-grow: 1; padding: 0;">
        <div style="width: 100%; height: 100%;">
          <router-view></router-view>
        </div>
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
  CaretBottom
} from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import avatar from '@/assets/default.png'
import { userLogoutService } from '@/api/login'
import { useTokenStore } from '@/stores/token'
import { useUserInfoStore } from '@/stores/userinfo'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useMenuListService } from '@/api/menu'
import { getUserMenus } from '@/api/user'

// 路由和状态管理
const router = useRouter()
const tokenStore = useTokenStore()
const userInfoStore = useUserInfoStore()

// 头像处理
const imgUrl = ref('')
imgUrl.value = userInfoStore.userInfo.avatarUrl || avatar

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
}

// 菜单状态
const menuList = ref([])

// 获取动态菜单
const fetchDynamicMenus = async () => {
  try {
    // 获取所有菜单
    const allMenusResponse = await useMenuListService()
    const allMenus = allMenusResponse.data || []

    // 获取用户可访问的菜单ID
    const userMenusResponse = await getUserMenus(userInfoStore.userInfo.id)
    const allowedMenuIds = userMenusResponse.data.roleMenuIds || []

    // 过滤并排序菜单
    menuList.value = allMenus
      .filter(menu => 
        allowedMenuIds.includes(menu.id) && 
        menu.status === 1 && 
        menu.isVisible === 1
      )
      .sort((a, b) => a.sortOrder - b.sortOrder)
  } catch (error) {
    console.error('获取菜单失败', error)
    ElMessage.error('获取菜单失败，请稍后重试')
  }
}

// 获取菜单对应的图标
const getMenuIcon = (iconName) => {
  return iconMap[iconName] || Management
}

// 注销处理
const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      // 调用注销服务
      await userLogoutService()
      // 清除本地存储的令牌和用户信息
      tokenStore.removeToken()
      userInfoStore.removeUserInfo()
      // 跳转到登录页面
      router.push('/login')
    } catch (error) {
      ElMessage.error('注销失败，请稍后重试')
    }
  }
}

// 组件挂载时获取菜单
onMounted(fetchDynamicMenus)
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  height: 100vh;

  .el-aside {
    background-color: #232323;

    &__logo {
      height: 120px;
      background: url('@/assets/logo.png') no-repeat center / 120px auto;
    }

    .el-menu {
      border-right: none;
    }
  }

  .el-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .el-header {
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .el-dropdown__box {
      display: flex;
      align-items: center;

      .el-icon {
        color: #999;
        margin-left: 10px;
      }

      &:active,
      &:focus {
        outline: none;
      }
    }
  }

  .el-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #666;
  }
}
</style>