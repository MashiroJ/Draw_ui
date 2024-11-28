<script setup>
import { Edit, Delete, Search } from '@element-plus/icons-vue';
import { ref, reactive, onMounted, computed } from 'vue';
import { useMenuListService, saveOrUpdateMenu, deleteMenu } from '@/api/menu.js';
import { ElNotification, ElMessageBox } from 'element-plus';
import * as ElementPlusIcons from '@element-plus/icons-vue';

// 图标映射
const iconMap = {};
for (const [key, component] of Object.entries(ElementPlusIcons)) {
  iconMap[key] = component;
}

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
  permission: '',
  icon: '',
  sortOrder: 0,
  status: 1,
  isVisible: 1
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
    form.icon = menu.icon || '';
    form.sortOrder = menu.sortOrder || 0;
    form.status = menu.status !== undefined ? menu.status : 1;
    form.isVisible = menu.isVisible !== undefined ? menu.isVisible : 1;
  } else {
    isEdit.value = false;
    form.id = null;
    form.name = '';
    form.path = '';
    form.permission = '';
    form.icon = '';
    form.sortOrder = 0;
    form.status = 1;
    form.isVisible = 1;
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

// 获取菜单对应的图标
const getMenuIcon = (iconName) => {
  return iconMap[iconName] || ElementPlusIcons.Management;
};

// 处理状态变更
const handleStatusChange = async (row) => {
  try {
    await saveOrUpdateMenu(row);
    ElNotification.success('状态更新成功');
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1; // 恢复状态
    ElNotification.error('状态更新失败');
  }
};

// 处理可见性变更
const handleVisibleChange = async (row) => {
  try {
    await saveOrUpdateMenu(row);
    ElNotification.success('可见性更新成功');
  } catch (error) {
    row.isVisible = row.isVisible === 1 ? 0 : 1; // 恢复状态
    ElNotification.error('可见性更新失败');
  }
};

// 页面加载时获取菜单列表
onMounted(() => {
  getMenuList();
});

// 图标选择对话框相关
const iconDialogVisible = ref(false);
const selectedIcon = ref('');
const iconSearchText = ref('');

// 搜索过滤图标
const filteredIcons = computed(() => {
  const search = iconSearchText.value.toLowerCase();
  return Object.keys(iconMap).filter(name =>
    name.toLowerCase().includes(search)
  );
});

// 选择图标
const handleSelectIcon = (iconName) => {
  form.icon = iconName;
  iconDialogVisible.value = false;
};
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <el-card class="info-card welcome-card" style="margin-bottom: 20px;">
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
      <el-table-column label="图标" align="center" width="80">
        <template #default="{ row }">
          <el-icon>
            <component :is="getMenuIcon(row.icon)" />
          </el-icon>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sortOrder" width="80" align="center" />
      <el-table-column label="权限符" prop="permission" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
        </template>
      </el-table-column>
      <el-table-column label="可见性" width="100" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.isVisible" :active-value="1" :inactive-value="0" @change="handleVisibleChange(row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center">
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
        <el-form-item label="图标" prop="icon">
          <div class="icon-select">
            <el-input v-model="form.icon" placeholder="请选择图标" readonly @click="iconDialogVisible = true">
              <template #prefix>
                <el-icon v-if="form.icon">
                  <component :is="iconMap[form.icon]" />
                </el-icon>
              </template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="99" />
        </el-form-item>
        <el-form-item label="权限符" prop="permission" :rules="[{ required: true, message: '请输入权限符', trigger: 'blur' }]">
          <el-input v-model="form.permission" placeholder="请输入权限符" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="可见性">
          <el-switch v-model="form.isVisible" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 图标选择对话框 -->
    <el-dialog title="选择图标" v-model="iconDialogVisible" width="800px" :close-on-click-modal="false">
      <div class="icon-dialog-content">
        <!-- 搜索框 -->
        <el-input v-model="iconSearchText" placeholder="搜索图标" clearable style="margin-bottom: 20px">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>

        <!-- 图标列表 -->
        <div class="icon-grid">
          <div v-for="name in filteredIcons" :key="name" class="icon-item" @click="handleSelectIcon(name)">
            <el-icon>
              <component :is="iconMap[name]" />
            </el-icon>
            <span class="icon-name">{{ name }}</span>
          </div>
        </div>
      </div>
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

        /* 针对菜单特有的选择器样式 */
        .el-select-dropdown {
          background-color: var(--bg-color);
          border: 2px solid var(--border-color);

          .el-select-dropdown__item {
            color: var(--text-color);

            &:hover {
              background-color: var(--el-color-primary-light-9);
            }

            &.selected {
              color: var(--el-color-primary);
              background-color: var(--el-color-primary-light-8);
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

/* 添加图标选择相关样式 */
.icon-dialog-content {
  .icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
    max-height: 60vh;
    overflow-y: auto;
    padding: 16px;
    background: var(--bg-color);
    border-radius: 8px;
    border: 1px solid var(--border-color);

    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      background: var(--bg-color);

      &:hover {
        background: var(--el-color-primary-light-9);
        transform: translateY(-2px);
        border-color: var(--el-color-primary-light-5);
      }

      .el-icon {
        font-size: 32px;
        color: var(--text-color);
      }

      .icon-name {
        font-size: 12px;
        color: var(--text-color);
        text-align: center;
        word-break: break-all;
      }
    }
  }
}

/* 自定义滚动条样式 */
.icon-grid::-webkit-scrollbar {
  width: 6px;
}

.icon-grid::-webkit-scrollbar-thumb {
  background: var(--el-color-primary-light-5);
  border-radius: 3px;
}

.icon-grid::-webkit-scrollbar-track {
  background: var(--el-color-primary-light-9);
  border-radius: 3px;
}
</style>
