<template>
    <div class="article-list-container">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>{{ pageTitle }}</span>
                </div>
            </template>

            <!-- 搜索区域 -->
            <div class="search-container">
                <el-input v-model="searchTitle" placeholder="搜索文章标题" class="search-input" clearable
                    @keyup.enter="handleSearch">
                    <template #prefix>
                        <el-icon><Search /></el-icon>
                    </template>
                </el-input>

                <el-input v-model="searchContent" placeholder="搜索文章内容" class="search-input" clearable
                    @keyup.enter="handleSearch">
                    <template #prefix>
                        <el-icon><Search /></el-icon>
                    </template>
                </el-input>

                <!-- 审核状态筛选 -->
                <el-select v-model="searchStatus" placeholder="审核状态" clearable>
                    <el-option label="待审核" value="under_audit" />
                    <el-option label="审核未通过" value="failed_audit" />
                    <el-option label="已发布" value="published" />
                    <el-option label="已删除" value="deleted" />
                </el-select>

                <el-button type="primary" @click="handleSearch">搜索</el-button>
                <el-button @click="resetSearch">重置</el-button>
            </div>

            <!-- 文章列表表格 -->
            <el-table :data="articleList" border style="width: 100%" v-loading="loading">
                <el-table-column prop="articleId" label="ID" width="80" />
                <el-table-column prop="articleTitle" label="标题" show-overflow-tooltip />
                <el-table-column label="作者" width="120">
                    <template #default="scope">
                        {{ scope.row.userInfo?.userName || '未知' }}
                    </template>
                </el-table-column>
                <el-table-column label="标签" width="180">
                    <template #default="scope">
                        <el-tag v-for="label in scope.row.labels" :key="label.labelId" size="small" class="label-tag">
                            {{ label.labelName }}
                        </el-tag>
                        <span v-if="!scope.row.labels || scope.row.labels.length === 0">无标签</span>
                    </template>
                </el-table-column>
                <el-table-column label="审核状态" width="120">
                    <template #default="scope">
                        <el-tag :type="getStatusTagType(scope.row.isDeleted === 1 ? 'deleted' : scope.row.status)"
                            effect="dark">
                            {{ getStatusText(scope.row.status, scope.row.isDeleted) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="阅读/点赞" width="100">
                    <template #default="scope">
                        {{ scope.row.viewCount || 0 }} / {{ scope.row.likeCount || 0 }}
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" width="180">
                    <template #default="scope">
                        {{ scope.row.createTime.replace('T', ' ') }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="220" fixed="right">
                    <template #default="scope">
                        <div class="action-buttons">
                            <!-- 查看按钮始终显示 -->
                            <el-button type="primary" size="small" class="btn-view" @click="handleView(scope.row)">
                                查看
                            </el-button>

                            <!-- 操作按钮组 -->
                            <div class="action-group">
                                <!-- 审核操作 -->
                                <template v-if="scope.row.status === 'under_audit' && scope.row.isDeleted === 0">
                                    <el-dropdown @command="(command) => handleStatusChange(scope.row, command)">
                                        <el-button type="warning" size="small">
                                            审核操作<el-icon><arrow-down /></el-icon>
                                        </el-button>
                                        <template #dropdown>
                                            <el-dropdown-menu>
                                                <el-dropdown-item command="published">通过审核</el-dropdown-item>
                                                <el-dropdown-item command="failed_audit">审核不通过</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </template>
                                    </el-dropdown>
                                </template>

                                <!-- 恢复/删除按钮 -->
                                <template v-if="scope.row.isDeleted === 1">
                                    <el-button type="success" size="small" @click="handleRestore(scope.row)">
                                        恢复
                                    </el-button>
                                </template>
                                <template v-else-if="scope.row.status === 'published'">
                                    <el-button type="danger" size="small" @click="handleDelete(scope.row)">
                                        删除
                                    </el-button>
                                </template>
                            </div>
                        </div>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="total"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'; // 移除了 reactive 因为没有使用
import { useRouter, useRoute } from 'vue-router';
import { Search, ArrowDown } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useArticleApi } from '@/services/modules/article';
import type { ArticleDTO, ArticlePageQuery } from '@/types/article';
import { getStatusTagType, getStatusText } from '@/utils/articleUtils';


const router = useRouter();
const route = useRoute();

const pageTitle = computed(() => '文章管理');

// 搜索参数
const searchTitle = ref('');
const searchContent = ref('');
const searchStatus = ref(''); 

// 文章列表数据
const articleList = ref<ArticleDTO[]>([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);


// 搜索文章
const handleSearch = () => {
    currentPage.value = 1;
    fetchArticleList();
};

// 重置搜索
const resetSearch = () => {
    searchTitle.value = '';
    searchContent.value = '';
    searchStatus.value = '';
    currentPage.value = 1;
    fetchArticleList();
};

// 获取文章列表
const fetchArticleList = async () => {
    loading.value = true;
    try {
        const params: ArticlePageQuery = {
            page: currentPage.value,
            pageSize: pageSize.value,
            articleTitle: searchTitle.value || undefined,
            articleContent: searchContent.value || undefined,
        };

        if (searchStatus.value) {
            if (searchStatus.value === 'deleted') {
                params.isDeleted = 1;
                params.status = 'published';
            } else {
                params.status = searchStatus.value;
                params.isDeleted = 0;
            }
        }
        
        const response = await useArticleApi.page(params);
        articleList.value = response.data;
        total.value = response.total;
    } catch (error: any) {
        ElMessage.error(error.message || '获取文章列表失败');
    } finally {
        loading.value = false;
    }
};

// 监听路由变化，重新加载数据 (如果列表页也可能因路由路径变化而展示不同内容)
watch(() => route.path, () => {
    // 如果此页面会根据不同的 route.path 显示不同的内容，则需要此 watch
    // 例如 /article/list/all vs /article/list/drafts
    // 如果只是通过内部筛选变化，则此 watch 可能不需要，或者需要更精细的逻辑
    resetSearch(); // 假设路径变化意味着全新的列表查询
}, { immediate: true }); // 根据需要决定是否 immediate

const handleSizeChange = (newSize: number) => {
    pageSize.value = newSize;
    fetchArticleList();
};

const handleCurrentChange = (newPage: number) => {
    currentPage.value = newPage;
    fetchArticleList();
};


// 更改文章审核状态
const handleStatusChange = async (article: ArticleDTO, status: string) => {
  try {
    if (article.status !== 'under_audit') {
      ElMessage.warning('只有待审核状态的文章才能进行审核操作');
      return;
    }
    
    const statusText = getStatusText(status, 0);
    await ElMessageBox.confirm(
      `确定要将文章《${article.articleTitle}》的状态更改为"${statusText}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    loading.value = true;
    // 使用文章作者的用户名
    const userName = article.userInfo?.userName || '未知用户';
    await useArticleApi.updateStatus(article.articleId, status, userName);
    ElMessage.success(`文章状态已更改为"${statusText}"`);
    fetchArticleList(); // 刷新列表
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '更改文章状态失败');
    }
  } finally {
    loading.value = false;
  }
};

// 删除文章
const handleDelete = async (article: ArticleDTO) => {
  try {
    // 只有已发布状态且未删除的文章才能删除
    if (article.status !== 'published' || article.isDeleted === 1) {
      ElMessage.warning('只有已发布状态的文章才能删除');
      return;
    }
    
    await ElMessageBox.confirm(
      `确定要删除文章《${article.articleTitle}》吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    );
    
    loading.value = true;
    await useArticleApi.delete(article.articleId);
    ElMessage.success('文章删除成功');
    fetchArticleList(); // 刷新列表
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除文章失败');
    }
  } finally {
    loading.value = false;
  }
};

// 恢复删除的文章为待审核状态
const handleRestore = async (article: ArticleDTO) => {
  try {
    // 只有已删除的文章才能恢复
    if (article.isDeleted !== 1) {
      ElMessage.warning('只有已删除的文章才能恢复');
      return;
    }
    
    await ElMessageBox.confirm(
      `确定要将文章《${article.articleTitle}》恢复为待审核状态吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    loading.value = true;
    await useArticleApi.restore(article.articleId);
    ElMessage.success('文章已恢复为待审核状态');
    fetchArticleList(); // 刷新列表
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '恢复文章失败');
    }
  } finally {
    loading.value = false;
  }
};

// 查看文章
const handleView = (article: ArticleDTO) => {
    router.push({
        path: `/article/view/${article.articleId}`,
        query: { 
            isDeleted: article.isDeleted.toString() 
        }
    });
};
</script>

<style scoped>
.action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
}

.btn-view {
    margin-right: 8px;
}

.action-group {
    display: flex;
    gap: 8px;
}

/* 调整下拉按钮图标间距 */
.el-button [class*=el-icon] + span {
    margin-left: 4px;
}

.article-list-container {
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.search-container {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
}

.search-input {
    width: 200px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.label-tag {
    margin-right: 5px;
    margin-bottom: 5px;
}
</style>