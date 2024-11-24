<template>
    <div class="draw-form-container">
        <!-- 文生图标题卡片 -->
        <el-card class="info-card welcome-card" style="margin-bottom: 20px;">
            <div class="info-card-content welcome-content">
                <div class="info-text welcome-text">
                    <h2 class="welcome-title">文生图</h2>
                    <p class="welcome-subtitle">让文字充满想象</p>
                </div>
            </div>
        </el-card>

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
                <div v-else class="empty-state">等待生成图片...</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { text2img } from '@/api/draw';
import { ElMessage } from 'element-plus';

// 主题存储（虽然不直接使用，但确保样式依赖CSS变量）
import { useThemeStore } from '@/stores/theme';
const themeStore = useThemeStore();

const loading = ref(false);
const generatedImageUrl = ref('');
const formData = reactive({
    prompt: '',
    isPublic: 1, // 默认为公开
});

const handleSubmit = async () => {
    if (!formData.prompt.trim()) {
        ElMessage.warning('请输入提示词');
        return;
    }

    loading.value = true;
    try {
        const res = await text2img(formData);
        if (res.code === 200) {
            ElMessage.success('图像生成成功');
            generatedImageUrl.value = res.data;
            formData.prompt = '';
        } else {
            ElMessage.error(res.message || '生成失败，请重试');
        }
    } catch (error) {
        console.error('Error:', error);
        ElMessage.error('服务出错，请稍后重试');
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped lang="scss">
.draw-form-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.content-wrapper {
    display: flex;
    gap: 24px;
    min-height: 500px;
}

.left-panel {
    flex: 1;
    background: var(--bg-color);
    /* 使用CSS变量 */
    padding: 24px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    /* 使用CSS变量 */
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.right-panel {
    flex: 1;
    background: var(--bg-color);
    /* 使用CSS变量 */
    padding: 24px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    /* 使用CSS变量 */
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
    color: var(--text-color);
    /* 使用CSS变量 */
}

.prompt-input {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color);
    /* 使用CSS变量 */
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-color);
    /* 使用CSS变量 */
    background-color: var(--bg-color);
    /* 使用CSS变量 */
}

.prompt-input:focus {
    outline: none;
    border-color: var(--active-text-color);
    /* 使用CSS变量 */
}

.form-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
}

.submit-btn {
    background-color: var(--button-bg-color);
    /* 使用CSS变量 */
    color: var(--button-text-color);
    /* 使用CSS变量 */
    border: none;
    padding: 12px 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s, color 0.2s;
}

.submit-btn:hover:not(:disabled) {
    background-color: var(--button-hover-bg-color);
    /* 使用CSS变量 */
}

.submit-btn:disabled {
    background-color: var(--button-disabled-bg-color);
    /* 使用CSS变量 */
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
    color: var(--footer-color);
    /* 使用CSS变量 */
    font-size: 14px;
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