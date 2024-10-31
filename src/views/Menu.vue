<script setup>
import {
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useMenuListService } from '@/api/menu.js'
import { onMounted } from 'vue';

const menuList = ref([]);

const getMenuList = async () => {
  const result = await useMenuListService();
  console.log(result);

  if (result && result.data) {
    menuList.value = result.data;
  }
}
onMounted(() => {
  getMenuList();
})

</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>菜单管理</span>
        <div class="extra">
          <el-button type="primary">添加菜单</el-button>
        </div>
      </div>
    </template>
    <el-table :data="menuList" style="width: 100%">
      <el-table-column label="序号" width="100" type="index"> </el-table-column>
      <el-table-column label="菜单名称" prop="name"></el-table-column>
      <el-table-column label="路径" prop="path"></el-table-column>
      <el-table-column label="权限符" prop="permission"></el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button :icon="Edit" circle plain type="primary"></el-button>
          <el-button :icon="Delete" circle plain type="danger"></el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="没有数据" />
      </template>
    </el-table>
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