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
        <div class="gallery-like-container">
          <!-- 左侧：用户信息 -->
          <div class="user-info">
            <img
              :src="item.userId && authorsMap[item.userId]?.avatarUrl ? authorsMap[item.userId].avatarUrl : defaultAvatar"
              alt="用户头像"
              class="user-avatar"
            />
            <span class="username">
              {{ item.userId && authorsMap[item.userId]?.username ? authorsMap[item.userId].username : '未知用户' }}
            </span>
          </div>
          <!-- 右侧：点赞信息 -->
          <div class="like-info">
            <el-button
              :type="item.isLiked ? 'primary' : 'danger'"
              :icon="item.isLiked ? StarFilled : Star"
              circle
              size="small"
              @click.stop="handleGalleryLike(item)"
              :loading="item.likeLoading"
              class="gallery-like-button"
            />
            <span class="like-count">{{ item.likeCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="dialogVisible" title="绘图详情" custom-class="enhanced-dialog" :close-on-click-modal="true">
      <template v-if="selectedRecord">
        <div class="dialog-content">
          <!-- 左侧：图片和点赞 -->
          <div class="left-section">
            <img :src="selectedRecord.imageUrl" :alt="selectedRecord.prompt" class="dialog-image" />
          </div>
          <!-- 右侧：详细信息 -->
          <div class="right-section">
            <el-descriptions title="详情信息" border column="1">
              <el-descriptions-item label="提示词">{{ selectedRecord.prompt }}</el-descriptions-item>
              <el-descriptions-item label="生成时间">{{ selectedRecord.createTime }}</el-descriptions-item>
              <el-descriptions-item label="生成类型">{{ selectedRecord.generationType || '未知' }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Star, StarFilled, Timer } from '@element-plus/icons-vue'
import {
  listAllDrawRecords,
  listDrawRecordsByUserId,
  listDrawRecordsSortedByLikes,
  listDrawRecordsSortedByLatest
} from '@/api/drawRecords'
import { toggleLike } from '@/api/drawLike'
import { getUserInfoById } from '@/api/user'

// 导入默认头像
import defaultAvatarImage from '@/assets/default-avatar.png'
const defaultAvatar = defaultAvatarImage

// 状态定义
const galleryType = ref('public')
const drawRecords = ref([])
const dialogVisible = ref(false)
const selectedRecord = ref(null)
const authorsMap = reactive({}) // 用于存储作者信息

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
        imageUrl: record.imageUrl || defaultAvatar,
        likeCount: record.likeCount || 0,
        isLiked: record.isLiked || false,
        likeLoading: false,
        userId: record.userId || null // 确保 userId 存在
      }))
      ElMessage.success(`成功获取 ${drawRecords.value.length} 条记录`)
      await fetchAuthorsInfo(drawRecords.value)
    }
  } catch (error) {
    ElMessage.error('获取公共画廊数据失败')
    console.error('获取数据失败:', error)
  }
}

// 获取私人画廊数据
const fetchPrivateDrawRecords = async () => {
  const userIdFromLocal = localStorage.getItem('userId') // 示例，实际请根据项目情况获取
  if (!userIdFromLocal) {
    ElMessage.warning('请先登录')
    galleryType.value = 'public'
    return
  }

  try {
    const response = await listDrawRecordsByUserId(userIdFromLocal)
    if (response.code === 200 && response.data) {
      drawRecords.value = response.data.map(record => ({
        ...record,
        imageUrl: record.imageUrl || defaultAvatar,
        likeCount: record.likeCount || 0,
        isLiked: record.isLiked || false,
        likeLoading: false,
        userId: record.userId || null // 确保 userId 存在
      }))
      ElMessage.success(`成功获取 ${drawRecords.value.length} 条私人记录`)
      await fetchAuthorsInfo(drawRecords.value)
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
      drawRecords.value = response.data.map(record => ({
        ...record,
        imageUrl: record.imageUrl || defaultAvatar,
        likeCount: record.likeCount || 0,
        isLiked: record.isLiked || false,
        likeLoading: false,
        userId: record.userId || null // 确保 userId 存在
      }))
      ElMessage.success('已按点赞数排序')
      await fetchAuthorsInfo(drawRecords.value)
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
      drawRecords.value = response.data.map(record => ({
        ...record,
        imageUrl: record.imageUrl || defaultAvatar,
        likeCount: record.likeCount || 0,
        isLiked: record.isLiked || false,
        likeLoading: false,
        userId: record.userId || null // 确保 userId 存在
      }))
      ElMessage.success('已按最新时间排序')
      await fetchAuthorsInfo(drawRecords.value)
    }
  } catch (error) {
    ElMessage.error('排序失败')
    console.error('排序失败:', error)
  }
}

// 获取并缓存作者信息
const fetchAuthorsInfo = async (records) => {
  // 提取唯一且存在的 userId
  const uniqueUserIds = [...new Set(records.map(record => record.userId))].filter(id => id)
  const usersToFetch = uniqueUserIds.filter(id => !authorsMap[id])

  if (usersToFetch.length === 0) return

  try {
    // 使用 Promise.allSettled 以处理部分请求失败的情况
    const fetchPromises = usersToFetch.map(id => getUserInfoById(id))
    const results = await Promise.allSettled(fetchPromises)

    results.forEach((result, index) => {
      const userId = usersToFetch[index]
      if (result.status === 'fulfilled' && result.value.code === 200 && result.value.data) {
        authorsMap[userId] = {
          avatarUrl: result.value.data.avatarUrl || defaultAvatar,
          username: result.value.data.username || '未知用户'
        }
      } else {
        // 请求失败或数据缺失时，使用默认值
        authorsMap[userId] = {
          avatarUrl: defaultAvatar,
          username: '未知用户'
        }
        console.error(`获取作者信息失败: ID ${userId}`, result.reason || result.value)
      }
    })
  } catch (error) {
    ElMessage.error('获取作者信息时发生意外错误')
    console.error('获取作者信息时发生意外错误:', error)
  }
}

// 处理画廊中的点赞/取消点赞
const handleGalleryLike = async (item) => {
  if (item.likeLoading) return

  item.likeLoading = true
  try {
    const response = await toggleLike(item.id)
    if (response.code === 200) {
      item.isLiked = !item.isLiked
      item.likeCount += item.isLiked ? 1 : -1
      ElMessage.success(item.isLiked ? '点赞成功' : '已取消点赞')
    }
  } catch (error) {
    ElMessage.error('操作失败')
    console.error('点赞操作失败:', error)
  } finally {
    item.likeLoading = false
  }
}

// 打开详情弹窗
const openDialog = async (record) => {
  selectedRecord.value = record
  dialogVisible.value = true
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
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

    /* 显示gallery-like-container */
    .gallery-like-container {
      opacity: 1;
      visibility: visible;
    }
  }

  img {
    width: 100%;
    height: auto;
    display: block;
  }

  .gallery-like-container {
    position: absolute;
    bottom: 10px;
    left: 10px;
    right: 10px; /* 确保容器有左右间距 */
    display: flex;
    justify-content: space-between; /* 分隔左右内容 */
    align-items: center;
    background: rgba(255, 255, 255, 0.8); /* 半透明背景 */
    padding: 5px 10px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .user-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }

  .username {
    font-size: 14px;
    color: #606266;
  }

  .like-info {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .like-count {
    font-size: 14px;
    color: #606266;
  }

  .gallery-like-button {
    transition: background-color 0.3s, border-color 0.3s;
  }

  .gallery-like-button:hover {
    background-color: #66b1ff;
    border-color: #66b1ff;
  }
}

/* 更新弹窗样式 */
.enhanced-dialog .el-dialog__header {
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.enhanced-dialog .el-dialog__body {
  padding: 20px;
}

.dialog-content {
  display: flex;
  flex-direction: row;
  gap: 20px;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
}

.left-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.dialog-image {
  width: 100%;
  max-width: 500px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.right-section {
  flex: 1;
}

.el-descriptions {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 信息卡片样式 */
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
