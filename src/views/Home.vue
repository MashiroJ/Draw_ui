<!-- src/components/Profile.vue -->
<template>
  <div class="app-container">
    <!-- 欢迎卡片 -->
    <el-card class="welcome-card" style="margin-bottom: 20px;">
      <div class="welcome-content">
        <div class="welcome-avatar">
          <img :src="user.avatar || defaultAvatar" alt="用户头像" class="welcome-avatar-image">
        </div>
        <div class="welcome-text">
          <h2 class="welcome-title">Hello {{ user.userName }}!</h2>
          <p class="welcome-subtitle">欢迎使用绘画梦工厂</p>
        </div>
      </div>
    </el-card>
    <el-row :gutter="20">
      <!-- 左侧个人信息 -->
      <el-col :span="8" :xs="24">
        <el-card class="box-card profile-card">
          <template #header>
            <span>个人信息</span>
          </template>
          <div>
            <div class="avatar-container">
              <el-upload ref="uploadRef" class="avatar-uploader" :show-file-list="false" :auto-upload="true"
                action="/api/system/file/upload" name="file" :headers="{ satoken: tokenStore.token }"
                :on-success="uploadSuccess" :before-upload="beforeUpload">
                <img v-if="imgUrl" :src="imgUrl" class="avatar" />
                <img v-else :src="defaultAvatar" class="avatar" />
              </el-upload>
              <div class="button-group">
                <el-button type="primary" :icon="Plus" size="large" @click="triggerUpload">
                  选择图片
                </el-button>
                <el-button type="success" :icon="UploadIcon" size="large" @click="submitUpload">
                  上传头像
                </el-button>
              </div>
            </div>
            <el-descriptions border column="1" class="profile-descriptions">
              <el-descriptions-item label="用户名称">
                <svg-icon icon-class="user" /> {{ user.userName }}
              </el-descriptions-item>
              <el-descriptions-item label="手机号码">
                <svg-icon icon-class="phone" /> {{ user.phonenumber }}
              </el-descriptions-item>
              <el-descriptions-item label="所属角色">
                <svg-icon icon-class="peoples" /> {{ roleGroup }}
              </el-descriptions-item>
              <el-descriptions-item label="创建日期">
                <svg-icon icon-class="date" /> {{ user.createTime }}
              </el-descriptions-item>
              <el-descriptions-item label="修改日期">
                <svg-icon icon-class="date" /> {{ user.updateTime }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧基本资料、积分信息和技术选型 -->
      <el-col :span="16" :xs="24">
        <el-card class="box-card">
          <template #header>
            <span>基本资料</span>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <el-form ref="userInfoFormRef" :model="userForm" :rules="userRules" label-width="100px"
                class="profile-form">
                <el-form-item label="用户名称" prop="userName">
                  <el-input v-model="userForm.userName" maxlength="30" disabled />
                </el-form-item>
                <el-form-item label="手机号码" prop="phonenumber">
                  <el-input v-model="userForm.phonenumber" maxlength="11" />
                </el-form-item>
                <el-form-item class="form-buttons">
                  <el-button type="primary" :loading="isSubmittingUserInfo" @click="submitUserInfo">保存</el-button>
                  <el-button @click="close">关闭</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="100px" class="profile-form">
                <el-form-item label="旧密码" prop="oldPassword">
                  <el-input v-model="pwdForm.oldPassword" placeholder="请输入旧密码" type="password" show-password />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input v-model="pwdForm.newPassword" placeholder="请输入新密码" type="password" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="pwdForm.confirmPassword" placeholder="请确认新密码" type="password" show-password />
                </el-form-item>
                <el-form-item class="form-buttons">
                  <el-button type="primary" :loading="isSubmittingPwd" @click="submitPwd">保存</el-button>
                  <el-button @click="close">关闭</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>

        <!-- 积分和技术选型模块 -->
        <el-row :gutter="20">
          <!-- 技术选型模块卡片 -->
          <el-col :span="12" :xs="24">
            <el-card class="box-card tech-selection-card">
              <template #header>
                <span>技术选型</span>
              </template>
              <div class="tech-content">
                <el-row :gutter="20">
                  <!-- 后端技术 -->
                  <el-col :span="12" :xs="24">
                    <div class="tech-section">
                      <h3>后端技术</h3>
                      <ul>
                        <li>SpringBoot</li>
                        <li>MyBatis-Plus</li>
                        <li>Sa-Token</li>
                        <li>ComfyUi</li>
                        <li>MinIo</li>
                      </ul>
                    </div>
                  </el-col>

                  <!-- 前端技术 -->
                  <el-col :span="12" :xs="24">
                    <div class="tech-section">
                      <h3>前端技</h3>
                      <ul>
                        <li>Vue</li>
                        <li>Pinia</li>
                        <li>Element-ui</li>
                        <li>Axios</li>
                        <li>Sass</li>
                      </ul>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-card>
          </el-col>

          <!-- 积分模块卡片 -->
          <el-col :span="12" :xs="24">
            <el-card class="box-card points-card">
              <template #header>
                <span>积分信息</span>
              </template>
              <div>
                <!-- 上部分显示积分信息 -->
                <el-row>
                  <el-col :span="24">
                    <h3>当前积分：</h3>
                    <el-statistic :value="points" :precision="0" :separator="true">
                    </el-statistic>
                  </el-col>
                </el-row>
                <!-- 下部分显示签到按钮 -->
                <el-row class="sign-in-section">
                  <el-col :span="24" class="text-center">
                    <el-button type="primary" @click="handleSignIn" :loading="isSigningIn">
                      签到
                    </el-button>
                  </el-col>
                </el-row>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, Upload as UploadIcon } from '@element-plus/icons-vue';
import defaultAvatar from '@/assets/images/profile.jpg';
import { useTokenStore } from '@/stores/token';
import { useUserInfoStore } from '@/stores/userinfo';
import { getUserRoles, updateAvatar, updateUser, updatePassword } from '@/api/user';
import { signIn as signInApi, getPoints } from '@/api/points';
import { useRouter } from 'vue-router';
import { useThemeStore } from '@/stores/theme';

const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();
const router = useRouter();

// 主题存储
const themeStore = useThemeStore();

const user = reactive({});
const roleGroup = ref('');
const activeTab = ref('userinfo');

const uploadRef = ref(null);
const imgUrl = ref('');
const selectedFile = ref(null);

const userForm = reactive({
  userName: '',
  phonenumber: '',
});
const userRules = reactive({
  phonenumber: [
    { required: true, message: '手机号码不能为空', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur',
    },
  ],
});

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const pwdRules = reactive({
  oldPassword: [{ required: true, message: '旧密码不能为空', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    { min: 5, max: 20, message: '长度在 5 到 20 个字符', trigger: 'blur' },
    {
      pattern: /^[^<>"'|\\]+$/,
      message: '不能包含非法字符：< > " \' \\ |',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (pwdForm.newPassword !== value) {
          return new Error('两次输入的密码不一致');
        }
        return true;
      },
      trigger: 'blur',
    },
  ],
});

const points = ref(0);
const isSigningIn = ref(false);

const userInfoFormRef = ref(null);
const pwdFormRef = ref(null);

const isSubmittingPwd = ref(false);
const isSubmittingUserInfo = ref(false);

// 获取用户信息  
const getUser = async () => {
  const userInfo = userInfoStore.userInfo;
  user.userName = userInfo.username || '';
  user.phonenumber = userInfo.phone || '';
  user.createTime = userInfo.createTime || '';
  user.updateTime = userInfo.updateTime || '';
  user.avatar = userInfo.avatarUrl || defaultAvatar;

  userForm.userName = user.userName;
  userForm.phonenumber = user.phonenumber;

  imgUrl.value = user.avatar || defaultAvatar;

  const userId = userInfo.id;
  try {
    const response = await getUserRoles(userId);
    roleGroup.value = response.data;
  } catch (error) {
    console.error('获取用户角色失败:', error);
    ElMessage.error('获取用户角色失败');
  }
};

// 获取当前积分  
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

// 签到获取积分  
const handleSignIn = async () => {
  isSigningIn.value = true;
  try {
    const response = await signInApi();
    if (response && response.code === 200) {
      ElMessage.success('签到成功，积分已更新');
      await fetchPoints();
    } else {
      ElMessage.error(response.message || '签到失败');
    }
  } catch (error) {
    console.error('签到失败:', error);
    ElMessage.error(error.response?.data?.message || '签到失败，请重试');
  } finally {
    isSigningIn.value = false;
  }
};

// 触发文件上传  
const triggerUpload = () => {
  uploadRef.value.$el.querySelector('input').click();
};

// 上传前的验证  
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('文件格式错误，请上传图片类型，如：JPG，PNG后缀的文件。');
    return false;
  }
  selectedFile.value = file;
  return true;
};

// 图片上传成功的回调  
const uploadSuccess = (result) => {
  if (result && result.data) {
    imgUrl.value = result.data;
    ElMessage.success('图片上传成功');
  } else {
    ElMessage.error('上传失败，未返回有效数据');
  }
};

// 更新用户头像  
const submitUpload = async () => {
  if (!imgUrl.value) {
    ElMessage.warning('请先选择一张图片');
    return;
  }
  try {
    let result = await updateAvatar(imgUrl.value);
    ElMessage.success(result.message ? result.message : '修改成功');
    userInfoStore.userInfo.avatarUrl = imgUrl.value;
  } catch (error) {
    ElMessage.error('上传失败，请重试');
    console.error('上传头像失败:', error);
  }
};

// 提交用户基本信息  
const submitUserInfo = () => {
  userInfoFormRef.value.validate(async (valid) => {
    if (valid) {
      isSubmittingUserInfo.value = true;
      try {
        await updateUser(userForm);
        ElMessage.success('修改成功');
        user.phonenumber = userForm.phonenumber;
        userInfoStore.setUserInfo({ ...userInfoStore.userInfo, phone: userForm.phonenumber });
      } catch (error) {
        ElMessage.error('修改失败，请重试');
        console.error('修改用户信息失败:', error);
      } finally {
        isSubmittingUserInfo.value = false;
      }
    }
  });
};

// 提交修改密码  
const submitPwd = () => {
  pwdFormRef.value.validate(async (valid) => {
    if (valid) {
      isSubmittingPwd.value = true;
      try {
        const response = await updatePassword({
          oldPassword: pwdForm.oldPassword,
          newPassword: pwdForm.newPassword,
          confirmPassword: pwdForm.confirmPassword,
        });

        if (response && response.code === 200) {
          ElMessage.success('密码修改成功');
          pwdFormRef.value.resetFields();
          pwdForm.oldPassword = '';
          pwdForm.newPassword = '';
          pwdForm.confirmPassword = '';
        } else {
          ElMessage.error(response.message || '密码修改失败，请重试');
        }
      } catch (error) {
        ElMessage.error(error.response?.data?.message || '修改失败，请检查旧密码是否正确');
        console.error('修改密码失败:', error);
      } finally {
        isSubmittingPwd.value = false;
      }
    }
  });
};

// 关闭并重置表单  
const close = () => {
  if (activeTab.value === 'userinfo') {
    userInfoFormRef.value.resetFields();
    userForm.userName = user.userName;
    userForm.phonenumber = user.phonenumber;
  } else if (activeTab.value === 'resetPwd') {
    pwdFormRef.value.resetFields();
    pwdForm.oldPassword = '';
    pwdForm.newPassword = '';
    pwdForm.confirmPassword = '';
  }
};

onMounted(() => {
  getUser();
  fetchPoints(); // 获取当前积分  
});
</script>

<style lang="scss" scoped>
.app-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;

  /* 欢迎卡片新主题 */
  .welcome-card {
    background: linear-gradient(135deg, #00c6fb 0%, #005bea 100%); // 新的渐变色
    border: none;
    box-shadow: 0 8px 32px rgba(0, 198, 251, 0.15);
    padding: 32px;
    margin-bottom: 32px;
    border-radius: 24px;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
      transform: rotate(-45deg);
      pointer-events: none;
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 198, 251, 0.25);
    }

    .welcome-content {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 24px;

      .welcome-avatar {
        .welcome-avatar-image {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;

          &:hover {
            transform: scale(1.1);
            border-color: white;
          }
        }
      }

      .welcome-text {
        .welcome-title {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .welcome-subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
        }
      }
    }
  }

  /* 内容区域网格布局 */
  .el-row {
    display: flex;
    margin: 0 -10px;
    
    .el-col {
      padding: 0 10px;
      display: flex;
      flex-direction: column;
    }
  }

  /* 卡片通用样式 */
  .box-card {
    flex: 1; // 让卡片填充剩余空间
    display: flex;
    flex-direction: column;
    background: var(--bg-color);
    border-radius: 16px;
    border: 2px solid rgba(0, 198, 251, 0.1); // 新的边框颜色
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    overflow: hidden;
    margin-bottom: 24px;

    &:hover {
      transform: translateY(-4px);
      border-color: rgba(0, 198, 251, 0.3);
      box-shadow: 0 12px 32px rgba(0, 198, 251, 0.12);
    }

    :deep(.el-card__header) {
      padding: 20px 24px;
      border-bottom: 2px solid rgba(0, 198, 251, 0.1);
      font-size: 18px;
      font-weight: 600;
      color: #005bea; // 新的主题色
    }

    :deep(.el-card__body) {
      flex: 1; // 让卡片内容区域填充剩余空间
      display: flex;
      flex-direction: column;
    }
  }

  /* 积分卡片和技术选型卡片容器 */
  .el-row:last-child {
    .el-col {
      .box-card {
        height: 100%; // 确保两个卡片等高
        margin-bottom: 0; // 移除底部间距
      }
    }
  }

  /* 积分卡片 */
  .points-card {
    .el-statistic {
      padding: 24px;
      text-align: center;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;

      :deep(.el-statistic__content) {
        font-size: 36px;
        color: #005bea; // 新的主题色
        font-weight: 600;
      }
    }

    .sign-in-section {
      padding: 24px;
      margin-top: auto; // 将签到按钮推到底部

      .el-button {
        background: linear-gradient(135deg, #00c6fb 0%, #005bea 100%);
        border: none;
        padding: 12px 36px;
        font-size: 16px;
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 91, 234, 0.3);
        }
      }
    }
  }

  /* 技术选型卡片 */
  .tech-selection-card {
    .tech-content {
      padding: 24px;
      flex: 1;
      display: flex;
      flex-direction: column;

      .tech-section {
        h3 {
          color: #005bea; // 新的主题色
          &::before {
            background: #00c6fb; // 新的装饰条颜色
          }
        }

        ul li::before {
          background: #00c6fb; // 新的列表标记颜色
        }
      }
    }
  }
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .app-container {
    padding: 16px;

    .el-row {
      margin: 0;
      
      .el-col {
        padding: 0;
      }
    }

    .box-card {
      margin-bottom: 16px;
    }

    /* 在移动端保持最后一行卡片的间距 */
    .el-row:last-child {
      .el-col:first-child .box-card {
        margin-bottom: 16px;
      }
    }
  }
}
</style>
