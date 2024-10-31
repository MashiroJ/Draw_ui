<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>用户管理</span>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增用户</el-button>
      </div>
    </template>

    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="68px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable style="width: 240px"
          @keyup.enter="getUsers" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phone">
        <el-input v-model="queryParams.phone" placeholder="请输入手机号码" clearable style="width: 240px"
          @keyup.enter="getUsers" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="用户状态" clearable style="width: 240px"
          @change="handleStatusChange">
          <el-option label="正常" value="正常"></el-option>
          <el-option label="禁用" value="禁用"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getUsers">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 用户列表 -->
    <el-table v-loading="loading" :data="users" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="用户编号" align="center" prop="id" />
      <el-table-column label="用户名" align="center" prop="username" :show-overflow-tooltip="true" />
      <el-table-column label="手机号码" align="center" prop="phone" width="120" />
      <el-table-column label="状态" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.status" active-value="正常" inactive-value="禁用" @change="handleStatusChange(row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class="small-padding fixed-width">
        <template #default="{ row }">
          <el-button :icon="Edit" circle plain type="primary" @click="handleEdit(row)" />
          <el-button :icon="Delete" circle plain type="danger" @click="handleDelete(row)" />
          <el-button :icon="User" circle plain type="success" @click="handleAssignRole(row)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[5, 10, 15, 20]"
      layout="total, sizes, prev, pager, next" background :total="total" @size-change="onSizeChange"
      @current-change="onCurrentChange" style="margin-top: 20px; justify-content: flex-end" />

    <!-- 新增/修改用户对话框 -->
    <el-dialog :title="formTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="isAdd">
          <el-input v-model="form.password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" v-model="assignRoleDialogVisible" width="500px">
      <el-form :model="assignRoleForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="assignRoleForm.username" disabled />
        </el-form-item>
        <el-form-item label="角色">
          <el-radio-group v-model="assignRoleForm.role">
            <el-radio v-for="role in allRoles" :key="role.id" :label="role.id">{{ role.name }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignRoleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAssignRole">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { Edit, Delete, User } from '@element-plus/icons-vue';
import { ref, reactive, nextTick } from 'vue';
import { ElNotification, ElMessageBox } from 'element-plus';
import {
  getUserList,
  updateUserStatus,
  deleteUser,
  addUser,
  updateUser,
  getUserRoles,
  grantUserRole,
  deleteUserRole
} from '@/api/user';
import { getRoleList } from '@/api/role';

// 用户列表数据模型
const users = ref([]);

// 分页数据模型
const pageNum = ref(1);
const pageSize = ref(5);
const total = ref(0);

// 搜索参数
const queryParams = reactive({
  username: '',
  phone: '',
  status: null // 添加状态
});

// 加载状态
const loading = ref(false);

// 获取用户列表
const getUsers = async () => {
  const params = {
    current: pageNum.value,
    size: pageSize.value,
    username: queryParams.username || null,
    phone: queryParams.phone || null,
    status: queryParams.status || null // 传入状态
  };
  try {
    loading.value = true; // 开始加载
    const result = await getUserList(params);
    users.value = result.data.records || [];
    total.value = result.data.total || 0;
  } catch (error) {
    ElNotification.error('获取用户数据失败');
  } finally {
    loading.value = false; // 结束加载
  }
};

// 重置搜索条件
const resetQuery = () => {
  queryParams.username = '';
  queryParams.phone = '';
  queryParams.status = null; // 重置状态
  getUsers();
};

// 处理状态切换
const handleStatusChange = async (row) => {
  try {
    await updateUserStatus(row.id, row.status);
    ElNotification.success('用户状态更新成功');
    getUsers(); // 重新加载用户数据以反映更改
  } catch (error) {
    ElNotification.error('更新失败');
  }
};

// 新增/修改用户对话框相关
const dialogVisible = ref(false);
const isAdd = ref(true);
const formTitle = ref('');
const form = reactive({
  id: null,
  username: '',
  password: '',
  phone: ''
});

const rules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号码', trigger: 'blur' }]
});

const formRef = ref(null);

// 打开新增用户对话框
const handleAdd = () => {
  isAdd.value = true;
  formTitle.value = '新增用户';
  form.id = null;
  form.username = '';
  form.password = '';
  form.phone = '';
  dialogVisible.value = true;
};

// 打开编辑用户对话框
const handleEdit = (row) => {
  isAdd.value = false;
  formTitle.value = '修改用户';
  form.id = row.id;
  form.username = row.username;
  form.password = ''; // 编辑时不显示密码
  form.phone = row.phone;
  dialogVisible.value = true;
};

// 提交表单
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (isAdd.value) {
        try {
          await addUser(form);
          ElNotification.success('新增用户成功');
          dialogVisible.value = false;
          getUsers();
        } catch (error) {
          ElNotification.error('新增用户失败');
        }
      } else {
        try {
          await updateUser(form);
          ElNotification.success('修改用户成功');
          dialogVisible.value = false;
          getUsers();
        } catch (error) {
          ElNotification.error('修改用户失败');
        }
      }
    }
  });
};

// 处理删除用户
const handleDelete = async (row) => {
  await ElMessageBox.confirm('此操作将永久删除该用户, 是否继续?', '提示', {
    confirmButtonText: '继续',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteUser(row.id);
      ElNotification.success('删除成功');
      getUsers();
    } catch (error) {
      ElNotification.error('删除失败');
    }
  });
};

// 分配角色相关
const assignRoleDialogVisible = ref(false);
const assignRoleForm = reactive({
  username: '',
  role: null
});
const allRoles = ref([]);

// 打开分配角色对话框
const handleAssignRole = (row) => {
  assignRoleDialogVisible.value = true;
  assignRoleForm.username = row.username;
  getRoleList().then(result => {
    allRoles.value = result.data || [];
  });
};

// 提交分配角色
const submitAssignRole = async () => {
  try {
    await grantUserRole(assignRoleForm.username, assignRoleForm.role);
    ElNotification.success('角色分配成功');
    assignRoleDialogVisible.value = false;
  } catch (error) {
    ElNotification.error('角色分配失败');
  }
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

// 初次加载用户列表
getUsers();
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
