<template>
    <div class="draw-form-container">
        <div class="header">
            <h2 class="title">文生图</h2>
        </div>

        <div class="content-wrapper">
            <!-- 左侧表单区域 -->
            <div class="left-panel">
                <form @submit.prevent="handleSubmit">
                    <div class="form-item">
                        <label for="prompt">提示词</label>
                        <textarea id="prompt" v-model="formData.prompt" rows="13" class="prompt-input"
                            placeholder="请输入提示词..."></textarea>
                    </div>

                    <!-- 底部操作区域：包含开关和按钮 -->
                    <div class="form-actions">
                        <div class="switch-item">
                            <el-switch v-model="formData.isPublic" :active-value="1" :inactive-value="0"
                                active-text="公开" inactive-text="私有" />
                        </div>
                        <button type="submit" class="submit-btn" :disabled="loading">
                            {{ loading ? '生成中...' : '生成图像' }}
                        </button>
                    </div>
                </form>
            </div>

            <!-- 右侧图片显示区域 -->
            <div class="right-panel">
                <div v-if="generatedImageUrl" class="image-container">
                    <img :src="generatedImageUrl" alt="生成的图片" class="result-image" />
                </div>
                <div v-else class="empty-state">
                    等待生成图片...
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { text2img } from '@/api/draw'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const generatedImageUrl = ref('')
const formData = reactive({
    prompt: '',
    isPublic: 1  // 默认为公开  
})

const handleSubmit = async () => {
    if (!formData.prompt.trim()) {
        ElMessage.warning('请输入提示词')
        return
    }

    loading.value = true
    try {
        const res = await text2img(formData)
        if (res.code === 200) {
            ElMessage.success('图像生成成功')
            generatedImageUrl.value = res.data
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

.left-panel {
    flex: 1;
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.right-panel {
    flex: 1;
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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

.prompt-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.5;
    transition: border-color 0.2s;
    resize: vertical;
}

.prompt-input:focus {
    outline: none;
    border-color: #409eff;
}

.submit-btn {
    background-color: #409eff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s;
    margin-left: 20px;
}

.submit-btn:hover:not(:disabled) {
    background-color: #66b1ff;
}

.submit-btn:disabled {
    background-color: #a0cfff;
    cursor: not-allowed;
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
    color: #909399;
    font-size: 14px;
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