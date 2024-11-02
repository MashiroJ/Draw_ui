<!-- 你的组件文件，例如：Layout.vue -->
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
import { ref } from 'vue'
import avatar from '@/assets/default.png'
import { userLogoutService } from '@/api/login'
import { useTokenStore } from '@/stores/token'
import { useUserInfoStore } from '@/stores/userinfo'
import { useRouter } from 'vue-router' // 引入路由器
import { ElMessage } from 'element-plus' // 引入消息组件

const router = useRouter() // 使用路由器实例
const tokenStore = useTokenStore()
const userInfoStore = useUserInfoStore()
const imgUrl = ref('');

imgUrl.value = userInfoStore.userInfo.avatarUrl;

// 定义命令处理函数
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
</script>

<template>
  <el-container class="layout-container">
    <!-- 左侧菜单 -->
    <el-aside width="200px">
      <div class="el-aside__logo"></div>
      <el-menu active-text-color="#ffd04b" background-color="#232323" text-color="#fff" router>
        <el-menu-item index="/">
          <el-icon>
            <Management />
          </el-icon>
          <span>主页</span>
        </el-menu-item>
        <el-sub-menu>
          <template #title>
            <el-icon>
              <UserFilled />
            </el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/User">
            <el-icon>
              <Management />
            </el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/Role">
            <el-icon>
              <Promotion />
            </el-icon>
            <span>角色管理</span>
          </el-menu-item>
          <el-menu-item index="/Menu">
            <el-icon>
              <Promotion />
            </el-icon>
            <span>菜单管理</span>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu>
          <template #title>
            <el-icon>
              <UserFilled />
            </el-icon>
            <span>绘画梦工厂</span>
          </template>
          <el-menu-item index="/Text2Img">
            <el-icon>
              <User />
            </el-icon>
            <span>文生图</span>
          </el-menu-item>
          <el-menu-item index="/Img2Img">
            <el-icon>
              <Crop />
            </el-icon>
            <span>图生图</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/Gallery">
          <el-icon>
            <Management />
          </el-icon>
          <span>画廊</span>
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
