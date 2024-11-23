<template>
    <div class="draw-form-container">
        <div class="header">
            <h2 class="title">超级图生图</h2>
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

                    <!-- 提示词输入 -->
                    <div class="form-item">
                        <label for="prompt">提示词</label>
                        <textarea id="prompt" v-model="formData.drawDto.prompt" rows="6" class="prompt-input"
                            placeholder="请输入提示词..."></textarea>
                    </div>

                    <!-- 反向提示词输入 -->
                    <div class="form-item">
                        <label for="negativePrompt">反向提示词</label>
                        <textarea id="negativePrompt" v-model="formData.drawDto.negativePrompt" rows="4"
                            class="prompt-input" placeholder="请输入反向提示词..."></textarea>
                    </div>

                    <!-- 参数设置区域 -->
                    <div class="parameters-grid">
                        <!-- 图片尺寸选择 -->
                        <div class="form-item">
                            <label>图片尺寸</label>
                            <el-select v-model="formData.imageSize" placeholder="请选择尺寸">
                                <el-option-group label="方形">
                                    <el-option label="256x256" :value="1" />
                                    <el-option label="384x384" :value="2" />
                                    <el-option label="512x512" :value="3" />
                                </el-option-group>
                                <el-option-group label="横版 3:2">
                                    <el-option label="384x256" :value="11" />
                                    <el-option label="512x384" :value="12" />
                                </el-option-group>
                                <el-option-group label="横版 16:9">
                                    <el-option label="448x256" :value="21" />
                                    <el-option label="512x288" :value="22" />
                                </el-option-group>
                                <el-option-group label="竖版 2:3">
                                    <el-option label="256x384" :value="31" />
                                    <el-option label="384x512" :value="32" />
                                </el-option-group>
                                <el-option-group label="竖版 9:16">
                                    <el-option label="256x448" :value="41" />
                                    <el-option label="288x512" :value="42" />
                                </el-option-group>
                            </el-select>
                        </div>

                        <!-- 模型选择 -->
                        <div class="form-item">
                            <label>模型选择</label>
                            <el-select v-model="formData.checkpoint" placeholder="请选择模型">
                                <el-option label="AOM3A1B" :value="1" />
                                <el-option label="Counterfeit V2.5" :value="2" />
                            </el-select>
                        </div>

                        <!-- 采样器选择 -->
                        <div class="form-item">
                            <label>采样器</label>
                            <el-select v-model="formData.sampler" placeholder="请选择采样器">
                                <el-option-group label="常用">
                                    <el-option label="euler" :value="1" />
                                    <el-option label="euler_cfg_pp" :value="2" />
                                    <el-option label="dpmpp_2m" :value="16" />
                                    <el-option label="dpmpp_sde" :value="14" />
                                    <el-option label="uni_pc" :value="28" />
                                </el-option-group>
                                <el-option-group label="其他">
                                    <!-- 根据需要添加其他采样器选项 -->
                                </el-option-group>
                            </el-select>
                        </div>

                        <!-- 调度器选择 -->
                        <div class="form-item">
                            <label>调度器</label>
                            <el-select v-model="formData.scheduler" placeholder="请选择调度器">
                                <el-option label="normal" :value="1" />
                                <el-option label="karras" :value="2" />
                                <el-option label="exponential" :value="3" />
                                <el-option label="sgm_uniform" :value="4" />
                                <el-option label="simple" :value="5" />
                                <el-option label="ddim_uniform" :value="6" />
                                <el-option label="beta" :value="7" />
                                <el-option label="linear_quadratic" :value="8" />
                            </el-select>
                        </div>

                        <!-- 采样步数 -->
                        <div class="form-item">
                            <label>采样步数</label>
                            <el-input-number v-model="formData.drawDto.steps" :min="1" :max="100" :step="1" />
                        </div>

                        <!-- CFG值 -->
                        <div class="form-item">
                            <label>CFG值</label>
                            <el-input-number v-model="formData.drawDto.cfg" :min="1" :max="20" :step="1" />
                        </div>

                        <!-- 去噪程度 -->
                        <div class="form-item">
                            <label>去噪程度</label>
                            <el-slider v-model="formData.drawDto.denoise" :min="0" :max="1" :step="0.1" show-input />
                        </div>
                    </div>

                    <!-- 底部操作区域 -->
                    <div class="form-actions">
                        <div class="switch-item">
                            <el-switch v-model="formData.drawDto.isPublic" :active-value="1" :inactive-value="0"
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
import { ref, reactive } from 'vue';
import { superImg2img } from '@/api/draw';
import { ElMessage, ElIcon, ElButton } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';

// 响应式状态
const loading = ref(false);
const generatedImageUrl = ref('');
const fileInput = ref(null);
const uploadImage = ref(null);
const previewImage = ref('');

// 表单数据
const formData = reactive({
    drawDto: {
        prompt: '',
        negativePrompt:
            'badhandv4, EasyNegative, verybadimagenegative_v1.3, illustration, 3d, sepia, painting, cartoons, sketch, (worst quality:1.74), (low quality:1.74), (normal quality:1.44), lowres, bad anatomy, normal quality, ((monochrome)), ((grayscale)), ((letters)), ((english)), capital.',
        steps: 20,
        cfg: 7,
        denoise: 0.7,
        isPublic: 1,
    },
    imageSize: 3, // 默认 SQUARE_512 的 code 是 3
    checkpoint: 1, // 默认 AOM3A1B 的 code 是 1
    sampler: 1, // 默认 EULER 的 code 是 1
    scheduler: 1, // 默认 NORMAL 的 code 是 1
});

// 触发文件选择
const triggerFileInput = () => {
    fileInput.value.click();
};

// 处理文件选择
const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleFile(file);
};

// 处理拖拽
const handleDrop = (event) => {
    const file = event.dataTransfer.files[0];
    handleFile(file);
};

// 处理文件
const handleFile = (file) => {
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        ElMessage.error('请上传 jpg、png 或 webp 格式的图片');
        return;
    }

    // 验证文件大小（限制为 10MB）
    if (file.size > 10 * 1024 * 1024) {
        ElMessage.error('图片大小不能超过10MB');
        return;
    }

    uploadImage.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
};

// 移除图片
const removeImage = () => {
    uploadImage.value = null;
    previewImage.value = '';
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

// 提交表单
const handleSubmit = async () => {
    if (!formData.drawDto.prompt.trim()) {
        ElMessage.warning('请输入提示词');
        return;
    }

    if (!uploadImage.value) {
        ElMessage.warning('请上传一张图片');
        return;
    }

    // 确保数值参数有效
    const steps = parseInt(formData.drawDto.steps);
    const cfg = parseFloat(formData.drawDto.cfg);
    const denoise = parseFloat(formData.drawDto.denoise);

    if (isNaN(steps) || steps < 1 || steps > 100) {
        ElMessage.warning('步数必须在1-100之间');
        return;
    }

    if (isNaN(cfg) || cfg < 1 || cfg > 20) {
        ElMessage.warning('CFG值必须在1-20之间');
        return;
    }

    if (isNaN(denoise) || denoise < 0 || denoise > 1) {
        ElMessage.warning('去噪值必须在0-1之间');
        return;
    }

    loading.value = true;
    try {
        const res = await superImg2img(
            {
                ...formData.drawDto,
                steps: steps,
                cfg: cfg,
                denoise: denoise,
            },
            formData.imageSize,
            formData.checkpoint,
            formData.sampler,
            formData.scheduler,
            uploadImage.value
        );

        if (res.code === 200) {
            ElMessage.success('图像生成成功');
            generatedImageUrl.value = res.data;
            // 清空上传的图片和预览
            removeImage();
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

.parameters-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 20px;
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

/* 上传区域样式 */
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

/* 深度选择器调整 */
:deep(.el-select) {
    width: 100%;
}

:deep(.el-input-number) {
    width: 100%;
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
