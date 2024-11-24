// src/stores/theme.js
import { defineStore } from 'pinia';
import { ref, onMounted, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  // 主题状态：true 表示暗色主题，false 表示亮色主题
  const isDark = ref(false);

  // 初始化主题：从 localStorage 读取或使用系统偏好
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      isDark.value = savedTheme === 'dark';
    } else {
      // 可选：根据系统偏好设置初始主题
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDark.value = prefersDark;
    }
    applyTheme();
  };

  // 应用主题：设置 data-theme 属性和 localStorage
  const applyTheme = () => {
    const theme = isDark.value ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value;
    applyTheme();
  };

  // 监视主题状态变化并应用
  watch(isDark, () => {
    applyTheme();
  });

  // 在组件挂载时初始化主题
  onMounted(() => {
    initializeTheme();
  });

  return { isDark, toggleTheme };
}, {
  persist: true // 使用 pinia-plugin-persistedstate 进行持久化
});
