<!-- src/components/ImgToImg.vue -->
<template>
    <div class="draw-form-container">
        <!-- 文生图标题卡片 -->
        <el-card class="info-card welcome-card" style="margin-bottom: 20px;">
            <div class="info-card-content welcome-content">
                <div class="info-text welcome-text">
                    <h2 class="welcome-title">图生图</h2>
                    <p class="welcome-subtitle">让创意无限延伸</p>
                </div>
            </div>
        </el-card>

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

                    <!-- 模型选择区域 -->
                    <div class="form-item">
                        <label>模型选择</label>
                        <el-select v-model="formData.checkpoint" placeholder="请选择模型">
                            <el-option-group label="二次元系列">
                                <el-option label="AOM3A1B" :value="1" />
                                <el-option label="Counterfeit V2.5" :value="2" />
                            </el-option-group>
                            <el-option-group label="写实系列">
                                <el-option label="majicMIX alpha 麦橘男团" :value="3" />
                                <el-option label="majicMIX realistic 麦橘写实" :value="4" />
                            </el-option-group>
                        </el-select>
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

// 主题存储
import { useThemeStore } from '@/stores/theme'
const themeStore = useThemeStore()

// 响应式状态  
const loading = ref(false)
const generatedImageUrl = ref('')
const fileInput = ref(null)
const uploadImage = ref(null)
const previewImage = ref('')

const formData = reactive({
    prompt: '',
    isPublic: 1,
    checkpoint: 1,
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
    if (!formData.prompt.trim()) {
        ElMessage.warning('请输入提示词');
        return;
    }

    if (!uploadImage.value) {
        ElMessage.warning('请上传一张图片');
        return;
    }

    loading.value = true;
    try {
        const res = await img2img({
            prompt: formData.prompt,
            isPublic: formData.isPublic
        }, uploadImage.value, formData.checkpoint);
        
        if (res.code === 200) {
            ElMessage.success('图像生成成功');
            generatedImageUrl.value = res.data;
            formData.prompt = '';
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

<style lang="scss" scoped>
.draw-form-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;

  /* 标题卡片新设计 */
  .info-card {
    background: linear-gradient(120deg, #2b32b2 0%, #1488cc 100%);
    border: none;
    box-shadow: 0 8px 32px rgba(43, 50, 178, 0.15);
    padding: 32px;
    margin-bottom: 32px;
    border-radius: 24px;
    position: relative;
    overflow: hidden;
    min-height: 120px;

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
      box-shadow: 0 12px 40px rgba(43, 50, 178, 0.25);
    }

    .info-card-content {
      position: relative;
      z-index: 1;
      height: 100%;

      .info-text {
        .welcome-title {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px 0;
          padding: 0;
          line-height: 1.2;
          letter-spacing: 1px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .welcome-subtitle {
          font-size: 16px;
          color: rgba(255,255,255,0.9);
          font-weight: 500;
          margin: 0;
          padding: 0;
          line-height: 1.4;
        }
      }
    }
  }

  .content-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    min-height: 700px;

    /* 左侧表单区域新设计 */
    .left-panel {
      background: var(--bg-color);
      padding: 32px;
      border-radius: 24px;
      border: 2px solid var(--el-color-primary-light-8);
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 24px;
        padding: 2px;
        background: linear-gradient(120deg, var(--el-color-primary-light-5), var(--el-color-primary-light-8));
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0;
        transition: opacity 0.4s;
      }

      &:hover::before {
        opacity: 1;
      }

      .form-item {
        margin-bottom: 24px;

        label {
          display: inline-block;
          font-size: 18px;
          font-weight: 600;
          color: var(--el-color-primary);
          margin-bottom: 16px;
          position: relative;
          padding-left: 16px;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 16px;
            background: var(--el-color-primary);
            border-radius: 2px;
          }
        }

        /* 上传区域样式 */
        .upload-area {
          width: 100%;
          height: 240px;
          border: 2px dashed var(--el-color-primary-light-5);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--el-color-primary-light-9);
          position: relative;
          overflow: hidden;

          &:hover {
            border-color: var(--el-color-primary);
            background: var(--el-color-primary-light-8);

            .upload-placeholder {
              transform: translateY(-2px);
            }
          }

          .upload-placeholder {
            text-align: center;
            transition: all 0.3s ease;

            .upload-icon {
              font-size: 48px;
              color: var(--el-color-primary);
              margin-bottom: 16px;
            }

            .upload-text {
              font-size: 16px;
              color: var(--el-color-primary);
              margin-bottom: 8px;
              font-weight: 500;
            }

            .upload-hint {
              font-size: 14px;
              color: var(--el-color-primary-light-3);
            }
          }
        }

        /* 预览容器样式 */
        .preview-container {
          width: 100%;
          height: 240px;
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);

          .preview-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            background: var(--el-color-primary-light-9);
          }

          .preview-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: all 0.3s ease;

            .el-button {
              transform: translateY(20px);
              transition: all 0.3s ease;
            }
          }

          &:hover .preview-overlay {
            opacity: 1;

            .el-button {
              transform: translateY(0);
            }
          }
        }

        /* 提示词输入框样式 */
        :deep(.el-textarea__inner) {
          padding: 20px;
          border: 2px solid var(--el-color-primary-light-8);
          border-radius: 16px;
          font-size: 16px;
          line-height: 1.6;
          transition: all 0.3s ease;

          &::placeholder {
            color: var(--el-color-primary-light-5);
          }

          &:hover {
            border-color: var(--el-color-primary-light-3);
          }

          &:focus {
            outline: none;
            border-color: var(--el-color-primary);
            box-shadow: 0 0 0 4px var(--el-color-primary-light-8);
          }
        }
      }

      .form-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 32px;
        padding-top: 24px;
        border-top: 2px solid var(--el-color-primary-light-8);

        .switch-item {
          :deep(.el-switch) {
            --el-switch-on-color: #10b981;
            --el-switch-off-color: #ef4444;
            height: 24px;
            
            .el-switch__core {
              border-radius: 24px;
            }

            .el-switch__label {
              font-size: 14px;
              font-weight: 500;
            }
          }
        }

        .el-button {
          padding: 16px 40px;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 600;
          transition: all 0.3s ease;
          background: linear-gradient(120deg, var(--el-color-primary), var(--el-color-primary-light-3));
          border: none;
          position: relative;
          overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(120deg, transparent, rgba(255,255,255,0.2), transparent);
            transform: translateX(-100%);
          }

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(var(--el-color-primary-rgb), 0.4);

            &::before {
              transform: translateX(100%);
              transition: transform 0.8s ease;
            }
          }

          &:disabled {
            background: var(--el-color-primary-light-5);
            cursor: not-allowed;
            opacity: 0.7;
          }
        }
      }
    }

    /* 右侧预览区域新设计 */
    .right-panel {
      background: var(--bg-color);
      padding: 32px;
      border-radius: 24px;
      border: 2px solid var(--el-color-primary-light-8);
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(120deg, 
          var(--el-color-primary-light-9) 0%, 
          transparent 40%,
          transparent 60%,
          var(--el-color-primary-light-9) 100%
        );
        opacity: 0.5;
        pointer-events: none;
      }

      .image-container {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 1;

        .result-image {
          max-width: 90%;
          max-height: 90%;
          object-fit: contain;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

          &:hover {
            transform: scale(1.05);
            box-shadow: 0 12px 48px rgba(0,0,0,0.2);
          }
        }
      }

      .empty-state {
        color: var(--el-color-primary);
        font-size: 18px;
        font-weight: 500;
        text-align: center;
        padding: 48px;
        background: var(--el-color-primary-light-9);
        border-radius: 16px;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        position: relative;
        overflow: hidden;

        .empty-icon {
          font-size: 48px;
          color: var(--el-color-primary);
        }

        &::before {
          content: '';
          position: absolute;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(var(--el-color-primary-rgb), 0.1) 50%,
            transparent 100%
          );
          animation: shine 3s infinite linear;
        }
      }
    }
  }
}

@keyframes shine {
  0% {
    transform: translateX(-50%) translateY(-50%) rotate(0deg);
  }
  100% {
    transform: translateX(-50%) translateY(-50%) rotate(360deg);
  }
}

/* 响应式适配 */
@media screen and (max-width: 1200px) {
  .draw-form-container {
    .content-wrapper {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }
}

@media screen and (max-width: 768px) {
  .draw-form-container {
    padding: 16px;

    .info-card {
      padding: 24px;
      min-height: 100px;

      .info-card-content {
        .info-text {
          .welcome-title {
            font-size: 24px;
          }

          .welcome-subtitle {
            font-size: 14px;
          }
        }
      }
    }

    .content-wrapper {
      gap: 16px;

      .left-panel,
      .right-panel {
        padding: 20px;
      }
    }
  }
}
</style>
