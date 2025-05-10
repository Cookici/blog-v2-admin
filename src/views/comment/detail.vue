<template>
  <div class="comment-detail-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>评论详情</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>
      
      <!-- 主评论 -->
      <div class="main-comment" v-loading="loading">
        <div class="user-info">
          <el-avatar :src="mainComment.userInfo?.userPhoto" />
          <span>{{ mainComment.userInfo?.userName }}</span>
          <el-tag v-if="!mainComment.parentCommentId || mainComment.parentCommentId === '0'" type="success" size="small">顶层评论</el-tag>
          <el-tag v-else type="info" size="small">子评论</el-tag>
          <el-tag v-if="mainComment.isDeleted === 1" type="danger" size="small">已删除</el-tag>
        </div>
        <div class="content">{{ mainComment.commentContent }}</div>
        <div v-if="mainComment.commentImg" class="comment-img">
          <el-image :src="mainComment.commentImg" :preview-src-list="[mainComment.commentImg]" />
        </div>
        <div class="time">{{ formatTime(mainComment.createTime) }}</div>
        <div class="actions" v-if="mainComment.isDeleted === 0">
          <el-button type="danger" @click="deleteComment(mainComment)">删除评论</el-button>
        </div>
      </div>

      <!-- 子评论列表 -->
      <template v-if="!mainComment.parentCommentId || mainComment.parentCommentId === '0'">
        <el-divider content-position="left">子评论列表</el-divider>
        
        <!-- 子评论搜索 -->
        <div class="search-container">
          <el-input
            v-model="childSearchKeyword"
            placeholder="搜索子评论内容"
            class="search-input"
            clearable
            @keyup.enter="handleChildSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleChildSearch">搜索</el-button>
          <el-button @click="resetChildSearch">重置</el-button>
        </div>
        
        <div class="child-comments" v-loading="childrenLoading">
          <div v-if="childComments.length === 0" class="no-comments">
            <el-empty description="暂无子评论" />
          </div>
          <div v-for="comment in childComments" :key="comment.commentId" class="child-comment">
            <div class="user-info">
              <el-avatar :src="comment.userInfo?.userPhoto" />
              <span>{{ comment.userInfo?.userName }}</span>
              <span v-if="comment.toUserInfo">回复 {{ comment.toUserInfo.userName }}</span>
              <el-tag v-if="comment.isDeleted === 1" type="danger" size="small">已删除</el-tag>
            </div>
            <div class="content">{{ comment.commentContent }}</div>
            <div v-if="comment.commentImg" class="comment-img">
              <el-image :src="comment.commentImg" :preview-src-list="[comment.commentImg]" />
            </div>
            <div class="time">{{ formatTime(comment.createTime) }}</div>
            <div class="actions" v-if="comment.isDeleted === 0">
              <el-button type="primary" size="small" @click="viewChildDetail(comment)">查看详情</el-button>
              <el-button type="danger" size="small" @click="deleteComment(comment)">删除</el-button>
            </div>
          </div>
          
          <!-- 子评论分页 -->
          <div class="pagination-container" v-if="childTotal > 0">
            <el-pagination
              v-model:current-page="childCurrentPage"
              v-model:page-size="childPageSize"
              :total="childTotal"
              @current-change="fetchChildComments"
              @size-change="handleChildSizeChange"
              layout="total, prev, pager, next"
              :page-sizes="[5, 10, 20]"
              small
            />
          </div>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCommentApi } from '@/services/modules/comment';
import type { CommentDTO, CommentChildPageQuery, CommentDeleteCommand } from '@/types/comment';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const commentId = ref(route.params.id as string);

const mainComment = ref<CommentDTO>({} as CommentDTO);
const childComments = ref<CommentDTO[]>([]);
const loading = ref(false);
const childrenLoading = ref(false);
const childTotal = ref(0);
const childCurrentPage = ref(1);
const childPageSize = ref(10);
const childSearchKeyword = ref('');

// 格式化时间
const formatTime = (time?: string) => {
  if (!time) return '';
  return time.replace('T', ' ');
};

// 加载主评论详情
const loadData = async () => {
  if (!commentId.value) return;
  
  try {
    loading.value = true;
    const response = await useCommentApi.get(commentId.value);
    mainComment.value = response;
    
    // 如果是顶层评论，加载子评论
    if (!mainComment.value.parentCommentId || mainComment.value.parentCommentId === '0') {
      fetchChildComments();
    }
  } catch (error) {
    ElMessage.error('获取评论详情失败');
  } finally {
    loading.value = false;
  }
};

// 加载子评论
const fetchChildComments = async () => {
  if (!mainComment.value.commentId || (mainComment.value.parentCommentId && mainComment.value.parentCommentId !== '0')) return;
  
  try {
    childrenLoading.value = true;
    const params: CommentChildPageQuery = {
      commentId: mainComment.value.commentId,
      page: childCurrentPage.value,
      pageSize: childPageSize.value,
      keyword: childSearchKeyword.value
    };
    
    const response = await useCommentApi.pageChild(params);
    childComments.value = response.data || [];
    childTotal.value = response.total || 0;
  } catch (error) {
    ElMessage.error('获取子评论失败');
    childComments.value = [];
    childTotal.value = 0;
  } finally {
    childrenLoading.value = false;
  }
};

// 子评论搜索
const handleChildSearch = () => {
  childCurrentPage.value = 1;
  fetchChildComments();
};

// 重置子评论搜索
const resetChildSearch = () => {
  childSearchKeyword.value = '';
  childCurrentPage.value = 1;
  fetchChildComments();
};

// 子评论分页大小变化
const handleChildSizeChange = (newSize: number) => {
  childPageSize.value = newSize;
  fetchChildComments();
};

// 查看子评论详情
const viewChildDetail = (comment: CommentDTO) => {
  router.push(`/comment/detail/${comment.commentId}`);
};

// 删除评论
const deleteComment = async (comment: CommentDTO) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条评论吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    const params: CommentDeleteCommand = {
      commentId: comment.commentId,
      parentCommentId: comment.parentCommentId || ''
    };
    
    await useCommentApi.delete(params);
    ElMessage.success('评论删除成功');
    
    // 如果删除的是主评论，返回列表页
    if (comment.commentId === mainComment.value.commentId) {
      router.back();
    } else {
      // 如果删除的是子评论，刷新子评论列表
      fetchChildComments();
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除评论失败');
    }
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.main-comment, .child-comment {
  margin: 15px 0;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.content {
  margin: 10px 0;
  word-break: break-all;
}
.comment-img {
  margin: 10px 0;
  max-width: 300px;
}
.time {
  color: #999;
  font-size: 12px;
  margin-top: 5px;
}
.actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
.no-comments {
  padding: 20px 0;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.search-container {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}
.search-input {
  width: 300px;
}
.comment-detail-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>