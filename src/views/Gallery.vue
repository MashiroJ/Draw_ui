<template>
    <div class="gallery">
        <h1>画廊展示</h1>
        <div class="image-list">
            <img v-for="image in images" :key="image.id" :src="image.src" :alt="image.alt" class="gallery-image" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const images = ref([
    { id: 1, src: new URL('@/assets/images/image1.png', import.meta.url).href, alt: 'Image 1' },
    { id: 2, src: new URL('@/assets/images/image2.png', import.meta.url).href, alt: 'Image 2' },
    { id: 3, src: new URL('@/assets/images/image3.png', import.meta.url).href, alt: 'Image 3' },
    { id: 4, src: new URL('@/assets/images/image4.png', import.meta.url).href, alt: 'Image 4' },
    // 添加更多图像
]);
</script>

<style scoped>
.gallery {
    padding: 20px;
}

.image-list {
    display: flex;
    flex-wrap: wrap;
}

.gallery-image {
    width: 200px;
    height: auto;
    margin: 10px;
    border-radius: 5px;
    transition: transform 0.3s ease; /* 添加过渡效果 */
}

.gallery-image:hover {
    transform: scale(1.1); /* 鼠标悬停时放大 */
}
</style>
