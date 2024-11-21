<template>
  <div class="gallery-main">
    <!-- 调试信息 -->
    <div v-if="debugInfo" class="debug-info mb-4 p-2 bg-gray-100 rounded">
      {{ debugInfo }}
    </div>

    <!-- 排序按钮 -->
    <div class="flex justify-end mb-4 px-4">
      <el-button type="danger" @click="sortByLikes" class="mr-2">最热</el-button>
      <el-button type="success" @click="sortByLatest">最新</el-button>
    </div>

    <!-- 空状态 -->
    <div v-if="drawRecords.length === 0" class="empty text-center text-gray-500 mt-12">
      <span>暂无绘图记录</span>
    </div>

    <!-- 瀑布流布局 -->
    <div class="masonry-container px-4">
      <div v-for="item in drawRecords" :key="item.id"
        class="masonry-item img-item rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all bg-white mb-4 relative group"
        @click="openDialog(item)">
        <img :src="item.imageUrl" :alt="item.prompt" class="w-full h-auto object-cover" />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="dialogVisible" title="绘图详情" custom-class="full-screen-dialog" :close-on-click-modal="true">
      <template v-if="selectedRecord">
        <div class="dialog-content">
          <!-- 图片展示 -->
          <div class="image-container">
            <img :src="selectedRecord.imageUrl" :alt="selectedRecord.prompt" class="dialog-image rounded-lg" />
          </div>
          <!-- 信息表格 -->
          <div class="info-container">
            <table class="info-table">
              <tbody>
                <tr>
                  <th>提示词：</th>
                  <td>{{ selectedRecord.prompt }}</td>
                </tr>
                <tr>
                  <th>点赞数：</th>
                  <td>{{ selectedRecord.likeCount || 0 }}</td>
                </tr>
                <tr>
                  <th>生成类型：</th>
                  <td>{{ selectedRecord.generationType || '未知' }}</td>
                </tr>
                <tr>
                  <th>用户ID：</th>
                  <td>{{ selectedRecord.userId }}</td>
                </tr>
                <!-- 可根据需要添加更多信息 -->
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 引入API函数  
import {
  listAllDrawRecords,
  listDrawRecordsSortedByLikes,
  listDrawRecordsSortedByLatest,
} from '@/api/drawRecords'

// 响应式变量  
const drawRecords = ref([])
const dialogVisible = ref(false)
const selectedRecord = ref(null)
const debugInfo = ref('')

// 获取所有绘图记录  
const fetchDrawRecords = async () => {
  try {
    const response = await listAllDrawRecords()

    if (response.code === 200 && response.data) {
      // 对图片进行预处理，确保图片加载  
      drawRecords.value = response.data.map((record) => ({
        ...record,
        imageUrl: record.imageUrl || 'default-placeholder.png',
      }))
      // 显示成功消息  
      ElMessage.success(`成功获取 ${drawRecords.value.length} 条记录`)
    } else {
      debugInfo.value = response.message || '未找到数据'
      ElMessage.warning(debugInfo.value)
    }
  } catch (error) {
    debugInfo.value = `获取数据失败: ${error.message}`
    ElMessage.error(debugInfo.value)
    console.error('获取数据失败:', error)
  }
}

// 按点赞数排序  
const sortByLikes = async () => {
  try {
    const response = await listDrawRecordsSortedByLikes()
    if (response.code === 200 && response.data) {
      drawRecords.value = response.data
      ElMessage.success('已按点赞数排序')
    }
  } catch (error) {
    ElMessage.error('排序失败')
    console.error('排序失败:', error)
  }
}

// 按最新时间排序  
const sortByLatest = async () => {
  try {
    const response = await listDrawRecordsSortedByLatest()
    if (response.code === 200 && response.data) {
      drawRecords.value = response.data
      ElMessage.success('已按最新时间排序')
    }
  } catch (error) {
    ElMessage.error('排序失败')
    console.error('排序失败:', error)
  }
}

// 打开详情弹窗  
const openDialog = async (record) => {
  selectedRecord.value = record
  dialogVisible.value = true
}

// 组件挂载时获取数据  
onMounted(fetchDrawRecords)  
</script>

<style scoped>
.masonry-container {
  column-count: 4;
  column-gap: 1em;
  width: 100%;
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 1em;
}

.masonry-item img {
  width: 100%;
  height: auto;
}

@media screen and (max-width: 1024px) {
  .masonry-container {
    column-count: 3;
  }
}

@media screen and (max-width: 768px) {
  .masonry-container {
    column-count: 2;
  }
}

@media screen and (max-width: 480px) {
  .masonry-container {
    column-count: 1;
  }
}

.debug-info {
  background-color: #f0f0f0;
}

.img-item:hover {
  transform: scale(1.02);
}

/* 添加动画效果 */
.group:hover .opacity-0 {
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
}

/* 全屏弹窗样式 */
.full-screen-dialog {
  /* 使用 ::v-deep 选择器以覆盖 ElDialog 的内部样式 */
}

.full-screen-dialog ::v-deep .el-dialog {
  background: rgba(255, 255, 255, 0.3) !important;
  /* 半透明背景 */
  backdrop-filter: blur(10px);
  /* 磨砂效果 */
  border: none;
  border-radius: 12px;
  /* 可选：稍微圆角 */
  box-shadow: none;
  /* 去除默认阴影 */
}

.full-screen-dialog ::v-deep .el-dialog__header {
  display: none;
  /* 隐藏头部标题 */
}

.full-screen-dialog ::v-deep .el-dialog__body {
  padding: 20px;
  overflow: auto;
  background: rgba(255, 255, 255, 0.2) !important;
  /* 更低的透明度 */
  backdrop-filter: blur(10px);
  /* 磨砂效果 */
}

/* 弹窗内容布局 */
.dialog-content {
  display: flex;
  flex-direction: row;
  height: 100%;
}

/* 图片容器 */
.image-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* 图片样式 */
.dialog-image {
  max-width: 100%;
  max-height: 80vh;
  width: auto;
  height: auto;
  border-radius: 8px;
}

/* 信息表格容器 */
.info-container {
  flex: 1;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  /* 为信息区域添加轻微透明背景 */
  border-radius: 8px;
}

/* 信息表格样式 */
.info-table {
  width: 100%;
  border-collapse: collapse;
}

.info-table th,
.info-table td {
  padding: 10px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
  /* 调整文字颜色以提高对比度 */
}

.info-table th {
  width: 120px;
  background-color: rgba(255, 255, 255, 0.3);
  /* 半透明背景 */
}

/* 关闭按钮样式（可选） */
.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  font-size: 24px;
  cursor: pointer;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.8);
}
</style>