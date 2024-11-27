<template>  
  <el-card class="page-container">  
    <template #header>  
      <el-card class="info-card" style="margin-bottom: 20px;">  
        <div class="info-card-content">  
          <div class="info-text">  
            <h2 class="welcome-title">角色管理</h2>  
            <p class="welcome-subtitle">权限分配与管理</p>  
          </div>  
          <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAdd">新增角色</el-button>  
        </div>  
      </el-card>  
    </template>  

    <!-- 角色列表 -->
    <el-table v-loading="loading" :data="roles">
      <el-table-column label="角色编号" align="center" prop="id" />
      <el-table-column label="角色名称" align="center" prop="name" :show-overflow-tooltip="true" />
      <el-table-column label="描述" align="center" prop="description" :show-overflow-tooltip="true" />

      <!-- 状态列 -->
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

      <el-table-column label="操作" align="center" width="200" class="small-padding fixed-width">
        <template #default="{ row }">
          <el-button :icon="Edit" circle plain type="primary" @click="handleEdit(row)" />
          <el-button :icon="Delete" circle plain type="danger" @click="handleDelete(row)" />
          <el-button :icon="Menu" circle plain type="info" @click="viewRoleMenus(row)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/修改角色对话框 -->
    <el-dialog :title="formTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入角色描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看和编辑角色菜单对话框 -->
    <el-dialog :title="'分配菜单'" v-model="menuDialogVisible" width="500px">
      <el-form>
        <el-form-item label-width="100px">
          <el-checkbox-group v-model="form.menuIds">
            <el-checkbox v-for="menu in allMenus" :key="menu.id" :label="menu.id">
              {{ menu.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="menuDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRolePermissions">保存权限</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { Edit, Delete, Menu } from '@element-plus/icons-vue';
import { ref, reactive } from 'vue';
import { ElNotification, ElMessageBox } from 'element-plus';
import {
  getRoleList,
  saveOrUpdateRole,
  deleteRole,
  getMenuIdsByRoleId,
  updateRoleStatus,
} from '@/api/role';
import { useMenuListService } from '@/api/menu';

// 角色列表
const roles = ref([]);
const loading = ref(false);

// 获取角色列表
const getRoles = async () => {
  try {
    loading.value = true;
    const result = await getRoleList();
    roles.value = result.data || [];
  } catch (error) {
    ElNotification.error('获取角色数据失败');
  } finally {
    loading.value = false;
  }
};

// 更新角色状态
const handleStatusChange = async (row) => {
  const originalStatus = row.status === '正常' ? '禁用' : '正常'; // 用于回滚
  try {
    await updateRoleStatus(row.id, row.status);
    ElNotification.success(`角色状态已更新为 ${row.status}`);
  } catch (error) {
    ElNotification.error('更新角色状态失败');
    row.status = originalStatus; // 回滚状态
  }
};

// 新增/修改角色对话框
const dialogVisible = ref(false);
const isAdd = ref(true);
const formTitle = ref('');
const form = reactive({
  id: null,
  name: '',
  description: '',
  menuIds: [],
});
const rules = reactive({
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述信息', trigger: 'blur' }],
});
const formRef = ref(null);

// 查看和编辑角色菜单相关
const menuDialogVisible = ref(false);
const selectedRole = reactive({ id: null, name: '', description: '' });
const allMenus = ref([]);

// 获取菜单列表和角色已有权限
const viewRoleMenus = async (row) => {
  form.id = row.id;
  form.name = row.name;
  form.description = row.description;

  try {
    const roleMenuResult = await getMenuIdsByRoleId(row.id);
    form.menuIds = roleMenuResult.data.roleMenuIds || [];

    const menuResult = await useMenuListService();
    allMenus.value = menuResult.data || [];

    menuDialogVisible.value = true;
  } catch (error) {
    ElNotification.error('获取角色菜单失败');
  }
};

// 提交新增/编辑角色表单
const submitForm = () => {
  if (formRef.value) {
    formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          await saveOrUpdateRole(form);
          ElNotification.success(isAdd.value ? '新增角色成功' : '修改角色成功');
          dialogVisible.value = false;
          getRoles();
        } catch (error) {
          ElNotification.error(isAdd.value ? '新增角色失败' : '修改角色失败');
        }
      }
    });
  }
};

// 提交角色权限修改
const saveRolePermissions = async () => {
  try {
    await saveOrUpdateRole(form);
    ElNotification.success('角色权限已更新');
    menuDialogVisible.value = false;
    getRoles();
  } catch (error) {
    ElNotification.error('更新角色权限失败');
  }
};

// 打开新增角色对话框
const handleAdd = () => {
  isAdd.value = true;
  formTitle.value = '新增角色';
  form.id = null;
  form.name = '';
  form.description = '';
  form.menuIds = [];
  dialogVisible.value = true;
};

// 打开编辑角色对话框
const handleEdit = (row) => {
  isAdd.value = false;
  formTitle.value = '修改角色';
  form.id = row.id;
  form.name = row.name;
  form.description = row.description;
  form.menuIds = [];
  dialogVisible.value = true;
  viewRoleMenus(row);
};

// 删除角色
const handleDelete = async (row) => {
  await ElMessageBox.confirm('此操作将永久删除该角色, 是否继续?', '提示', {
    confirmButtonText: '继续',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteRole(row.id);
      ElNotification.success('删除成功');
      getRoles();
    } catch (error) {
      ElNotification.error('删除失败');
    }
  });
};

// 页面初始化
getRoles();
</script>

<style lang="scss" scoped>
.page-container {
  padding: 24px;
  background: var(--bg-color);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);

  /* 标题卡片美化 */
  .info-card {
    background: linear-gradient(135deg, var(--el-color-primary-light-7) 0%, var(--el-color-primary-light-9) 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    height: auto;
    padding: 20px 24px;
    margin-bottom: 24px;
    transition: all 0.3s ease;
    border-radius: 12px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    }

    .info-card-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .info-text {
        .welcome-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
          background: linear-gradient(45deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .welcome-subtitle {
          font-size: 14px;
          color: var(--text-color);
          opacity: 0.8;
        }
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
      padding: 16px 0;
    }

    :deep(.el-table__row) {
      transition: all 0.3s ease;

      &:hover {
        background-color: var(--el-color-primary-light-9) !important;
        transform: translateY(-2px);
      }

      td {
        padding: 16px 0;
      }
    }

    .el-button {
      &.is-circle {
        transition: all 0.3s ease;
        margin: 0 4px;
        
        &:hover {
          transform: translateY(-2px) scale(1.1);
        }
      }
    }

    /* Switch 开关美化 */
    :deep(.el-switch) {
      --el-switch-on-color: var(--el-color-success);
      --el-switch-off-color: var(--el-color-danger);
      
      &:hover {
        .el-switch__core {
          border-color: var(--el-color-primary);
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

/* 暗色模式适配 */
:deep(.el-table) {
  --el-table-border-color: var(--border-color);
  --el-table-border: 1px solid var(--border-color);
  --el-table-text-color: var(--text-color);
  --el-table-header-text-color: var(--text-color);
  --el-table-row-hover-bg-color: var(--el-color-primary-light-9);
  background-color: var(--bg-color);
  
  .el-table__cell {
    background-color: var(--bg-color);
  }
}
</style>