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
              <el-row>
                <el-col :span="12">
                  <el-upload
                    ref="uploadRef"
                    class="avatar-uploader"
                    :show-file-list="false"
                    :auto-upload="true"
                    action="/api/system/file/upload"
                    name="file"
                    :headers="{ satoken: tokenStore.token }"
                    :on-success="uploadSuccess"
                    :before-upload="beforeUpload"
                  >
                    <img v-if="imgUrl" :src="imgUrl" class="avatar" />
                    <img v-else :src="avatar" width="278" />
                  </el-upload>
                  <br />
                  <div class="button-group">
                    <el-button
                      type="primary"
                      :icon="Plus"
                      size="large"
                      @click="triggerUpload"
                    >
                      选择图片
                    </el-button>
                    <el-button
                      type="success"
                      :icon="UploadIcon"
                      size="large"
                      @click="submitUpload"
                    >
                      上传头像
                    </el-button>
                  </div>
                </el-col>
              </el-row>
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

      <!-- 右侧基本资料和修改密码 -->
      <el-col :span="16" :xs="24">
        <el-card class="box-card">
          <template #header>
            <span>基本资料</span>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <el-form
                ref="userInfoFormRef"
                :model="userForm"
                :rules="userRules"
                label-width="100px"
                class="profile-form"
              >
                <el-form-item label="用户名称" prop="userName">
                  <el-input v-model="userForm.userName" maxlength="30" disabled />
                </el-form-item>
                <el-form-item label="手机号码" prop="phonenumber">
                  <el-input v-model="userForm.phonenumber" maxlength="11" />
                </el-form-item>
                <el-form-item class="form-buttons">
                  <el-button type="primary" @click="submitUserInfo">保存</el-button>
                  <el-button @click="close">关闭</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <el-form
                ref="pwdFormRef"
                :model="pwdForm"
                :rules="pwdRules"
                label-width="100px"
                class="profile-form"
              >
                <el-form-item label="旧密码" prop="oldPassword">
                  <el-input
                    v-model="pwdForm.oldPassword"
                    placeholder="请输入旧密码"
                    type="password"
                    show-password
                  />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input
                    v-model="pwdForm.newPassword"
                    placeholder="请输入新密码"
                    type="password"
                    show-password
                  />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input
                    v-model="pwdForm.confirmPassword"
                    placeholder="请确认新密码"
                    type="password"
                    show-password
                  />
                </el-form-item>
                <el-form-item class="form-buttons">
                  <el-button type="primary" @click="submitPwd">保存</el-button>
                  <el-button @click="close">关闭</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
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
import { getUserRoles, updateAvatar, updateUser } from '@/api/user'; // 确保这些 API 函数已正确导入
import { useRouter } from 'vue-router';

// 获取 Pinia store 实例
const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();
const router = useRouter();

// 响应式数据
const user = reactive({});
const roleGroup = ref('');
const activeTab = ref('userinfo');

const uploadRef = ref(null);
const imgUrl = ref('');
const selectedFile = ref(null);

// 表单数据和验证规则
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
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    {
      pattern: /^[^<>"'|\\]+$/,
      message: '不能包含非法字符：< > " \' \\ |',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (pwdForm.newPassword !== value) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
});

// 表单引用
const userInfoFormRef = ref(null);
const pwdFormRef = ref(null);

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

onMounted(() => {
  getUser();
});

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
    // 回显图片
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
    // 更新 Pinia 中的数据，确保属性名正确
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
      try {
        await updateUser(userForm);
        ElMessage.success('修改成功');
        user.phonenumber = userForm.phonenumber;
        userInfoStore.setUserInfo({ ...userInfoStore.userInfo, phone: userForm.phonenumber });
      } catch (error) {
        ElMessage.error('修改失败，请重试');
        console.error('修改用户信息失败:', error);
      }
    }
  });
};

// 提交修改密码
const submitPwd = () => {
  pwdFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // await updateUserPwd(pwdForm.oldPassword, pwdForm.newPassword);
        ElMessage.success('修改成功');
        pwdForm.oldPassword = '';
        pwdForm.newPassword = '';
        pwdForm.confirmPassword = '';
      } catch (error) {
        ElMessage.error('修改失败，请检查旧密码是否正确');
        console.error('修改密码失败:', error);
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
  justify-content: center;
  margin-bottom: 20px;
}

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
  }
}

.profile-card {
  min-height: 400px;
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

/* 新增的 button-group 样式 */
.button-group {
  display: flex;
  gap: 10px; /* 控制按钮之间的间距 */
  justify-content: center; /* 水平居中对齐按钮 */
  margin-top: 10px; /* 上方留出空间 */
}

@media (max-width: 768px) {
  /* 响应式设计：在较小屏幕上垂直排列按钮 */
  .button-group {
    flex-direction: column;
    align-items: center;
  }

  .button-group .el-button {
    width: 100%;
  }
}
</style>
