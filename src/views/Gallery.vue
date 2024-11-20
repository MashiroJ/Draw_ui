<template>
  <div class="container mx-auto p-4">
    <!-- 排序按钮 -->
    <div class="flex justify-between mb-4">
      <div>
        <el-button type="danger" @click="sortByLikes">最热</el-button>
        <el-button type="success" @click="sortByLatest">最新</el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center">加载中...</div>

    <!-- 绘图记录网格 -->
    <div v-else class="flex flex-wrap justify-center gap-4">
      <el-card v-for="record in drawRecords" :key="record.id"
        class="border rounded-lg p-2 cursor-pointer hover:shadow-lg transition-shadow w-1/2 sm:w-1/3 md:w-1/4"
        @click="openDialog(record)">
        <img :src="record.imageUrl" :alt="record.prompt" class="w-full h-48 object-cover rounded" />
      </el-card>
    </div>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" title="绘图记录" @close="dialogVisible = false" width="600px">
      <el-row :gutter="20">
        <!-- 图片部分 -->
        <el-col :span="12">
          <img :src="selectedRecord?.imageUrl" :alt="selectedRecord?.prompt" class="w-full h-auto rounded" />
        </el-col>

        <!-- 信息部分 -->
        <el-col :span="12">
          <el-descriptions border column="1">
            <el-descriptions-item label="提示词">{{ selectedRecord?.prompt }}</el-descriptions-item>
            <el-descriptions-item label="点赞数">
              <div class="flex items-center">
                <Star />
                <span>{{ selectedRecord?.likeCount }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="生成类型">{{ selectedRecord?.generationType }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { ElButton, ElCard, ElDialog, ElRow, ElCol, ElDescriptions, ElDescriptionsItem } from 'element-plus';
import { Star } from '@element-plus/icons-vue';
import {
  listAllDrawRecords,
  listDrawRecordsSortedByLikes,
  listDrawRecordsSortedByLatest,
} from '@/api/drawRecords';

export default {
  name: 'DrawRecords',
  components: {
    ElButton,
    ElCard,
    ElDialog,
    ElRow,
    ElCol,
    ElDescriptions,
    ElDescriptionsItem,
    Star,
  },
  setup() {
    const drawRecords = ref([]);
    const loading = ref(true);
    const dialogVisible = ref(false);
    const selectedRecord = ref(null);

    const fetchDrawRecords = async () => {
      loading.value = true;
      try {
        const response = await listAllDrawRecords();
        if (response.code === 200) {
          drawRecords.value = response.data.map(record => ({
            ...record,
            isPublic: true,
          }));
        } else {
          console.error(response.message);
        }
      } catch (error) {
        console.error('获取绘图记录失败:', error);
      } finally {
        loading.value = false;
      }
    };

    const sortByLikes = async () => {
      loading.value = true;
      try {
        const response = await listDrawRecordsSortedByLikes();
        if (response.code === 200) {
          drawRecords.value = response.data;
        } else {
          console.error(response.message);
        }
      } catch (error) {
        console.error('按点赞数排序失败:', error);
      } finally {
        loading.value = false;
      }
    };

    const sortByLatest = async () => {
      loading.value = true;
      try {
        const response = await listDrawRecordsSortedByLatest();
        if (response.code === 200) {
          drawRecords.value = response.data;
        } else {
          console.error(response.message);
        }
      } catch (error) {
        console.error('按创建时间排序失败:', error);
      } finally {
        loading.value = false;
      }
    };

    const openDialog = (record) => {
      selectedRecord.value = record; // 确保选中的记录被赋值  
      dialogVisible.value = true; // 打开弹窗  
    };

    onMounted(fetchDrawRecords);

    return {
      drawRecords,
      loading,
      sortByLikes,
      sortByLatest,
      dialogVisible,
      selectedRecord,
      openDialog,
    };
  },
};  
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.flex {
  display: flex;
  flex-wrap: wrap;
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.transition-shadow {
  transition: box-shadow 0.3s ease;
}
</style>