<!-- App.vue -->
<script setup>
import { ref, onMounted, provide } from 'vue';

// 主题状态
const isDarkTheme = ref(false);

// 切换主题
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  const theme = isDarkTheme.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme); // 设置 data-theme 属性
  localStorage.setItem('theme', theme); // 保存到本地，持久化
};

// 页面加载时初始化主题
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  isDarkTheme.value = savedTheme === 'dark'; // 判断是否为暗色主题
  document.documentElement.setAttribute('data-theme', isDarkTheme.value ? 'dark' : 'light');
});

const layoutRef = ref(null);
provide('layoutRef', layoutRef);
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" ref="layoutRef" />
    </transition>
  </router-view>
</template>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 这里不再需要定义CSS变量，因为它们已在main.scss中统一定义 */
.theme-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  background-color: var(--header-bg);
  color: var(--text-color);
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.theme-toggle:hover {
  background-color: var(--menu-hover);
}
</style>
