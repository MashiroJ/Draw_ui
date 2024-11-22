<template>
    <div class="draw-form-container">
        <div class="header">
            <h2 class="title">图生图</h2>
        </div>

        <div class="content-wrapper">
            <!-- 左侧表单区域 -->
            <div class="left-panel">
                <form @submit.prevent="handleSubmit">
                    <!-- 图片上传区域 -->
                    <div class="form-item">
                        <label>上传图片</label>
                        <div class="upload-area" @click="triggerFileInput" @drop.prevent="handleDrop" @dragover.prevent>
                            <input type="file" ref="fileInput" class="file-input" accept="image/*"
                                @change="handleFileChange" style="display: none" />
                            <div v-if="!previewImage" class="upload-placeholder">
                                <el-icon class="upload-icon">
                                    <Upload />
                                </el-icon>
                                <div class="upload-text">点击或拖拽图片到此处上传</div>
                                <div class="upload-hint">支持 jpg、png、webp 格式</div>
                            </div>
                            <div v-else class="preview-container">
                                <img :src="previewImage" class="preview-image" alt="预览图片" />
                                <div class="preview-overlay">
                                    <el-button type="danger" size="small" @click.stop="removeImage">
                                        删除图片
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 提示词输入区域 -->
                    <div class="form-item">
                        <label for="prompt">提示词</label>
                        <el-input v-model="formData.prompt" type="textarea" :rows="10"
                            placeholder="请输入提示词，描述您想要生成的图片内容..." />
                    </div>

                    <!-- 底部操作区域 -->
                    <div class="form-actions">
                        <div class="switch-item">
                            <el-switch v-model="formData.isPublic" :active-value="1" :inactive-value="0"
                                active-text="公开" inactive-text="私有" />
                        </div>
                        <el-button type="primary" :loading="loading" :disabled="!uploadImage || !formData.prompt.trim()"
                            @click="handleSubmit">
                            {{ loading ? '生成中...' : '生成图像' }}
                        </el-button>
                    </div>
                </form>
            </div>

            <!-- 右侧图片显示区域 -->
            <div class="right-panel">
                <div v-if="generatedImageUrl" class="image-container">
                    <img :src="generatedImageUrl" alt="生成的图片" class="result-image" />
                </div>
                <div v-else class="empty-state">
                    <el-icon class="empty-icon">
                        <Picture />
                    </el-icon>
                    <p>等待生成图片...</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { img2img } from '@/api/draw'
import { ElMessage } from 'element-plus'
import { Upload, Picture } from '@element-plus/icons-vue'

// 响应式状态  
const loading = ref(false)
const generatedImageUrl = ref('')
const fileInput = ref(null)
const uploadImage = ref(null)
const previewImage = ref('')

const formData = reactive({
    prompt: '',
    isPublic: 1
})

// 触发文件选择  
const triggerFileInput = () => {
    fileInput.value.click()
}

// 处理文件选择  
const handleFileChange = (event) => {
    const file = event.target.files[0]
    handleFile(file)
}

// 处理拖拽  
const handleDrop = (event) => {
    const file = event.dataTransfer.files[0]
    handleFile(file)
}

// 处理文件  
const handleFile = (file) => {
    if (!file) return

    // 验证文件类型  
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
        ElMessage.error('请上传 jpg、png 或 webp 格式的图片')
        return
    }

    // 验证文件大小（限制为 10MB）  
    if (file.size > 10 * 1024 * 1024) {
        ElMessage.error('图片大小不能超过10MB')
        return
    }

    uploadImage.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
        previewImage.value = e.target.result
    }
    reader.readAsDataURL(file)
}

// 移除图片  
const removeImage = () => {
    uploadImage.value = null
    previewImage.value = ''
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

// 提交表单  
const handleSubmit = async () => {
    if (!uploadImage.value) {
        ElMessage.warning('请先上传图片')
        return
    }

    if (!formData.prompt.trim()) {
        ElMessage.warning('请输入提示词')
        return
    }

    loading.value = true
    try {
        // 构建请求数据  
        const drawDto = {
            prompt: formData.prompt.trim(),
            isPublic: formData.isPublic
        }

        const res = await img2img(drawDto, uploadImage.value)

        if (res.code === 200) {
            ElMessage.success('图像生成成功')
            generatedImageUrl.value = res.data
            // 清空提示词，保留其他设置  
            formData.prompt = ''
        } else {
            ElMessage.error(res.message || '生成失败，请重试')
        }
    } catch (error) {
        console.error('Error:', error)
        ElMessage.error('服务出错，请稍后重试')
    } finally {
        loading.value = false
    }
}  
</script>

<style scoped>
.draw-form-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.header {
    margin-bottom: 24px;
}

.title {
    font-size: 24px;
    color: #333;
    font-weight: 600;
}

.content-wrapper {
    display: flex;
    gap: 24px;
    min-height: 600px;
}

.left-panel,
.right-panel {
    flex: 1;
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.right-panel {
    display: flex;
    align-items: center;
    justify-content: center;
}

.form-item {
    margin-bottom: 20px;
}

.form-item label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
}

.upload-area {
    width: 100%;
    height: 200px;
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: #f5f7fa;
}

.upload-area:hover {
    border-color: #409eff;
}

.upload-placeholder {
    text-align: center;
    color: #909399;
}

.upload-icon {
    font-size: 48px;
    margin-bottom: 10px;
    color: #909399;
}

.upload-text {
    font-size: 14px;
    margin-bottom: 4px;
}

.upload-hint {
    font-size: 12px;
    color: #c0c4cc;
}

.preview-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 8px;
}

.preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    border-radius: 8px;
}

.preview-container:hover .preview-overlay {
    opacity: 1;
}

.form-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
}

.switch-item {
    display: flex;
    align-items: center;
    gap: 12px;
}

.image-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.result-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 4px;
}

.empty-state {
    text-align: center;
    color: #909399;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
}

/* 添加过渡动画 */
.left-panel,
.right-panel {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>