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

        .prompt-input {
          width: 100%;
          padding: 20px;
          border: 2px solid var(--el-color-primary-light-8);
          border-radius: 16px;
          font-size: 16px;
          line-height: 1.6;
          color: var(--text-color);
          background-color: var(--bg-color);
          resize: none;
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

        .submit-btn {
          background: linear-gradient(120deg, var(--el-color-primary), var(--el-color-primary-light-3));
          color: white;
          border: none;
          padding: 16px 40px;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
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

          &:hover:not(:disabled) {
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
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;

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