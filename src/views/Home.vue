<template>
  <div class="app-container">
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
                      <h3>前端技术</h3>
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

const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();
const router = useRouter();

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

<style scoped lang="scss">
.app-container {
  padding: 20px;

  .box-card {
    margin-bottom: 20px;
  }
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;

  .avatar-uploader {
    display: flex;
    flex-direction: column;
    align-items: center;

    .avatar {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #ebebeb;
      cursor: pointer;
      margin-bottom: 10px; // 添加图片与按钮组之间的间距  
    }
  }

  .button-group {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 10px;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;

      .el-button {
        width: 100%;
      }
    }
  }
}

.profile-card {
  min-height: 625px;
}

.profile-descriptions {
  margin-top: 20px;

  .el-descriptions__label {
    width: 100px;
  }
}

.profile-form {
  max-width: 500px;

  .el-form-item {
    margin-bottom: 20px;
  }
}

.form-buttons {
  text-align: right;
}

/* 积分模块样式 */
.points-card {
  .el-statistic {
    margin-bottom: 80px;
  }

  .sign-in-section {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .text-center {
    text-align: center;
  }
}

/* 技术选型模块样式 */
.tech-selection-card {
  .tech-content {
    .tech-section {
      h3 {
        margin-top: 10px;
        margin-bottom: 10px;
        color: #409EFF;
      }

      ul {
        list-style-type: disc;
        padding-left: 20px;

        li {
          margin-bottom: 5px;
        }
      }
    }
  }
}

@media (max-width: 768px) {

  .points-card,
  .tech-selection-card {
    margin-bottom: 20px;
  }
}
</style>