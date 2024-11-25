<template>
  <!-- 文生图标题卡片 -->
  <el-card class="info-card welcome-card" style="margin-bottom: 20px;">
    <div class="info-card-content welcome-content">
      <div class="info-text welcome-text">
        <h2 class="welcome-title">创艺馆</h2>
        <p class="welcome-subtitle">洞见美学 创意无限</p>
      </div>
    </div>
  </el-card>
  
  <div class="gallery-main">
    <!-- 控制按钮容器 -->
    <div class="controls">
      <!-- 画廊类型切换 -->
      <div class="gallery-type-switch">
        <el-radio-group v-model="galleryType" size="medium">
          <el-radio-button label="public">公共画廊</el-radio-button>
          <el-radio-button label="private">私人画廊</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 排序按钮 -->
      <div class="sort-buttons">
        <el-button type="danger" @click="sortByLikes" class="sort-button">
          <el-icon>
            <Star />
          </el-icon> 最热
        </el-button>
        <el-button type="success" @click="sortByLatest" class="sort-button">
          <el-icon>
            <Timer />
          </el-icon> 最新
        </el-button>
      </div>
    </div>

    <!-- 空状态展示 -->
    <div v-if="drawRecords.length === 0" class="empty-state">
      <el-empty :description="galleryType === 'public' ? '暂无公共绘图记录' : '暂无私人绘图记录'" />
    </div>

    <!-- 瀑布流画廊 -->
    <div v-else class="masonry-container">
      <div v-for="item in drawRecords" :key="item.id" class="masonry-item" @click="openDialog(item)">
        <img :src="item.imageUrl" :alt="item.prompt" />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="dialogVisible" title="绘图详情" custom-class="full-screen-dialog" :close-on-click-modal="true">
      <template v-if="selectedRecord">
        <div class="dialog-content">
          <div class="image-container">
            <img :src="selectedRecord.imageUrl" :alt="selectedRecord.prompt" class="dialog-image" />
          </div>
          <div class="info-container">
            <table class="info-table">
              <tbody>
                <tr>
                  <th>提示词：</th>
                  <td>{{ selectedRecord.prompt }}</td>
                </tr>
                <tr>
                  <th>生成时间：</th>
                  <td>{{ selectedRecord.createTime }}</td>
                </tr>
                <tr>
                  <th>点赞：</th>
                  <td class="like-container">
                    <span>{{ likeCount }}</span>
                    <el-button 
                      :type="isLiked ? 'primary' : 'danger'" 
                      :icon="isLiked ? StarFilled : Star" 
                      circle 
                      size="small" 
                      @click.stop="handleLike"
                      :loading="likeLoading" 
                    />
                  </td>
                </tr>
                <tr>
                  <th>生成类型：</th>
                  <td>{{ selectedRecord.generationType || '未知' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Star, StarFilled, Timer } from '@element-plus/icons-vue'
import {
  listAllDrawRecords,
  listDrawRecordsByUserId,
  listDrawRecordsSortedByLikes,
  listDrawRecordsSortedByLatest
} from '@/api/drawRecords'
import { toggleLike, getLikeCount } from '@/api/drawLike'
import { useUserInfoStore } from '@/stores/userinfo'

// 状态定义
const userInfoStore = useUserInfoStore()
const galleryType = ref('public')
const drawRecords = ref([])
const dialogVisible = ref(false)
const selectedRecord = ref(null)
const isLiked = ref(false)
const likeCount = ref(0)
const likeLoading = ref(false)

// 监听画廊类型变化
watch(galleryType, (newType) => {
  if (newType === 'public') {
    fetchPublicDrawRecords()
  } else {
    fetchPrivateDrawRecords()
  }
})

// 获取公共画廊数据
const fetchPublicDrawRecords = async () => {
  try {
    const response = await listAllDrawRecords()
    if (response.code === 200 && response.data) {
      drawRecords.value = response.data.map(record => ({
        ...record,
        imageUrl: record.imageUrl || '/path/to/default-image.png'
      }))
      ElMessage.success(`成功获取 ${drawRecords.value.length} 条记录`)
    }
  } catch (error) {
    ElMessage.error('获取公共画廊数据失败')
    console.error('获取数据失败:', error)
  }
}

// 获取私人画廊数据
const fetchPrivateDrawRecords = async () => {
  const userId = userInfoStore.userInfo.id
  if (!userId) {
    ElMessage.warning('请先登录')
    galleryType.value = 'public'
    return
  }

  try {
    const response = await listDrawRecordsByUserId(userId)
    if (response.code === 200 && response.data) {
      drawRecords.value = response.data.map(record => ({
        ...record,
        imageUrl: record.imageUrl || '/path/to/default-image.png'
      }))
      ElMessage.success(`成功获取 ${drawRecords.value.length} 条私人记录`)
    }
  } catch (error) {
    ElMessage.error('获取私人画廊数据失败')
    console.error('获取私人画廊数据失败:', error)
    drawRecords.value = []
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
  }
}

// 获取点赞信息
const fetchLikeInfo = async (drawId) => {
  try {
    const response = await getLikeCount(drawId)
    if (response.code === 200) {
      likeCount.value = response.data.count
      isLiked.value = response.data.isLiked
    }
  } catch (error) {
    console.error('获取点赞数失败:', error)
  }
}

// 处理点赞/取消点赞
const handleLike = async () => {
  if (!selectedRecord.value || likeLoading.value) return

  likeLoading.value = true
  try {
    const response = await toggleLike(selectedRecord.value.id)
    if (response.code === 200) {
      isLiked.value = !isLiked.value
      likeCount.value += isLiked.value ? 1 : -1
      ElMessage.success(isLiked.value ? '点赞成功' : '已取消点赞')
    }
  } catch (error) {
    ElMessage.error('操作失败')
    console.error('点赞操作失败:', error)
  } finally {
    likeLoading.value = false
  }
}

// 打开详情弹窗
const openDialog = async (record) => {
  selectedRecord.value = record
  dialogVisible.value = true
  isLiked.value = false // 重置点赞状态
  likeCount.value = 0
  await fetchLikeInfo(record.id)
}

// 组件挂载时获取数据
onMounted(() => {
  fetchPublicDrawRecords()
})
</script>

<style lang="scss" scoped>
.gallery-main {
  padding: 20px;
}

/* 控制按钮容器 */
.controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  /* 响应式调整 */
  @media screen and (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
}

/* 画廊类型切换 */
.gallery-type-switch {
  display: flex;
  justify-content: center;
  
  /* 在较大屏幕上左对齐 */
  @media screen and (min-width: 769px) {
    justify-content: flex-start;
  }
}

/* 排序按钮 */
.sort-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  
  /* 在较大屏幕上右对齐 */
  @media screen and (min-width: 769px) {
    justify-content: flex-end;
  }
}

.sort-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #909399;
  font-size: 16px;
}

.masonry-container {
  column-count: 4;
  column-gap: 10px;
  padding: 0 10px;

  @media screen and (max-width: 1440px) {
    column-count: 4;
  }

  @media screen and (max-width: 1024px) {
    column-count: 3;
  }

  @media screen and (max-width: 768px) {
    column-count: 2;
  }

  @media screen and (max-width: 480px) {
    column-count: 1;
  }
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 10px;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  img {
    width: 100%;
    height: auto;
    display: block;
  }
}

:deep(.full-screen-dialog .el-dialog) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  margin: 0 !important;
  position: fixed;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%);
  max-width: 90vw;
  width: 90vw;
  max-height: 90vh;
}

.dialog-content {
  display: flex;
  gap: 30px;
  padding: 20px;

  @media screen and (max-width: 768px) {
    flex-direction: column;
  }
}

.image-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.dialog-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
}

.info-container {
  flex: 1;
  max-width: 400px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  backdrop-filter: blur(5px);

  @media screen and (max-width: 768px) {
    max-width: 100%;
  }
}

.info-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ebeef5;
  }

  th {
    width: 100px;
    color: #606266;
    font-weight: 500;
  }

  td {
    color: #303133;
  }
}

.like-container {
  display: flex;
  align-items: center;
  gap: 10px;

  .el-button {
    padding: 8px;
  }
}

.info-card {
  width: 100%;
  background-color: var(--bg-color);
  /* 使用CSS变量 */
  border: 1px solid var(--border-color);
  /* 使用CSS变量 */
  border-radius: 8px;
  padding: 10px;
  height: 100px;
}

.info-card-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  padding: 3px;
}

.welcome-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-color);
  margin: 0;
  margin-bottom: 3px;
}

.welcome-subtitle {
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.8;
  margin: 0;
}
</style>
