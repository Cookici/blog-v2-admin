import { http } from '../http'
import type { DashboardDataQuery } from '@/types/dashboard'
import type { ArticleDailyCountDTO, CommentDailyCountDTO } from '@/types/dashboard'

export const useDashboardApi = {
  // 获取用户总数
  getUserCount() {
    return http.get<number>('/user/count')
  },

  // 获取标签总数
  getLabelCount() {
    return http.get<number>('/label/count')
  },

  // 获取文章总数
  getArticleCount() {
    return http.get<number>('/article/count')
  },

  // 获取评论总数
  getCommentCount() {
    return http.get<number>('/comment/count')
  },

  // 获取文章每日统计
  getArticleDailyCount(params: DashboardDataQuery) {
    return http.post<ArticleDailyCountDTO[]>('/article/daily-count', params)
  },

  // 获取评论每日统计
  getCommentDailyCount(params: DashboardDataQuery) {
    return http.post<CommentDailyCountDTO[]>('/comment/daily-count', params)
  }
}