<script setup>
import { Edit, Delete } from '@element-plus/icons-vue';
import { ref, reactive } from 'vue';
import { useMenuListService, saveOrUpdateMenu, deleteMenu } from '@/api/menu.js';
import { ElNotification, ElMessageBox } from 'element-plus';
import { onMounted } from 'vue';

const menuList = ref([]);

// 获取菜单列表
const getMenuList = async () => {
  const result = await useMenuListService();
  if (result && result.data) {
    menuList.value = result.data;
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
  }
};

// 删除菜单
const handleDelete = async (id) => {
  await ElMessageBox.confirm('此操作将永久删除该菜单, 是否继续?', '提示', {
    confirmButtonText: '继续',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteMenu(id);
      ElNotification.success('菜单删除成功');
      getMenuList();
    } catch (error) {
      ElNotification.error('删除菜单失败');
    }
  });
};

// 页面加载时获取菜单列表
onMounted(() => {
  getMenuList();
});
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>菜单管理</span>
        <div class="extra">
          <el-button type="primary" @click="openDialog">添加菜单</el-button>
        </div>
      </div>
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
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="form.path" placeholder="请输入菜单路径" />
        </el-form-item>
        <el-form-item label="权限符" prop="permission">
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
  min-height: 100%;
  box-sizing: border-box;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
