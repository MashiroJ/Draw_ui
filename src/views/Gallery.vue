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
    <el-dialog 
      v-model="dialogVisible" 
      title="绘图详情" 
      custom-class="enhanced-dialog" 
      :close-on-click-modal="true"
      width="80%"
    >
      <template v-if="selectedRecord">
        <div class="dialog-content">
          <!-- 左侧：图片展示区 -->
          <div class="left-section">
            <div class="image-container">
              <img :src="selectedRecord.imageUrl" :alt="selectedRecord.prompt" class="dialog-image" />
              <!-- 图片下方的操作栏 -->
              <div class="image-actions">
                <el-button
                  :type="selectedRecord.isLiked ? 'primary' : 'default'"
                  :icon="selectedRecord.isLiked ? StarFilled : Star"
                  @click="handleGalleryLike(selectedRecord)"
                  :loading="selectedRecord.likeLoading"
                >
                  {{ selectedRecord.likeCount || 0 }} 点赞
                </el-button>
                <el-button 
                  type="success" 
                  icon="Download"
                  @click="downloadImage(selectedRecord.imageUrl)"
                >
                  下载图片
                </el-button>
              </div>
            </div>
          </div>

          <!-- 右侧：详情信息和评论区 -->
          <div class="right-section">
            <!-- 详细信息 -->
            <div class="detail-info">
              <h3>详细信息</h3>
              <div class="prompt-section">
                <div class="prompt-label">提示词</div>
                <div class="prompt-content">
                  <el-input
                    type="textarea"
                    :rows="2"
                    v-model="selectedRecord.prompt"
                    readonly
                  />
                  <el-button 
                    type="primary" 
                    link 
                    icon="CopyDocument"
                    @click="copyPrompt(selectedRecord.prompt)"
                  >
                    复制提示词
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 评论区 -->
            <div class="comments-section">
              <h3>评论区</h3>
              <!-- 评论输入框 -->
              <div class="comment-input">
                <el-input
                  v-model="commentContent"
                  type="textarea"
                  :rows="3"
                  placeholder="写下你的评论..."
                  :maxlength="200"
                  show-word-limit
                />
                <el-button 
                  type="primary" 
                  @click="submitComment"
                  :loading="commentLoading"
                  style="margin-top: 10px"
                >
                  发表评论
                </el-button>
              </div>

              <!-- 评论列表 -->
              <div class="comments-list">
                <div v-if="comments.length === 0" class="no-comments">
                  暂无评论，快来抢沙发吧！
                </div>
                <template v-else>
                  <!-- 遍历主评论（parentId 为 0 的评论） -->
                  <div v-for="comment in mainComments" :key="comment.id" class="comment-item">
                    <!-- 主评论内容 -->
                    <div class="comment-header">
                      <div class="comment-user">
                        <img 
                          :src="comment.userAvatar || defaultAvatar" 
                          :alt="comment.username" 
                          class="comment-avatar"
                        />
                        <span class="comment-username">{{ comment.username }}</span>
                      </div>
                      <div class="comment-time">{{ comment.createTime }}</div>
                    </div>
                    <div class="comment-content">{{ comment.content }}</div>
                    <div class="comment-actions">
                      <el-button
                        :type="comment.isLiked ? 'primary' : 'default'"
                        :icon="comment.isLiked ? StarFilled : Star"
                        circle
                        size="small"
                        @click="handleCommentLike(comment)"
                        :loading="comment.likeLoading"
                      />
                      <span class="like-count">{{ comment.likeCount || 0 }}</span>
                      <el-button
                        type="text"
                        size="small"
                        @click="handleReply(comment)"
                      >
                        回复
                      </el-button>
                    </div>
                    
                    <!-- 回复输入框 -->
                    <div v-if="replyTo?.id === comment.id" class="reply-input">
                      <el-input
                        v-model="replyContent"
                        type="textarea"
                        :rows="2"
                        :placeholder="`回复 ${comment.username}：`"
                        :maxlength="200"
                        show-word-limit
                      />
                      <div class="reply-actions">
                        <el-button type="primary" @click="submitComment" :loading="commentLoading">
                          发表回复
                        </el-button>
                        <el-button @click="cancelReply">取消</el-button>
                      </div>
                    </div>

                    <!-- 显示该评论的所有回复 -->
                    <div v-if="getCommentReplies(comment.id).length > 0" class="reply-list">
                      <div v-for="reply in getCommentReplies(comment.id)" 
                           :key="reply.id" 
                           class="reply-item"
                      >
                        <div class="comment-header">
                          <div class="comment-user">
                            <img 
                              :src="reply.userAvatar || defaultAvatar" 
                              :alt="reply.username" 
                              class="comment-avatar"
                            />
                            <span class="comment-username">{{ reply.username }}</span>
                            <el-icon><ArrowRight /></el-icon>
                            <span class="reply-to">{{ reply.replyUsername }}</span>
                          </div>
                          <div class="comment-time">{{ reply.createTime }}</div>
                        </div>
                        <div class="comment-content">{{ reply.content }}</div>
                        <div class="comment-actions">
                          <el-button
                            :type="reply.isLiked ? 'primary' : 'default'"
                            :icon="reply.isLiked ? StarFilled : Star"
                            circle
                            size="small"
                            @click="handleCommentLike(reply)"
                            :loading="reply.likeLoading"
                          />
                          <span class="like-count">{{ reply.likeCount || 0 }}</span>
                          <el-button
                            type="text"
                            size="small"
                            @click="handleReply(reply)"
                          >
                            回复
                          </el-button>
                        </div>
                        
                        <!-- 回复的回复输入框 -->
                        <div v-if="replyTo?.id === reply.id" class="reply-input">
                          <el-input
                            v-model="replyContent"
                            type="textarea"
                            :rows="2"
                            :placeholder="`回复 ${reply.username}：`"
                            :maxlength="200"
                            show-word-limit
                          />
                          <div class="reply-actions">
                            <el-button type="primary" @click="submitComment" :loading="commentLoading">
                              发表回复
                            </el-button>
                            <el-button @click="cancelReply">取消</el-button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <!-- 分页 -->
              <el-pagination
                v-if="total > pageSize"
                :current-page="currentPage"
                :page-size="pageSize"
                :total="total"
                @current-change="handlePageChange"
                layout="prev, pager, next"
                class="comment-pagination"
              />
            </div>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Star, StarFilled, Timer, ArrowRight, Download, CopyDocument } from '@element-plus/icons-vue'
import {
  listAllDrawRecords,
  listDrawRecordsByUserId,
  listDrawRecordsSortedByLikes,
  listDrawRecordsSortedByLatest
} from '@/api/drawRecords'
import { toggleLike } from '@/api/drawLike'
import { getUserInfoById } from '@/api/user'
import { addComment, getCommentPage, likeComment, unlikeComment } from '@/api/drawComment'

// 导入默认头像
import defaultAvatarImage from '@/assets/default-avatar.png'
const defaultAvatar = defaultAvatarImage

// 引入 userinfo store
import { useUserInfoStore } from '@/stores/userinfo'

// 状态定义
const galleryType = ref('public')
const drawRecords = ref([])
const dialogVisible = ref(false)
const selectedRecord = ref(null)
const authorsMap = reactive({}) // 用于存储作者信息
const comments = ref([])
const commentContent = ref('')
const commentLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const replyTo = ref(null) // 存储要回复的评论信息
const replyContent = ref('') // 回复的内容

// 计算主评论（parentId 为 0 的评论）
const mainComments = computed(() => {
  return comments.value.filter(comment => comment.parentId === 0)
})

// 获取某条评论的所有回复
const getCommentReplies = (parentId) => {
  return comments.value.filter(comment => comment.parentId === parentId)
}

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
  const userInfoStore = useUserInfoStore()
  const userId = userInfoStore.userInfo?.id
  
  console.log('当前 userInfo:', userInfoStore.userInfo)
  console.log('当前用户 id:', userId)

  if (!userId) {
    ElMessage.warning('无法获取用户信息')
    drawRecords.value = []
    return
  }

  try {
    console.log('准备发送请求，用户id:', userId)
    const response = await listDrawRecordsByUserId(userId)
    console.log('API响应数据:', response)
    
    if (response.code === 200 && response.data) {
      drawRecords.value = response.data.map(record => ({
        ...record,
        imageUrl: record.imageUrl || defaultAvatar,
        likeCount: record.likeCount || 0,
        isLiked: record.isLiked || false,
        likeLoading: false,
        userId: userId
      }))
      ElMessage.success(`成功获取 ${drawRecords.value.length} 条私人记录`)
      await fetchAuthorsInfo(drawRecords.value)
    }
  } catch (error) {
    console.error('API请求失败，错误详情:', error)
    ElMessage.error('获取廊数据失败')
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
  currentPage.value = 1
  await fetchComments(record.id)
}

// 获取评论
const fetchComments = async (drawId) => {
  try {
    const response = await getCommentPage(drawId, currentPage.value, pageSize.value)
    if (response.code === 200) {
      comments.value = response.data.records.map(comment => ({
        ...comment,
        likeLoading: false
      }))
      total.value = response.data.total
    }
  } catch (error) {
    console.error('获取评论失败:', error)
    ElMessage.error('获取评论失败')
  }
}

// 添加处理回复的方法
const handleReply = (comment) => {
  replyTo.value = comment
  replyContent.value = ''
}

// 取消回复
const cancelReply = () => {
  replyTo.value = null
  replyContent.value = ''
}

// 修改提交评论的方法，支持回复功能
const submitComment = async () => {
  const content = replyTo.value ? replyContent.value : commentContent.value
  if (!content.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  commentLoading.value = true
  try {
    const commentData = {
      drawId: selectedRecord.value.id,
      content: content,
      parentId: replyTo.value ? replyTo.value.id : 0,
      replyUserId: replyTo.value ? replyTo.value.userId : 0
    }
    
    const response = await addComment(commentData)
    if (response.code === 200) {
      ElMessage.success(replyTo.value ? '回复成功' : '评论成功')
      commentContent.value = ''
      replyContent.value = ''
      replyTo.value = null
      await fetchComments(selectedRecord.value.id)
    }
  } catch (error) {
    console.error('论失败:', error)
    ElMessage.error('评论失败')
  } finally {
    commentLoading.value = false
  }
}

// 评论点赞
const handleCommentLike = async (comment) => {
  if (comment.likeLoading) return
  
  comment.likeLoading = true
  try {
    const response = await (comment.isLiked ? unlikeComment : likeComment)(comment.id)
    if (response.code === 200) {
      comment.isLiked = !comment.isLiked
      comment.likeCount = comment.isLiked ? (comment.likeCount + 1) : (comment.likeCount - 1)
      ElMessage.success(comment.isLiked ? '点赞成功' : '已取消点赞')
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  } finally {
    comment.likeLoading = false
  }
}

// 添加复制提示词方法
const copyPrompt = async (prompt) => {
  try {
    await navigator.clipboard.writeText(prompt)
    ElMessage.success('提示词已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error('复制失败')
  }
}

// 替换原来的 downloadImage 方法
const downloadImage = async (imageUrl) => {
  try {
    // 显示加载提示
    const loadingInstance = ElMessage.info({
      message: '正在准备下载...',
      duration: 0
    })
    
    // 获取图片数据
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error('图片下载失败')
    }
    
    // 获取文件名
    const filename = imageUrl.split('/').pop() || 'image.png'
    
    // 转换为 blob
    const blob = await response.blob()
    
    // 创建 blob URL
    const blobUrl = window.URL.createObjectURL(blob)
    
    // 创建临时下载链接
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    
    // 添加到文档并触发点击
    document.body.appendChild(link)
    link.click()
    
    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
    
    // 关闭加载提示
    loadingInstance.close()
    ElMessage.success('下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请稍后重试')
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchPublicDrawRecords()
})
</script>

<style lang="scss" scoped>
.gallery-main {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;

  /* 欢迎卡片美化 */
  .info-card {
    background: linear-gradient(135deg, #00c6fb 0%, #005bea 100%);
    border: none;
    box-shadow: 0 8px 32px rgba(0, 198, 251, 0.15);
    padding: 32px;
    margin-bottom: 32px;
    border-radius: 24px;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
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

      .info-text {
        .welcome-title {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .welcome-subtitle {
          font-size: 16px;
          color: rgba(255,255,255,0.9);
          margin: 0;
        }
      }
    }
  }

  /* 控制按钮容器美化 */
  .controls {
    background: var(--bg-color);
    padding: 24px;
    border-radius: 16px;
    border: 2px solid var(--el-color-primary-light-8);
    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    margin-bottom: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      border-color: var(--el-color-primary);
      box-shadow: 0 12px 40px rgba(0,0,0,0.12);
    }

    .gallery-type-switch {
      :deep(.el-radio-group) {
        display: flex;
        gap: 12px;

        .el-radio-button__inner {
          border: 2px solid var(--el-color-primary-light-8);
          background: transparent;
          color: var(--text-color);
          height: 40px;
          padding: 0 24px;
          border-radius: 12px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          font-weight: 500;
          min-width: 120px;

          &:hover {
            border-color: var(--el-color-primary);
            color: var(--el-color-primary);
            transform: translateY(-2px);
          }
        }

        .el-radio-button__original-radio:checked + .el-radio-button__inner {
          background: var(--el-color-primary);
          border-color: var(--el-color-primary);
          color: white;
          box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.3);
        }
      }
    }

    .sort-buttons {
      display: flex;
      gap: 12px;

      .sort-button {
        height: 40px;
        padding: 0 24px;
        border: 2px solid var(--el-color-primary-light-8);
        border-radius: 12px;
        background: transparent;
        color: var(--text-color);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;

        .el-icon {
          font-size: 18px;
        }

        &:hover {
          border-color: var(--el-color-primary);
          color: var(--el-color-primary);
          transform: translateY(-2px);
        }
      }
    }
  }

  /* 瀑布流画廊美化 */
  .masonry-container {
    column-count: 4;
    column-gap: 24px;
    padding: 0 12px;

    .masonry-item {
      break-inside: avoid;
      margin-bottom: 24px;
      border-radius: 16px;
      overflow: hidden;
      background: var(--bg-color);
      border: 2px solid var(--el-color-primary-light-8);
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      position: relative;

      &:hover {
        transform: translateY(-8px);
        border-color: var(--el-color-primary);
        box-shadow: 0 16px 48px rgba(0,0,0,0.12);

        img {
          transform: scale(1.05);
        }

        .gallery-like-container {
          opacity: 1;
          transform: translateY(0);
        }
      }

      img {
        width: 100%;
        height: auto;
        display: block;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .gallery-like-container {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 16px;
        background: var(--bg-color);
        border-top: 2px solid var(--el-color-primary-light-8);
        display: flex;
        justify-content: space-between;
        align-items: center;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;

          .user-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 2px solid var(--el-color-primary-light-5);
            transition: all 0.3s ease;

            &:hover {
              transform: scale(1.1);
              border-color: var(--el-color-primary);
            }
          }

          .username {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-color);
          }
        }

        .like-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .gallery-like-button {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 2px solid var(--el-color-primary-light-8);
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;

            &:hover {
              border-color: var(--el-color-primary);
              background: var(--el-color-primary-light-9);
              transform: scale(1.1);
            }

            .el-icon {
              font-size: 18px;
              color: var(--el-color-primary);
            }
          }

          .like-count {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-color);
          }
        }
      }
    }
  }

  /* 空状态美化 */
  .empty-state {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-color);
    border: 2px solid var(--el-color-primary-light-8);
    border-radius: 16px;
    padding: 48px;

    :deep(.el-empty) {
      .el-empty__image {
        width: 160px;
        height: 160px;
      }

      .el-empty__description {
        margin-top: 24px;
        font-size: 16px;
        color: var(--text-color);
      }
    }
  }
}

/* 响应式适配 */
@media screen and (max-width: 1440px) {
  .masonry-container {
    column-count: 3;
  }
}

@media screen and (max-width: 1024px) {
  .masonry-container {
    column-count: 2;
  }
}

@media screen and (max-width: 768px) {
  .gallery-main {
    padding: 16px;

    .controls {
      flex-direction: column;
      gap: 16px;
      padding: 16px;

      .gallery-type-switch,
      .sort-buttons {
        width: 100%;
      }
    }

    .masonry-container {
      column-count: 1;
      padding: 0;
    }
  }
}

/* 更新弹窗样式 */
.enhanced-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
  
  // 添加弹窗标题和关闭按钮的暗色模式
  :deep(.el-dialog__header) {
    background-color: var(--bg-color);
    border-bottom: 1px solid var(--border-color);
    
    .el-dialog__title {
      color: var(--text-color);
    }
    
    .el-dialog__close {
      color: var(--text-color);
      
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}

.dialog-content {
  display: flex;
  height: 80vh;
  overflow: hidden;
  background-color: var(--bg-color); // 添加背景色

  .left-section {
    flex: 1;
    padding: 20px;
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    background-color: var(--bg-color); // 添加背景色
    
    .image-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 15px;
      
      .dialog-image {
        width: 100%;
        height: calc(100% - 60px);
        object-fit: contain;
        border-radius: 8px;
        border: none;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      }
      
      .image-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        padding: 10px 0;
        
        // 按钮在暗色模式下的样式
        .el-button {
          background-color: var(--bg-color);
          border-color: var(--border-color);
          color: var(--text-color);
          
          &:hover {
            border-color: var(--el-color-primary);
            color: var(--el-color-primary);
          }
          
          &.el-button--primary {
            background-color: var(--el-color-primary);
            color: white;
          }
        }
      }
    }
  }

  .right-section {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    background-color: var(--bg-color); // 添加背景色

    .detail-info {
      h3 {
        margin-bottom: 15px;
        color: var(--text-color);
      }

      .prompt-section {
        margin-bottom: 15px;

        .prompt-label {
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--text-color);
        }

        .prompt-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          
          // 输入框暗色模式适配
          :deep(.el-textarea__inner) {
            background-color: var(--bg-color);
            border-color: var(--border-color);
            color: var(--text-color);
            
            &:hover, &:focus {
              border-color: var(--el-color-primary);
            }
          }
        }
      }
    }

    .comments-section {
      h3 {
        margin-bottom: 15px;
        color: var(--text-color);
      }
      
      // 评论输入框暗色模式
      .comment-input {
        :deep(.el-textarea__inner) {
          background-color: var(--bg-color);
          border-color: var(--border-color);
          color: var(--text-color);
          
          &:hover, &:focus {
            border-color: var(--el-color-primary);
          }
        }
      }
    }
  }
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

/* 在现有样式后添加 */
.comments-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.comment-input {
  margin-bottom: 20px;
}

.comments-list {
  .no-comments {
    text-align: center;
    color: var(--text-color);
    opacity: 0.6;
    padding: 20px 0;
  }
}

.comment-item {
  padding: 15px 0;
  border-bottom: 1px solid var(--border-color);

  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .comment-user {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .comment-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }

  .comment-username {
    font-weight: 500;
    color: var(--text-color);
  }

  .comment-time {
    font-size: 12px;
    color: var(--text-color);
    opacity: 0.6;
  }

  .comment-content {
    margin: 10px 0;
    line-height: 1.5;
    color: var(--text-color);
  }

  .comment-actions {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .like-count {
    font-size: 14px;
    color: var(--text-color);
  }

  .reply-to {
    color: var(--active-text-color);
    font-size: 14px;
  }

  .reply-input {
    margin-top: 10px;
    padding: 10px;
    background-color: var(--el-bg-color-overlay);
    
    :deep(.el-textarea__inner) {
      background-color: var(--bg-color);
      border-color: var(--border-color);
      color: var(--text-color);
      
      &:hover, &:focus {
        border-color: var(--el-color-primary);
      }
    }
  }
}

.comment-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.reply-list {
  margin-left: 20px;
  margin-top: 10px;
  padding-left: 20px;
  border-left: 2px solid var(--border-color);
}

.reply-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }
}
</style>
