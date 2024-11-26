<script setup>
import { Edit, Delete } from '@element-plus/icons-vue';
import { ref, reactive, onMounted } from 'vue';
import { useMenuListService, saveOrUpdateMenu, deleteMenu } from '@/api/menu.js';
import { ElNotification, ElMessageBox } from 'element-plus';

const menuList = ref([]);

// 获取菜单列表
const getMenuList = async () => {
  try {
    const result = await useMenuListService();
    if (result && result.data) {
      menuList.value = result.data;
    } else {
      ElNotification.warning('未获取到菜单数据');
    }
  } catch (error) {
    ElNotification.error('获取菜单列表失败');
    console.error(error);
  }
};

// 新增/编辑菜单对话框相关
const dialogVisible = ref(false);
const form = reactive({
  id: null,
  name: '',
  path: '',
  permission: ''
});
const isEdit = ref(false);

// 打开对话框
const openDialog = (menu = null) => {
  if (menu) {
    isEdit.value = true;
    form.id = menu.id;
    form.name = menu.name;
    form.path = menu.path;
    form.permission = menu.permission;
  } else {
    isEdit.value = false;
    form.id = null;
    form.name = '';
    form.path = '';
    form.permission = '';
  }
  dialogVisible.value = true;
};

// 提交菜单数据
const submitForm = async () => {
  try {
    await saveOrUpdateMenu(form);
    ElNotification.success(isEdit.value ? '菜单更新成功' : '菜单添加成功');
    dialogVisible.value = false;
    getMenuList();
  } catch (error) {
    ElNotification.error(isEdit.value ? '菜单更新失败' : '菜单添加失败');
    console.error(error);
  }
};

// 删除菜单
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('此操作将永久删除该菜单, 是否继续?', '提示', {
      confirmButtonText: '继续',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await deleteMenu(id);
    ElNotification.success('菜单删除成功');
    getMenuList();
  } catch (error) {
    if (error !== 'cancel') { // 排除用户取消的情况
      ElNotification.error('删除菜单失败');
      console.error(error);
    }
  }
};

// 页面加载时获取菜单列表
onMounted(() => {
  getMenuList();
});
</script>

<template>  
  <el-card class="page-container">  
    <template #header>  
      <el-card class="info-card" style="margin-bottom: 20px;">  
        <div class="info-card-content">  
          <div class="info-text">  
            <h2 class="welcome-title">菜单管理</h2>  
            <p class="welcome-subtitle">菜单分配与管理</p>  
          </div>  
          <el-button type="primary" icon="el-icon-plus" size="small" @click="openDialog">新增菜单</el-button>  
        </div>  
      </el-card>  
    </template> 

    <el-table :data="menuList" style="width: 100%">
      <el-table-column label="菜单编号" width="100" type="index" />
      <el-table-column label="菜单名称" prop="name" />
      <el-table-column label="路径" prop="path" />
      <el-table-column label="权限符" prop="permission" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button :icon="Edit" circle plain type="primary" @click="openDialog(row)" />
          <el-button :icon="Delete" circle plain type="danger" @click="handleDelete(row.id)" />
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="没有数据" />
      </template>
    </el-table>

    <!-- 新增/编辑菜单对话框 -->
    <el-dialog :title="isEdit ? '编辑菜单' : '新增菜单'" v-model="dialogVisible" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="菜单名称" prop="name" :rules="[{ required: true, message: '请输入菜单名称', trigger: 'blur' }]">
          <el-input v-model="form.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路径" prop="path" :rules="[{ required: true, message: '请输入菜单路径', trigger: 'blur' }]">
          <el-input v-model="form.path" placeholder="请输入菜单路径" />
        </el-form-item>
        <el-form-item label="权限符" prop="permission" :rules="[{ required: true, message: '请输入权限符', trigger: 'blur' }]">
          <el-input v-model="form.permission" placeholder="请输入权限符" />
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
  }

  /* 对话框美化 */
  :deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

    .el-dialog__header {
      padding: 20px 24px;
      margin: 0;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-color);

      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-color);
      }
    }

    .el-dialog__body {
      padding: 24px;
      background: var(--bg-color);

      .el-form-item {
        margin-bottom: 20px;

        .el-input__inner {
          border-radius: 8px;
          transition: all 0.3s ease;

          &:hover, &:focus {
            border-color: var(--el-color-primary);
            box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
          }
        }
      }
    }

    .el-dialog__footer {
      padding: 16px 24px;
      background: var(--bg-color);
      border-top: 1px solid var(--border-color);

      .el-button {
        padding: 8px 20px;
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
        }
      }
    }
  }

  /* Empty 状态美化 */
  :deep(.el-empty) {
    padding: 40px 0;
    
    .el-empty__image {
      width: 120px;
      height: 120px;
    }
    
    .el-empty__description {
      margin-top: 16px;
      color: var(--text-color);
      font-size: 14px;
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
