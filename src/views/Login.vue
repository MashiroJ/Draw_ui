<template>
  <el-row class="login-page">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
      <!-- 注册表单 -->
      <el-form ref="registerForm" size="large" autocomplete="off" v-if="isRegister" :rules="registerRules"
        :model="registerData">
        <el-form-item>
          <h1>注册</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="registerData.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input :prefix-icon="Lock" type="password" placeholder="请输入密码" v-model="registerData.password"></el-input>
        </el-form-item>
        <el-form-item prop="rePassword">
          <el-input :prefix-icon="Lock" type="password" placeholder="请再次输入密码"
            v-model="registerData.rePassword"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="button" type="primary" @click="register">
            注册
          </el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" :underline="false" @click="toggleForm">
            ← 返回
          </el-link>
        </el-form-item>
      </el-form>

      <!-- 登录表单 -->
      <el-form ref="loginForm" size="large" autocomplete="off" v-else :rules="loginRules" :model="loginData">
        <el-form-item>
          <h1>登录</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="loginData.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input name="password" :prefix-icon="Lock" type="password" placeholder="请输入密码"
            v-model="loginData.password"></el-input>
        </el-form-item>
        <el-form-item prop="captcha">
          <el-input placeholder="请输入验证码" v-model="loginData.captcha"></el-input>
          <img :src="captchaImg" @click="getCaptcha" alt="captcha" style="cursor: pointer" />
        </el-form-item>

        <el-form-item>
          <el-button class="button" type="primary" @click="login">
            登录
          </el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" :underline="false" @click="toggleForm">
            注册 →
          </el-link>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script setup>
import { Lock, User } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTokenStore } from '@/stores/token.js';
import { useUserInfoStore } from '@/stores/userinfo.js';
import { getCaptchaService, userLoginService, userRegisterService } from '@/api/login';
import { getUserInfo } from '@/api/user';

const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();
const isRegister = ref(false); // 控制表单状态
const registerData = ref({
  username: '',
  password: '',
  rePassword: ''
});
const loginData = ref({
  username: '',
  password: '',
  captcha: ''
});
const captchaImg = ref('');
const captchaKey = ref('');
const router = useRouter();

const getCaptcha = async () => {
  try {
    const data = await getCaptchaService();
    captchaImg.value = data.data.image;
    captchaKey.value = data.data.key;
  } catch (error) {
    console.error('获取验证码失败:', error);
  }
};

onMounted(() => {
  getCaptcha();
});

const checkRePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerData.value.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 5, max: 16, message: '请输入5-16位用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, max: 16, message: '请输入5-16位密码', trigger: 'blur' }
  ],
  rePassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: checkRePassword, trigger: 'blur' }
  ]
};

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 16, message: '请输入5-16位用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, max: 16, message: '请输入5-16位密码', trigger: 'blur' }
  ],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
};

const register = async () => {
  try {
    const registerPayload = {
      username: registerData.value.username,
      password: registerData.value.password,
      rePassword: registerData.value.rePassword
    };

    const result = await userRegisterService(registerPayload);
    if (result.code === 200) {
      ElNotification.success(result.message || '注册成功');
      isRegister.value = false; // 注册成功后返回登录界面
      getCaptcha(); // 获取新的验证码
    } else {
      ElNotification.error(result.message || '注册失败');
    }
  } catch (error) {
    console.error('注册失败:', error);
  }
};

const login = async () => {
  try {
    const loginPayload = {
      username: loginData.value.username,
      password: loginData.value.password,
      captchaKey: captchaKey.value,
      captchaCode: loginData.value.captcha
    };

    const result = await userLoginService(loginPayload);
    if (result.code === 200) {
      const tokenValue = result.data.data.tokenValue;
      tokenStore.setToken(tokenValue);

      const userInfoResult = await getUserInfo();
      if (userInfoResult.code === 200) {
        userInfoStore.setUserInfo(userInfoResult.data);
        console.log(userInfoResult.data);
      }

      ElNotification.success('登录成功');
      router.push('/Gallery');
    } else {
      ElNotification.error('登录失败');
      await getCaptcha();
    }
  } catch (error) {
    console.error('登录失败:', error);
  }
};

const clearRegisterData = () => {
  registerData.value = {
    username: '',
    password: '',
    rePassword: ''
  };
};

const toggleForm = () => {
  isRegister.value = !isRegister.value;
  if (isRegister.value) {
    clearRegisterData(); // 切换到注册时清空注册数据
  } else {
    loginData.value = {
      username: '',
      password: '',
      captcha: ''
    }; // 切换到登录时清空登录数据
  }
  getCaptcha(); // 获取验证码
};
</script>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  background-color: var(--bg-color);
  display: flex;

  /* 左侧背景区域优化 */
  .bg {
    background: url('@/assets/logo.png') no-repeat 60% center / 240px auto,
      url('@/assets/login_bg.jpg') no-repeat center / cover;
    border-radius: 0 20px 20px 0;
    position: relative;
    overflow: hidden;
    box-shadow: 10px 0 20px rgba(0, 0, 0, 0.1);
    
    /* 移除模糊,改用渐变遮罩 */
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to right,
        rgba(0, 0, 0, 0.2),
        rgba(0, 0, 0, 0.1)
      );
      pointer-events: none;
    }

    /* 添加装饰性光效 */
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(
        circle at 70% center,
        rgba(255, 255, 255, 0.2) 0%,
        transparent 50%
      );
      pointer-events: none;
    }
  }

  /* 右侧表单区域优化 */
  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;
    padding: 0 64px;
    position: relative;
    background: var(--bg-color);

    /* 表单标题 */
    h1 {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 48px;
      background: linear-gradient(45deg, var(--el-color-primary), var(--el-color-primary-light-3));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-align: center;
      position: relative;

      /* 添加装饰性下划线 */
      &::after {
        content: '';
        position: absolute;
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
        width: 40px;
        height: 4px;
        background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
        border-radius: 2px;
      }
    }

    /* 表单项美化 */
    :deep(.el-form-item) {
      margin-bottom: 28px;

      .el-input__wrapper {
        background: var(--bg-color);
        border: 2px solid var(--border-color);
        box-shadow: none;
        border-radius: 12px;
        padding: 12px 16px;
        transition: all 0.3s ease;

        &:hover {
          border-color: var(--el-color-primary-light-5);
          transform: translateY(-2px);
        }

        &.is-focus {
          border-color: var(--el-color-primary);
          box-shadow: 0 0 0 4px var(--el-color-primary-light-8);
          transform: translateY(-2px);
        }

        .el-input__inner {
          color: var(--text-color);
          height: 40px;
          font-size: 16px;

          &::placeholder {
            color: var(--el-text-color-placeholder);
          }
        }

        .el-input__prefix {
          font-size: 20px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    /* 验证码区域 */
    .el-form-item.captcha-item {
      :deep(.el-form-item__content) {
        display: flex;
        gap: 16px;

        .el-input {
          flex: 1;
        }

        img {
          height: 44px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

          &:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        }
      }
    }

    /* 记住我和忘记密码 */
    .flex {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 32px;
      gap: 24px;

      .el-link {
        font-size: 14px;
        color: var(--el-color-primary);
        font-weight: 500;

        &:hover {
          color: var(--el-color-primary-light-3);
        }

        &[type="info"] {
          color: var(--text-color);
          opacity: 0.8;
          
          &:hover {
            opacity: 1;
            color: var(--text-color);
          }
        }
      }
    }

    /* 按钮美化 */
    .button {
      width: 100%;
      height: 48px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      background: linear-gradient(45deg, var(--el-color-primary), var(--el-color-primary-light-3));
      border: none;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      letter-spacing: 1px;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transform: translateX(-100%);
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(var(--el-color-primary-rgb), 0.4);

        &::before {
          transform: translateX(100%);
          transition: transform 0.8s ease;
        }
      }
    }

    /* 注册链接 */
    .el-link {
      margin-top: 24px;
      font-size: 14px;
      color: var(--text-color);
      opacity: 0.8;
      transition: all 0.3s ease;
      text-align: center;

      &:hover {
        opacity: 1;
        transform: translateX(4px);
      }
    }
  }
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .login-page {
    .bg {
      display: none;
    }

    .form {
      width: 100%;
      padding: 32px;
      
      h1 {
        font-size: 32px;
        margin-bottom: 40px;
      }
    }
  }
}
</style>
