<template>
  <el-card class="page-container">
    <template #header>
      <el-card class="info-card welcome-card" style="margin-bottom: 20px;">
        <div class="info-card-content">
          <div class="info-text">
            <h2 class="welcome-title">用户管理</h2>
            <p class="welcome-subtitle">用户分配与管理</p>
          </div>
          <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAdd">新增用户</el-button>
        </div>
      </el-card>
    </template>

    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" class="search-form" label-width="68px">
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入用户名"
          clearable
          style="width: 240px"
          @keyup.enter="getUsers"
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入手机号码"
          clearable
          style="width: 240px"
          @keyup.enter="getUsers"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="用户状态"
          clearable
          style="width: 240px"
          @change="getUsers"
        >
          <el-option label="正常" value="正常"></el-option>
          <el-option label="禁用" value="禁用"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="getUsers">搜索</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 用户列表 -->
    <el-table v-loading="loading" :data="users" style="width: 100%">
      <el-table-column label="用户编号" align="center" prop="id" />
      <el-table-column label="用户名" align="center" prop="username" :show-overflow-tooltip="true" />
      <el-table-column label="手机号码" align="center" prop="phone" width="120" />
      <el-table-column label="状态" align="center">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            active-value="正常"
            inactive-value="禁用"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template #default="{ row }">
          <el-button :icon="Edit" circle plain type="primary" size="small" @click="handleEdit(row)" />
          <el-button :icon="Delete" circle plain type="danger" size="small" @click="handleDelete(row)" />
          <el-button :icon="User" circle plain type="success" size="small" @click="handleAssignRole(row)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :page-sizes="[5, 10, 15, 20]"
      layout="total, sizes, prev, pager, next"
      background
      :total="total"
      @size-change="onSizeChange"
      @current-change="onCurrentChange"
      class="pagination"
      style="margin-top: 20px; justify-content: flex-end"
    />

    <!-- 新增/修改用户对话框 -->
    <el-dialog 
      :title="formTitle" 
      v-model="dialogVisible" 
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        label-width="100px"
        class="dialog-form"
      >
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        
        <!-- 密码 -->
        <el-form-item label="密码" prop="password" v-if="isAdd">
          <el-input 
            v-model="form.password" 
            placeholder="请输入密码" 
            show-password
            clearable
          />
        </el-form-item>
        
        <!-- 手机号码 -->
        <el-form-item label="手机号码" prop="phone">
          <el-input 
            v-model="form.phone" 
            placeholder="请输入手机号码"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 授权对话框 -->
    <el-dialog title="分配角色" v-model="assignRoleDialogVisible" width="500px">
      <el-form :model="assignRoleForm" ref="assignRoleFormRef" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="assignRoleForm.username" disabled />
        </el-form-item>
        <el-form-item
          label="角色"
          prop="roleId"
          :rules="[ { required: true, message: '请选择一个角色', trigger: 'change' } ]"
        >
          <el-select
            ref="roleSelectRef"
            v-model="assignRoleForm.roleId"
            placeholder="请选择角色"
            style="width: 100%"
            @change="handleRoleSelectChange"
          >
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignRoleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAssignRoleForm">授权</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { Edit, Delete, User } from '@element-plus/icons-vue';
import { ref, reactive, onMounted } from 'vue';
import { ElNotification, ElMessageBox } from 'element-plus';
import {
  getUserList,
  updateUserStatus,
  deleteUser,
  addUser,
  updateUser,
  grantUserRole,
  getUserRoles
} from '@/api/user';
import { getRoleList } from '@/api/role'; // 导入获取角色列表的 API
import { useThemeStore } from '@/stores/theme';

// 用户列表数据模型
const users = ref([]);
const pageNum = ref(1);
const pageSize = ref(5);
const total = ref(0);

// 搜索参数
const queryParams = reactive({
  username: '',
  phone: '',
  status: null,
});

// 加载状态
const loading = ref(false);

// 定义表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
};

// 获取用户列表
const getUsers = async () => {
  const params = {
    current: pageNum.value,
    size: pageSize.value,
    username: queryParams.username || null,
    phone: queryParams.phone || null,
    status: queryParams.status || null,
  };
  try {
    loading.value = true;
    const result = await getUserList(params);
    users.value = result.data.records || [];
    total.value = result.data.total || 0;
  } catch (error) {
    ElNotification.error('获取用户数据失败');
  } finally {
    loading.value = false;
  }
};

// 重置搜索条件
const resetQuery = () => {
  queryParams.username = '';
  queryParams.phone = '';
  queryParams.status = null;
  getUsers();
};

// 状态切换
const handleStatusChange = async (row) => {
  try {
    await updateUserStatus(row.id, row.status);
    ElNotification.success('用户状态更新成功');
    getUsers();
  } catch (error) {
    ElNotification.error('更新失败');
  }
};

// 新增/修改��话框相关
const dialogVisible = ref(false);
const formTitle = ref('');
const isAdd = ref(true);
const formRef = ref(null);

const form = reactive({
  id: null,
  username: '',
  password: '',
  phone: ''
});

// 主题存储
const themeStore = useThemeStore();

// 处理新增
const handleAdd = () => {
  isAdd.value = true;
  formTitle.value = '新增用户';
  form.id = null;
  form.username = '';
  form.password = '';
  form.phone = '';
  dialogVisible.value = true;
};

// 处理编辑
const handleEdit = (row) => {
  isAdd.value = false;
  formTitle.value = '修改用户';
  form.id = row.id;
  form.username = row.username;
  form.password = '';  // 编辑时不显示密码
  form.phone = row.phone;
  dialogVisible.value = true;
};

// 提交表单
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isAdd.value) {
          await addUser(form);
          ElNotification.success('新增用户成功');
        } else {
          await updateUser(form);
          ElNotification.success('修改用户成功');
        }
        dialogVisible.value = false;
        getUsers();
      } catch (error) {
        ElNotification.error('操作失败');
      }
    }
  });
};

// 删除用户
const handleDelete = async (row) => {
  await ElMessageBox.confirm('确认删除该用户吗?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteUser(row.id);
        ElNotification.success('删除成功');
        getUsers();
      } catch (error) {
        ElNotification.error('删除失败');
      }
    })
    .catch(() => {
      // 用户取消删除操作
    });
};

// 分页变化
const onSizeChange = (size) => {
  pageSize.value = size;
  getUsers();
};

const onCurrentChange = (page) => {
  pageNum.value = page;
  getUsers();
};

// 授权对话框状态
const assignRoleDialogVisible = ref(false);
const assignRoleForm = reactive({
  userId: null,
  username: '',
  roleId: null, // 单个角色 ID
});
const assignRoleFormRef = ref(null);

// 角色列表（从API获）
const roles = ref([]);

// 角色选择框的引用
const roleSelectRef = ref(null);

// 获取角色列表的方法
const getRoles = async () => {
  try {
    const response = await getRoleList(); // 实现 getRoleList API
    roles.value = response.data || [];
  } catch (error) {
    ElNotification.error('获取角色列表失败');
  }
};

// 处理分配角色
const handleAssignRole = async (row) => {
  assignRoleForm.userId = row.id;
  assignRoleForm.username = row.username;
  assignRoleForm.roleId = null; // 重置已选择的角色
  try {
    const response = await getUserRoles(row.id); // 获取当前用户的角色
    // 假设返回的数据是角色 ID 的数组
    if (response.data && response.data.length > 0) {
      assignRoleForm.roleId = response.data[0]; // 只取第一个角色作为默认选中
    }
  } catch (error) {
    ElNotification.error('获取当前用户角色失败');
  }
  assignRoleDialogVisible.value = true;
};

// 处理角色选择后的关闭事件
const handleRoleSelectChange = () => {
  if (roleSelectRef.value) {
    roleSelectRef.value.blur(); // 关闭下拉框
  }
};

// 提交授权表单
const submitAssignRoleForm = () => {
  assignRoleFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 为用户分配新的角色
        await grantUserRole(assignRoleForm.userId, assignRoleForm.roleId);
        ElNotification.success('授权成功');
        assignRoleDialogVisible.value = false;
        getUsers();
      } catch (error) {
        ElNotification.error('授权失败');
      }
    }
  });
};

// 初始化加载数据
onMounted(() => {
  getUsers();
  getRoles();
});
</script>

<style scoped lang="scss">
.page-container {
  padding: 24px;
  background: var(--bg-color);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);

  /* 标题卡片美化 */
  .info-card {
    background: linear-gradient(135deg, #00c6fb 0%, #005bea 100%);
    border: none;
    box-shadow: 0 8px 32px rgba(0, 198, 251, 0.15);
    padding: 32px;
    margin-bottom: 32px;
    border-radius: 24px;
    position: relative;
    overflow: hidden;
    min-height: 120px;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
      transform: rotate(-45deg);
      pointer-events: none;
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 198, 251, 0.25);
    }

    .info-card-content {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      height: 100%;
      min-height: 56px;

      .info-text {
        display: flex;
        flex-direction: column;
        gap: 8px;
        justify-content: center;

        .welcome-title {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin: 0;
          padding: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          line-height: 1.2;
        }

        .welcome-subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          padding: 0;
          line-height: 1.2;
        }
      }

      .el-button {
        align-self: center;
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 12px 24px;
        height: fit-content;
        transition: all 0.3s ease;
        margin: 0;
        white-space: nowrap;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
      }
    }
  }

  /* 搜索表单美化 */
  .search-form {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: var(--bg-color);
    border-radius: 12px;
    border: 2px solid var(--border-color);
    margin-bottom: 24px;

    .el-form-item {
      margin-bottom: 0 !important;
      flex: 1;
      min-width: 200px;

      :deep(.el-form-item__label) {
        color: var(--text-color);
      }

      &:last-child {
        flex: 0 0 auto;
        min-width: auto;
        display: flex;
        gap: 8px;
        margin-left: auto;
      }
    }
  }

  /* 表格美化 */
  .el-table {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;

    :deep(th.el-table__cell) {
      background-color: var(--el-color-primary-light-9);
      color: var(--text-color);
      font-weight: 600;
    }

    :deep(.el-table__row) {
      transition: all 0.3s ease;

      &:hover {
        background-color: var(--el-color-primary-light-9) !important;
        transform: translateY(-2px);
      }
    }

    .el-button {
      &.is-circle {
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px) scale(1.1);
        }
      }
    }
  }

  /* 分页器美化 */
  .pagination {
    margin-top: 24px;
    padding: 16px;
    background: var(--bg-color);
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--border-color);

    :deep(.el-pagination) {
      justify-content: flex-end;
      
      .el-pagination__total,
      .el-pagination__sizes,
      .el-pagination__jump {
        margin-right: 16px;
      }

      .el-pagination__sizes .el-input__inner {
        border-radius: 8px;
      }

      button {
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
        }
      }

      .el-pager li {
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
        }

        &.active {
          background-color: var(--el-color-primary);
          color: white;
        }
      }
    }
  }

  /* 对话框美化 */
  :deep(.el-dialog) {
    background-color: var(--bg-color) !important;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

    .el-dialog__header {
      padding: 20px 24px;
      margin: 0;
      border-bottom: 1px solid var(--border-color);
      background-color: var(--bg-color);

      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-color);
      }
    }

    .el-dialog__body {
      padding: 24px;
      background-color: var(--bg-color);

      .el-form-item {
        margin-bottom: 24px;

        .el-form-item__label {
          color: var(--text-color);
          padding-bottom: 8px;
        }

        .el-input__wrapper {
          background-color: var(--bg-color);
          border: 2px solid var(--border-color);
          box-shadow: none !important;
          width: 100%;

          .el-input__inner {
            color: var(--text-color);
            background-color: var(--bg-color);

            &::placeholder {
              color: var(--el-text-color-placeholder);
            }
          }
        }
      }
    }

    .el-dialog__footer {
      padding: 16px 24px;
      background-color: var(--bg-color);
      border-top: 1px solid var(--border-color);
    }
  }
}

/* 对话框表单样式 */
.dialog-form {
  :deep(.el-form-item) {
    display: block !important;
    width: 100%;
    margin-bottom: 22px;

    .el-form-item__label {
      display: block;
      text-align: left;
      padding: 0 0 8px 0;
      margin-bottom: 8px;
      color: var(--text-color);
      line-height: 1.5;
    }

    .el-form-item__content {
      display: block;
      margin-left: 0 !important;
      width: 100%;

      .el-input {
        width: 100%;

        .el-input__wrapper {
          width: 100%;
        }
      }
    }
  }
}
</style>
