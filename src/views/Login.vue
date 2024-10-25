<template>
  <el-row class="login-page">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
      <!-- 注册表单 -->
      <el-form
          ref="registerForm"
          size="large"
          autocomplete="off"
          v-if="isRegister"
          :rules="registerRules"
          :model="registerData"
      >
        <el-form-item>
          <h1>注册</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
              :prefix-icon="User"
              placeholder="请输入用户名"
              v-model="registerData.username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
              :prefix-icon="Lock"
              type="password"
              placeholder="请输入密码"
              v-model="registerData.password"
          ></el-input>
        </el-form-item>
        <el-form-item prop="rePassword">
          <el-input
              :prefix-icon="Lock"
              type="password"
              placeholder="请再次输入密码"
              v-model="registerData.rePassword"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
              class="button"
              type="primary"
              auto-insert-space
              @click="register"
          >
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
      <el-form
          ref="loginForm"
          size="large"
          autocomplete="off"
          v-else
          :rules="loginRules"
          :model="loginData"
      >
        <el-form-item>
          <h1>登录</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
              :prefix-icon="User"
              placeholder="请输入用户名"
              v-model="loginData.username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
              name="password"
              :prefix-icon="Lock"
              type="password"
              placeholder="请输入密码"
              v-model="loginData.password"
          ></el-input>
        </el-form-item>
        <el-form-item prop="captcha">
          <el-input
              placeholder="请输入验证码"
              v-model="loginData.captcha"
          ></el-input>
          <!-- 点击图片刷新验证码 -->
          <img :src="captchaImg" @click="getCaptcha" alt="captcha" style="cursor: pointer"/>
        </el-form-item>
        <el-form-item>
          <div class="flex">
            <el-checkbox>记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
              class="button"
              type="primary"
              auto-insert-space
              @click="login"
          >
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
import {Lock, User} from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'
import {onMounted, ref} from 'vue'
import {getCaptchaService, userLoginService, userRegisterService} from '@/api/login'

// 控制表单显示状态，默认显示登录表单
const isRegister = ref(false)

// 注册表单数据模型
const registerData = ref({
  username: '',
  password: '',
  rePassword: ''
})

// 登录表单数据模型
const loginData = ref({
  username: '',
  password: '',
  captcha: ''
})

// 验证码相关变量
const captchaImg = ref('')
const captchaKey = ref('')

// 获取验证码
const getCaptcha = async () => {
  try {
    const data = await getCaptchaService(); // 调用服务获取验证码
    captchaImg.value = data.data.image; // 假设返回的数据中包含image字段
    captchaKey.value = data.data.key; // 存储captchaKey
  } catch (error) {
    console.error('获取验证码失败:', error);
  }
}

// 组件挂载时获取验证码
onMounted(() => {
  getCaptcha()
})

// 验证两次密码输入是否一致
const checkRePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerData.value.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 注册表单的验证规则
const registerRules = {
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 5, max: 16, message: '请输入5-16位用户名', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 5, max: 16, message: '请输入5-16位密码', trigger: 'blur'}
  ],
  rePassword: [
    {required: true, message: '请再次输入密码', trigger: 'blur'},
    {validator: checkRePassword, trigger: 'blur'}
  ]
}

// 登录表单的验证规则
const loginRules = {
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 5, max: 16, message: '请输入5-16位用户名', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 5, max: 16, message: '请输入5-16位密码', trigger: 'blur'}
  ],
  captcha: [{required: true, message: '请输入验证码', trigger: 'blur'}]
}

// 注册处理函数
const register = async () => {
  try {
    const registerPayload = {
      username: registerData.value.username,
      password: registerData.value.password,
      rePassword: registerData.value.rePassword
    };

    const result = await userRegisterService(registerPayload) // 调用注册服务
    if (result.code === 200) {
      ElNotification.success(result.message ? result.message : '注册成功')
    } else {
      ElNotification.error(result.message ? result.message : '注册失败')
    }
  } catch (error) {
    console.error('注册失败:', error);
  }
}

// 登录处理函数
const login = async () => {
  try {
    const loginPayload = {
      username: loginData.value.username,
      password: loginData.value.password,
      captchaKey: captchaKey.value,  // 使用保存的验证码key
      captchaCode: loginData.value.captcha
    };

    const result = await userLoginService(loginPayload); // 调用登录服务
    if (result.code === 200) {
      ElNotification.success(result.message ? result.message : '登录成功');
    } else {
      ElNotification.error(result.message ? result.message : '登录失败');
      await getCaptcha(); // 登录失败时重新获取验证码
    }
  } catch (error) {
    console.error('登录失败:', error);
  }
}

// 清除注册表单数据
const clearRegisterData = () => {
  registerData.value = {
    username: '',
    password: '',
    rePassword: ''
  }
}

// 切换表单显示状态
const toggleForm = () => {
  isRegister.value = !isRegister.value
  clearRegisterData()
  getCaptcha()
}
</script>

<style lang="scss" scoped>
/* 样式 */
.login-page {
  height: 100vh;
  background-color: #fff;

  .bg {
    background: url('@/assets/logo2.png') no-repeat 60% center / 240px auto,
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