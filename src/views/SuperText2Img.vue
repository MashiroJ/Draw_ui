<!-- src/components/SuperDrawForm.vue -->
<template>
  <div class="draw-form-container">
    <!-- 文生图标题卡片 -->
    <el-card class="info-card welcome-card" style="margin-bottom: 20px;">
      <div class="info-card-content welcome-content">
        <div class="info-text welcome-text">
          <h2 class="welcome-title">超级文生图</h2>
          <p class="welcome-subtitle">文字织就 超维世界</p>
        </div>
      </div>
    </el-card>

    <div class="content-wrapper">
      <!-- 左侧表单区域 -->
      <div class="left-panel">
        <div class="form-container">
          <!-- 提示词输入 -->
          <div class="form-item">
            <label for="prompt">提示词</label>
            <div class="prompt-template-selector">
              <el-select v-model="selectedTemplate" placeholder="选择提示词模板" @change="handleTemplateChange"
                class="template-select">
                <el-option-group label="人物模板">
                  <el-option v-for="item in characterTemplates" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-option-group>
                <el-option-group label="场景模板">
                  <el-option v-for="item in sceneTemplates" :key="item.value" :label="item.label" :value="item.value" />
                </el-option-group>
                <el-option-group label="风格模板">
                  <el-option v-for="item in styleTemplates" :key="item.value" :label="item.label" :value="item.value" />
                </el-option-group>
              </el-select>
            </div>
            <!-- 原有的提示词输入框 -->
            <el-input type="textarea" id="prompt" v-model="formData.drawDto.prompt" rows="6" class="prompt-input"
              placeholder="请输入提示词..." />
          </div>

          <!-- 反向提示词输入 -->
          <div class="form-item">
            <label for="negativePrompt">反向提示词</label>
            <el-input type="textarea" id="negativePrompt" v-model="formData.drawDto.negativePrompt" rows="4"
              class="prompt-input" placeholder="请输入反向提示词..." />
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
                <el-option-group label="二次元系列">
                  <el-option label="AOM3A1B 二次元风格" :value="1" />
                  <el-option label="Counterfeit V2.5 背景写实风格" :value="2" />
                </el-option-group>
                <el-option-group label="写实系列">
                  <el-option label="majicMIX alpha 写实风格男" :value="3" />
                  <el-option label="majicMIX realistic 写实风格女" :value="4" />
                </el-option-group>
                <el-option-group label="会员系列（以下模型只为会员用户开放）">
                  <el-option label="AnimeKawa 动漫风格" :value="5" :disabled="isNormalUser"
                    :class="{ 'member-model-disabled': isNormalUser }" />
                  <el-option label="illustration 插画风格" :value="6" :disabled="isNormalUser"
                    :class="{ 'member-model-disabled': isNormalUser }" />
                </el-option-group>
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
                  <el-option label="euler_ancestral" :value="3" />
                  <el-option label="euler_ancestral_cfg_pp" :value="4" />
                  <el-option label="heun" :value="5" />
                  <el-option label="heunpp2" :value="6" />
                  <el-option label="dpm_2" :value="7" />
                  <el-option label="dpm_2_ancestral" :value="8" />
                  <el-option label="lms" :value="9" />
                  <el-option label="dpm_fast" :value="10" />
                  <el-option label="dpm_adaptive" :value="11" />
                  <el-option label="dpmpp_2s_ancestral" :value="12" />
                  <el-option label="dpmpp_2s_ancestral_cfg_pp" :value="13" />
                  <el-option label="dpmpp_sde_gpu" :value="15" />
                  <el-option label="dpmpp_2m_cfg_pp" :value="17" />
                  <el-option label="dpmpp_2m_sde" :value="18" />
                  <el-option label="dpmpp_2m_sde_gpu" :value="19" />
                  <el-option label="dpmpp_3m_sde" :value="20" />
                  <el-option label="dpmpp_3m_sde_gpu" :value="21" />
                  <el-option label="ddpm" :value="22" />
                  <el-option label="lcm" :value="23" />
                  <el-option label="ipndm" :value="24" />
                  <el-option label="ipndm_v" :value="25" />
                  <el-option label="deis" :value="26" />
                  <el-option label="ddim" :value="27" />
                  <el-option label="uni_pc_bh2" :value="29" />
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
              <el-switch v-model="formData.drawDto.isPublic" :active-value="1" :inactive-value="0" active-text="公开"
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
                <span :class="{ 'line-through': isMember }">4积分</span>
                <span class="member-price">
                  <template v-if="isMember">
                    <span class="discount-tag">(会员5折)</span>
                    <span>2积分</span>
                  </template>
                  <template v-else>
                    <span class="discount-tag line-through">(会员5折)</span>
                    <span class="line-through">2积分</span>
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
        <div v-else class="empty-state">
          等待生成图片...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { superText2img } from '@/api/draw'
import { ElMessage } from 'element-plus'
import { usePointsStore } from '@/stores/points'
import { useThemeStore } from '@/stores/theme'
import { getUserRoles } from '@/api/user'
import { useUserInfoStore } from '@/stores/userinfo'

const themeStore = useThemeStore()
const userInfoStore = useUserInfoStore()

const loading = ref(false)
const generatedImageUrl = ref('')

// 表单数据
const formData = reactive({
  drawDto: {
    prompt: '1girl,sweater,white background,',
    negativePrompt: '(worst quality:2),(low quality:2),(normal quality:2),lowres,watermark,',
    steps: 20,
    cfg: 7,
    denoise: 0.7,
    isPublic: 1
  },
  imageSize: 3,    // 默认 SQUARE_512 的 code 是 3
  checkpoint: 1,   // 默认 AOM3A1B 的 code 是 1
  sampler: 1,      // 默认 EULER 的 code 是 1
  scheduler: 1     // 默认 NORMAL 的 code 是 1
})

const pointsStore = usePointsStore()

const roleGroup = ref('')

// 获取用户角色
const getUser = async () => {
  const userId = userInfoStore.userInfo.id
  try {
    const response = await getUserRoles(userId)
    roleGroup.value = response.data
  } catch (error) {
    console.error('获取用户角色失败:', error)
    ElMessage.error('获取用户角色失败')
  }
}

// 判断是否是会员
const isMember = computed(() => {
  return roleGroup.value === '会员用户'
})

const isNormalUser = computed(() => {
  return roleGroup.value === '普通用户'
})

onMounted(() => {
  getUser()
})

// 获取父组件Layout的引用
const layoutRef = inject('layoutRef');

const selectedTemplate = ref('')

// 提示词模板数据
const characterTemplates = [
  {
    label: '动漫少女',
    value: '1girl, solo, beautiful detailed eyes, detailed face, cute, young, kawaii'
  },
  {
    label: '英俊男性',
    value: '1boy, handsome male, mature, detailed face, masculine'
  },
  {
    label: '儿童',
    value: '1child, cute, innocent, young, cheerful, playful'
  }
]

const sceneTemplates = [
  {
    label: '圣诞节',
    value: 'christmas,gift box,christmas tree,red dress,simple background,blonde hair,in winter'
  },
  {
    label: '自然风景',
    value: 'landscape, nature, trees, mountains, clouds, beautiful sky, scenic'
  },
  {
    label: '城市街景',
    value: 'cityscape, urban, buildings, street view, modern city, architectural'
  },
  {
    label: '梦幻场景',
    value: 'fantasy landscape, magical, ethereal, dreamy, mystical atmosphere'
  }

]

const styleTemplates = [
  {
    label: '水彩画风',
    value: 'watercolor, soft colors, artistic, painting style, colorful'
  },
  {
    label: '赛博朋克',
    value: 'cyberpunk, neon lights, futuristic, sci-fi, high tech, dark atmosphere'
  },
  {
    label: '二次元风格',
    value: 'anime style, cel shading, vibrant colors, 2D, illustration'
  },
  {
    label: '插画风格',
    value: 'masterpiece,best quality,8K,official art,ultra high res,illustration'
  },
  {
    label: '动画风格',
    value: 'white background,white and black'
  }
]

// 处理模板选择
const handleTemplateChange = (value) => {
  if (value) {
    // 如果原有提示词不为空,则在末尾添加逗号
    const currentPrompt = formData.drawDto.prompt.trim()
    formData.drawDto.prompt = currentPrompt
      ? `${currentPrompt}, ${value}`
      : value
    // 重置选择器
    selectedTemplate.value = ''
  }
}

const handleSubmit = async () => {
  if (!formData.drawDto.prompt.trim()) {
    ElMessage.warning('请输入提示词');
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
    const res = await superText2img(
      {
        ...formData.drawDto,  // 包含 prompt, negativePrompt, steps, cfg, denoise, isPublic
        steps: steps,
        cfg: cfg,
        denoise: denoise
      },
      formData.imageSize,
      formData.checkpoint,
      formData.sampler,
      formData.scheduler
    );

    if (res.code === 200) {
      ElMessage.success('图像生成成功');
      generatedImageUrl.value = res.data;
      formData.drawDto.prompt = '';
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

        :deep(.el-textarea) {
          .el-textarea__inner {
            padding: 20px;
            border: 2px solid var(--el-color-primary-light-8);
            border-radius: 16px;
            font-size: 16px;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--bg-color);
            min-height: 200px;
            box-shadow: none;
            transition: all 0.3s ease;

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
      }

      /* 参数设置区域新设计 */
      .parameters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 24px;
        margin-bottom: 32px;
        padding: 24px;
        background: var(--el-color-primary-light-9);
        border-radius: 16px;
        border: 1px solid var(--el-color-primary-light-5);

        .form-item {
          margin-bottom: 0;

          :deep(.el-select),
          :deep(.el-input-number),
          :deep(.el-slider) {
            width: 100%;

            .el-input__wrapper {
              border-radius: 12px;
              box-shadow: none;
              border: 2px solid var(--el-color-primary-light-8);
              background: var(--bg-color);

              &:hover {
                border-color: var(--el-color-primary-light-3);
              }

              &.is-focus {
                border-color: var(--el-color-primary);
                box-shadow: 0 0 0 4px var(--el-color-primary-light-8);
              }
            }
          }

          :deep(.el-slider) {
            --el-slider-button-size: 20px;
            --el-slider-height: 8px;

            .el-slider__runway {
              height: var(--el-slider-height);
              background: var(--el-color-primary-light-8);
            }

            .el-slider__bar {
              height: var(--el-slider-height);
              background: var(--el-color-primary);
            }

            .el-slider__button-wrapper {
              width: var(--el-slider-button-size);
              height: var(--el-slider-button-size);
            }

            .el-slider__button {
              border: none;
              background: var(--el-color-primary);
              box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.4);
              transition: transform 0.3s ease;

              &:hover {
                transform: scale(1.2);
              }
            }
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
          padding: 16px 24px;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          min-width: 200px;

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
            gap: 8px;
            margin-left: 12px;
            padding-left: 12px;
            border-left: 1px solid rgba(255, 255, 255, 0.3);
            font-size: 14px;
            white-space: nowrap;

            .original-price {
              text-decoration: line-through;
              opacity: 0.8;
            }

            .member-price {
              display: flex;
              align-items: center;
              gap: 8px;

              .discount-tag {
                color: #ff4d4f;
                font-size: 12px;
                font-weight: bold;
              }
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

      .parameters-grid {
        grid-template-columns: 1fr;
        padding: 16px;
      }
    }
  }
}

.points-cost {
  .line-through {
    text-decoration: line-through;
    opacity: 0.6;
  }
}

.member-model-disabled {
  text-decoration: line-through;
  color: #ff4d4f;
}

.prompt-template-selector {
  margin-bottom: 12px;

  .template-select {
    width: 100%;

    :deep(.el-input__wrapper) {
      border-radius: 12px;
      box-shadow: none;
      border: 2px solid var(--el-color-primary-light-8);
      background: var(--bg-color);

      &:hover {
        border-color: var(--el-color-primary-light-3);
      }

      &.is-focus {
        border-color: var(--el-color-primary);
        box-shadow: 0 0 0 4px var(--el-color-primary-light-8);
      }
    }
  }
}

.prompt-input {
  margin-top: 8px;
}
</style>
