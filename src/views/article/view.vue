<template>
    <div class="article-view-container">
        <el-card v-loading="loading">
            <template #header>
                <div class="card-header">
                    <span>查看文章</span>
                    <el-button @click="goBack">返回</el-button>
                </div>
            </template>

            <el-descriptions :column="1" border v-if="article.articleId">
                <el-descriptions-item label="文章标题">{{ article.articleTitle }}</el-descriptions-item>
                <el-descriptions-item label="作者">{{ article.userInfo?.userName || '未知' }}</el-descriptions-item>
                <el-descriptions-item label="标签">
                    <el-tag v-for="label in article.labels" :key="label.labelId" size="small" class="label-tag">
                        {{ label.labelName }}
                    </el-tag>
                    <span v-if="!article.labels || article.labels.length === 0">无标签</span>
                </el-descriptions-item>
                <el-descriptions-item label="审核状态">
                    <el-tag :type="getStatusTagType(article.isDeleted === 1 ? 'deleted' : article.status)" effect="dark">
                        {{ getStatusText(article.status, article.isDeleted) }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="阅读/点赞">
                    {{ article.viewCount || 0 }} / {{ article.likeCount || 0 }}
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">
                    {{ article.createTime?.replace('T', ' ') }}
                </el-descriptions-item>
                <el-descriptions-item label="文章内容">
                    <div v-if="article.articleContent" class="article-content markdown-body" v-html="article.articleContent"></div>
                    <el-empty v-else description="暂无内容" />
                </el-descriptions-item>
            </el-descriptions>
            <el-empty v-else description="文章不存在或已被删除" />
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'; // 引入 watch
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useArticleApi } from '@/services/modules/article';
import type { ArticleDTO } from '@/types/article';
import { getStatusTagType, getStatusText } from '@/utils/articleUtils'; // 引入工具函数
import 'github-markdown-css';

const router = useRouter();
const route = useRoute();
const article = ref<ArticleDTO>({} as ArticleDTO);
const loading = ref(false);

// 获取文章详情
const fetchArticle = async () => {
    const articleId = route.params.id as string;
    const isDeleted = route.query.isDeleted === '1';
    
    if (!articleId) return;
    try {
        const response = isDeleted 
            ? await useArticleApi.getDeletedArticleById(articleId)
            : await useArticleApi.getArticleById(articleId);
        article.value = response;
    } catch (error: any) {
        ElMessage.error(error.message || '获取文章详情失败');
    }
};

// 监听路由参数变化，重新加载数据
watch(
    () => route.params.id,
    (newId) => {
        if (newId) {
            fetchArticle();
        }
    },
    { immediate: true } 
);


// 返回列表
const goBack = () => {
    router.back();
};
</script>

<style scoped>
.article-view-container {
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.label-tag {
    margin-right: 5px;
}

.article-content {
    padding: 20px;
    background-color: #ffffff;
    border-radius: 4px;
    line-height: 1.6;
    overflow-x: auto;
    color: #2c3e50;
}

:deep(.markdown-body) {
    box-sizing: border-box;
    min-width: 200px;
    max-width: 980px;
    margin: 0 auto;
    color: #2c3e50;
}

:deep(.markdown-body h1),
:deep(.markdown-body h2),
:deep(.markdown-body h3),
:deep(.markdown-body h4),
:deep(.markdown-body h5),
:deep(.markdown-body h6) {
    color: #1f2937;
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
}

:deep(.markdown-body p) {
    margin-top: 0;
    margin-bottom: 16px;
}

:deep(.markdown-body pre) {
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #282c34;
    border-radius: 6px;
    color: #abb2bf;
}

:deep(.markdown-body code) {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: #282c34;
    border-radius: 6px;
    color: #abb2bf;
}

:deep(.markdown-body blockquote) {
    padding: 0 1em;
    color: #6b7280;
    border-left: 0.25em solid #e5e7eb;
    margin: 0 0 16px 0;
}

:deep(.markdown-body a) {
    color: #3b82f6;
    text-decoration: none;
}

:deep(.markdown-body a:hover) {
    text-decoration: underline;
}
</style>