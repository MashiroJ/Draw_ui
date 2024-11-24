<!-- src/components/User.vue -->
<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>用户管理</span>
        <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAdd">新增用户</el-button>
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
} from '@/api/user';
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

// 新增/修改对话框
const dialogVisible = ref(false);
const isAdd = ref(true);
const formTitle = ref('');
const form = reactive({
  id: null,
  username: '',
  password: '',
  phone: '',
});
const formRef = ref(null);

// 主题存储
const themeStore = useThemeStore();

// 处理新增用户
const handleAdd = () => {
  isAdd.value = true;
  formTitle.value = '新增用户';
  form.id = null;
  form.username = '';
  form.password = '';
  form.phone = '';
  dialogVisible.value = true;
};

// 处理编辑用户
const handleEdit = (row) => {
  isAdd.value = false;
  formTitle.value = '修改用户';
  form.id = row.id;
  form.username = row.username;
  form.password = '';
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

// 分页变化
const onSizeChange = (size) => {
  pageSize.value = size;
  getUsers();
};

const onCurrentChange = (page) => {
  pageNum.value = page;
  getUsers();
};

// 初始化加载数据
onMounted(() => {
  getUsers();
});
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background-color: var(--bg-color);
  color: var(--text-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px var(--border-color);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--header-bg);
  padding: 10px;
  border-radius: 4px;
}

.dialog-footer {
  text-align: right;
}

.el-table {
  background-color: var(--bg-color);
  color: var(--text-color);
}

/* 使用 :deep() 深入覆盖 el-pagination 的内部样式 */
.pagination :deep(.el-pagination) {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
}

.pagination :deep(.el-pagination__total),
.pagination :deep(.el-pagination__sizes),
.pagination :deep(.el-pagination__jump),
.pagination :deep(.el-pagination__rightwrapper) {
  color: var(--text-color);
}

.pagination :deep(.el-pagination__button),
.pagination :deep(.el-pagination__prev),
.pagination :deep(.el-pagination__next),
.pagination :deep(.el-pagination__page-link) {
  background-color: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

/* 鼠标悬停状态 */
.pagination :deep(.el-pagination__button:hover),
.pagination :deep(.el-pagination__prev:hover),
.pagination :deep(.el-pagination__next:hover),
.pagination :deep(.el-pagination__page-link:hover) {
  background-color: var(--menu-hover);
  color: var(--text-color);
}

/* 活动状态 */
.pagination :deep(.el-pagination__button.is-active),
.pagination :deep(.el-pagination__prev.is-active),
.pagination :deep(.el-pagination__next.is-active),
.pagination :deep(.el-pagination__page-link.is-active) {
  background-color: var(--header-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

/* 分页中的页码文本 */
.pagination :deep(.el-pagination__pager li) {
  color: var(--text-color);
}

/* 分页中的输入框和下拉菜单 */
.pagination :deep(.el-pagination__jump input),
.pagination :deep(.el-pagination__sizes select) {
  color: var(--text-color);
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
}

/* 分页中的跳转按钮 */
.pagination :deep(.el-pagination__jump button) {
  color: var(--text-color);
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
}

.pagination :deep(.el-pagination__jump button:hover) {
  background-color: var(--menu-hover);
  color: var(--text-color);
}

.pagination :deep(.el-pagination__jump button.is-active) {
  background-color: var(--header-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}
</style>
