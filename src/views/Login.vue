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
          <el-button class="button" type="primary" auto-insert-space @click="register">
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
          <div class="flex">
            <el-checkbox>记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button class="button" type="primary" auto-insert-space @click="login">
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
import { getUserInfo } from '@/api/user'

const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();
const isRegister = ref(false);
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
    { min: 5, max: 16, message: '请输入5-16位用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, max: 16, message: '请输入5-16位密码', trigger: 'blur' }
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
      ElNotification.success(result.message ? result.message : '注册成功');
    } else {
      ElNotification.error(result.message ? result.message : '注册失败');
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
  

      // 获取当前登录用户的信息
      const userInfoResult = await getUserInfo();
      if (userInfoResult.code === 200) {
        userInfoStore.setUserInfo(userInfoResult.data); // 存储用户信息
        console.log('当前登录用户信息:', userInfoResult.data);
        
      }

      ElNotification.success('登录成功');
      router.push('/');
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
  clearRegisterData();
  getCaptcha();
};
</script>

<style lang="scss" scoped>
/* 样式 */
.login-page {
  height: 100vh;
  background-color: #fff;

  .bg {
    background: url('@/assets/logo.png') no-repeat 60% center / 240px auto,
      url('@/assets/login_bg.jpg') no-repeat center / cover;
    border-radius: 0 20px 20px 0;
  }

  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;

    .title {
      margin: 0 auto;
    }

    .button {
      width: 100%;
    }

    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
