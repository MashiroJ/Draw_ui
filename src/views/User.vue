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
          <el-switch
            v-model="row.status"
            active-value="正常"
            inactive-value="禁用"
            @change="handleStatusChange(row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class="small-padding fixed-width">
        <template #default="{ row }">
          <el-button :icon="Edit" circle plain type="primary" @click="handleEdit(row)" />
          <el-button :icon="Delete" circle plain type="danger" @click="handleDelete(row)" />
          <!-- 分配角色按钮 -->
          <el-button :icon="User" circle plain type="success" @click="handleAssignRole(row)" />
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
      style="margin-top: 20px; justify-content: flex-end"
    />

    <!-- 新增/修改用户对话框 -->
    <el-dialog :title="formTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <!-- 密码输入框（仅在新增时显示） -->
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
const pageNum = ref(1); // 当前页
const pageSize = ref(5); // 每页条数
const total = ref(0); // 总条数

// 搜索参数
const queryParams = reactive({
  username: '',
  phone: ''
});

// 加载状态
const loading = ref(false);

// 分页大小改变时触发
const onSizeChange = (size) => {
  pageSize.value = size;
  getUsers();
};

// 当前页改变时触发
const onCurrentChange = (num) => {
  pageNum.value = num;
  getUsers();
};

// 获取用户列表
const getUsers = async () => {
  const params = {
    current: pageNum.value,
    size: pageSize.value,
    username: queryParams.username || null,
    phone: queryParams.phone || null
  };
  try {
    loading.value = true; // 开始加载
    const result = await getUserList(params);
    users.value = result.data.records || []; // 确保返回数组
    total.value = result.data.total || 0;
    // ElNotification.success('获取用户数据成功'); // 可以省略，以减少干扰
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
  getUsers();
};

// 处理表格选择事件
const handleSelectionChange = (selection) => {
  // 处理选择的行数据
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
  password: '', // 新增密码字段
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
  form.password = ''; // 清空密码
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
        // 新增用户
        try {
          await addUser(form);
          ElNotification.success('新增用户成功');
          dialogVisible.value = false;
          getUsers();
        } catch (error) {
          ElNotification.error('新增用户失败');
        }
      } else {
        // 修改用户
        try {
          await updateUser(form);
          ElNotification.success('修改用户成功');
          dialogVisible.value = false;
          getUsers();
        } catch (error) {
          ElNotification.error('修改用户失败');
        }
      }
    } else {
      return false;
    }
  });
};

// 处理删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm('此操作将永久删除该用户, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await deleteUser(row.id);
        ElNotification.success('用户删除成功');
        getUsers();
      } catch (error) {
        ElNotification.error('删除失败');
      }
    })
    .catch(() => {
      // 用户取消操作
    });
};

// 分配角色对话框的可见性
const assignRoleDialogVisible = ref(false);

// 分配角色表单数据
const assignRoleForm = reactive({
  username: '',
  userId: null,
  role: null // 初始化为 null
});

// 所有角色列表
const allRoles = ref([]);

// 获取所有角色
const fetchAllRoles = async () => {
  try {
    const result = await getRoleList();
    allRoles.value = result.data.map((role) => ({
      id: String(role.id), // 确保角色ID为字符串
      name: role.name
    }));
    console.log('All Roles:', allRoles.value);
  } catch (error) {
    ElNotification.error('获取角色列表失败');
  }
};

// 获取用户已分配的角色
const fetchUserRole = async (userId) => {
  try {
    const result = await getUserRoles(userId);
    console.log('User Roles:', result.data);
    // 如果 result.data 是角色名称字符串
    if (result.data) {
      // 在 allRoles 中查找匹配的角色
      const role = allRoles.value.find((r) => r.name === result.data);
      if (role) {
        assignRoleForm.role = role.id; // 赋值角色 ID
      } else {
        assignRoleForm.role = null;
      }
    } else {
      assignRoleForm.role = null;
    }
    console.log('Assigned Role:', assignRoleForm.role);
  } catch (error) {
    ElNotification.error('获取用户角色失败');
  }
};

// 处理分配角色按钮点击事件
const handleAssignRole = async (row) => {
  assignRoleDialogVisible.value = false; // 先关闭对话框
  assignRoleForm.username = row.username;
  assignRoleForm.userId = row.id;
  await fetchAllRoles();
  await fetchUserRole(row.id);
  await nextTick();
  assignRoleDialogVisible.value = true; // 再打开对话框
};

// 提交分配角色的更改
const submitAssignRole = async () => {
  try {
    const userId = assignRoleForm.userId;
    const newRole = assignRoleForm.role;

    // 获取用户原有的角色名称
    const oldRoleResult = await getUserRoles(userId);
    let oldRoleId = null;
    if (oldRoleResult.data) {
      // 在 allRoles 中查找对应的角色 ID
      const oldRole = allRoles.value.find((r) => r.name === oldRoleResult.data);
      if (oldRole) {
        oldRoleId = oldRole.id;
      }
    }

    console.log('Old Role ID:', oldRoleId);
    console.log('New Role ID:', newRole);

    if (newRole !== oldRoleId) {
      // 如果有旧角色，先删除旧角色
      if (oldRoleId) {
        await deleteUserRole(userId, oldRoleId);
      }
      // 分配新角色
      if (newRole) {
        await grantUserRole(userId, newRole);
      }
    }

    ElNotification.success('用户角色更新成功');
    assignRoleDialogVisible.value = false;
    getUsers(); // 重新加载用户列表
  } catch (error) {
    ElNotification.error('用户角色更新失败');
  }
};

// 初始化时获取用户数据
getUsers();
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100%;
  box-sizing: border-box;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .small-padding .el-button {
    padding: 2px 5px;
  }

  .fixed-width {
    width: 200px;
  }
}
</style>
