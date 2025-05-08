import { http } from '../http'
import type {
    ArticleDTO,
    ArticlePageQuery
} from '@/types/article'

import type { PageDTO } from '@/services/types'

export const useArticleApi = {
    // 分页查询文章列表
    page(params: ArticlePageQuery) {
        return http.get<PageDTO<ArticleDTO>>('/article/page/all', { params })
    },

    // 删除文章
    delete(articleId: string) {
        return http.post('/article/delete', { articleId })
    },

    // 获取文章详情
    getArticleById: (articleId: string) => {
        return http.get<ArticleDTO>(`/article/get/${articleId}`)
    },

    // 获取文章详情
    getDeletedArticleById: (articleId: string) => {
        return http.get<ArticleDTO>(`/article/get/deleted/${articleId}`)
    },

    // 更改文章审核状态
    updateStatus(articleId: string, status: string, userName: string) {
        return http.post('/article/change/status', { articleId, status, userName })
    },

    restore(articleId: string) {
        return http.post('/article/restore/deleted', { articleId })
    }
}