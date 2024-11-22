<template>
    <div class="not-found-container">
        <div class="content">
            <h1 class="error-code">404</h1>
            <div class="error-message">
                <h2>抱歉，页面不见了</h2>
                <p>您访问的页面可能已被删除、更名或暂时不可用</p>
            </div>
            <div class="actions">
                <el-button type="primary" @click="goBack">返回上一页</el-button>
                <el-button @click="goHome">返回首页</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
    router.go(-1)
}

const goHome = () => {
    router.push('/')
}
</script>

<style scoped>
.not-found-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f7fa;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.content {
    text-align: center;
    padding: 2rem;
}

.error-code {
    font-size: 120px;
    color: #409eff;
    margin: 0;
    line-height: 1;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    animation: bounce 2s ease infinite;
}

.error-message {
    margin: 2rem 0;
}

.error-message h2 {
    font-size: 28px;
    color: #303133;
    margin-bottom: 1rem;
}

.error-message p {
    font-size: 16px;
    color: #606266;
    margin: 0;
}

.actions {
    margin-top: 2rem;
}

.actions .el-button {
    margin: 0 10px;
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-20px);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .error-code {
        font-size: 80px;
    }

    .error-message h2 {
        font-size: 24px;
    }

    .error-message p {
        font-size: 14px;
    }

    .actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .actions .el-button {
        margin: 0;
    }
}
</style>