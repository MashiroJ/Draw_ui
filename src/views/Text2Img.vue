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
        <div class="form-container">
          <div class="form-item">
            <label for="prompt">提示词</label>
            <el-input type="textarea" id="prompt" v-model="formData.prompt" rows="13" class="prompt-input"
              placeholder="请输入提示词..." />
          </div>

          <!-- 添加模型选择 -->
          <div class="form-item">
            <label>模型选择</label>
            <el-select v-model="formData.checkpoint" placeholder="请选择模型">
              <el-option-group label="二次元系列">
                <el-option label="AOM3A1B 二次元风格" :value="1" />
                <el-option label="Counterfeit V2.5 背景写实风格" :value="2" />
              </el-option-group>
              <el-option-group label="写实系列">
                <el-option label="majicMIX alpha 写实风格男" :value="3" />
                <el-option label="majicMIX realistic 写实风格女" :value="4" />
              </el-option-group>
              <el-option-group label="会员系列（以下模型只为会员用户开发）">
                <el-option label="AnimeKawa 动漫风格" :value="5" :disabled="isNormalUser"
                  :class="{ 'member-model-disabled': isNormalUser }" />
                <el-option label="illustration 插画风格" :value="6" :disabled="isNormalUser"
                  :class="{ 'member-model-disabled': isNormalUser }" />
              </el-option-group>
            </el-select>
          </div>

          <!-- 在模型选择后添加尺寸选择 -->
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

          <!-- 底部操作区域：按钮 -->
          <div class="form-actions">
            <div class="switch-item">
              <el-switch v-model="formData.isPublic" :active-value="1" :inactive-value="0" active-text="公开"
                inactive-text="私有" />
            </div>
            <el-button class="submit-btn" type="primary" :disabled="loading" @click="handleSubmit">
              <template #icon>
                <el-icon v-if="loading">
                  <Loading />
                </el-icon>
              </template>
              <span>{{ loading ? '生成中...' : '生成图像' }}</span>
              <span class="points-cost">
                <el-icon>
                  <Coin />
                </el-icon>
                <span :class="{ 'line-through': isMember }">2积分</span>
                <span class="member-price">
                  <template v-if="isMember">
                    <span class="discount-tag">(会员5折)</span>
                    <span>1积分</span>
                  </template>
                  <template v-else>
                    <span class="discount-tag line-through">(会员5折)</span>
                    <span class="line-through">1积分</span>
                  </template>
                </span>
              </span>
            </el-button>
          </div>
        </div>
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
import { ref, reactive, computed, onMounted, inject } from 'vue';
import { text2img } from '@/api/draw';
import { ElMessage } from 'element-plus';
import { Coin } from '@element-plus/icons-vue';
import { useUserInfoStore } from '@/stores/userinfo';
import { getUserRoles } from '@/api/user';

// 主题存储（
import { useThemeStore } from '@/stores/theme';
const themeStore = useThemeStore();
const userInfoStore = useUserInfoStore();

const roleGroup = ref('');

// 获取用户角色
const getUser = async () => {
  const userId = userInfoStore.userInfo.id;
  try {
    const response = await getUserRoles(userId);
    roleGroup.value = response.data;
    console.log(roleGroup.value);
  } catch (error) {
    console.error('获取用户角色失败:', error);
    ElMessage.error('获取用户角色失败');
  }
};

// 判断是否是会员
const isMember = computed(() => {
  return roleGroup.value === '会员用户';
});

const isNormalUser = computed(() => {
  return roleGroup.value === '普通用户';
});

const loading = ref(false);
const generatedImageUrl = ref('');
const formData = reactive({
  prompt: '',
  isPublic: 1, // 默认为公开
  checkpoint: 1, // 默认选择 AOM3A1B
  imageSize: 3, // 默认选择 512x512
});

// 获取父组件Layout的引用
const layoutRef = inject('layoutRef');

const handleSubmit = async () => {
  if (!formData.prompt.trim()) {
    ElMessage.warning('请输入提示词');
    return;
  }

  loading.value = true;
  try {
    const res = await text2img({
      prompt: formData.prompt,
      isPublic: formData.isPublic
    }, formData.checkpoint, formData.imageSize);

    if (res.code === 200) {
      ElMessage.success('图像生成成功');
      generatedImageUrl.value = res.data;
      formData.prompt = '';
      // 确保 layoutRef 存在且调用方法
      if (layoutRef.value) {
        await layoutRef.value.updatePoints();
      }
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

onMounted(() => {
  getUser();
});
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
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
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
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .welcome-subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
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
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
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
          outline: none;
          min-height: 200px;

          &::placeholder {
            color: var(--el-color-primary-light-5);
          }

          &:hover {
            border-color: var(--el-color-primary-light-3);
          }

          &:focus {
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
            background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.2), transparent);
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

          .points-cost {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin-left: 8px;
            padding-left: 8px;
            border-left: 1px solid rgba(255, 255, 255, 0.3);
            font-size: 14px;

            .el-icon {
              font-size: 16px;
            }
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
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
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
            var(--el-color-primary-light-9) 100%);
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
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

          &:hover {
            transform: scale(1.05);
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
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
          background: linear-gradient(45deg,
              transparent 0%,
              rgba(var(--el-color-primary-rgb), 0.1) 50%,
              transparent 100%);
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

.points-cost {
  .line-through {
    text-decoration: line-through;
    opacity: 0.6;
  }

  .member-price {
    .discount-tag {
      color: #ff4d4f;
      font-size: 12px;
      font-weight: bold;
    }
  }
}

.member-model-disabled {
  text-decoration: line-through;
  color: #ff4d4f;
}
</style>