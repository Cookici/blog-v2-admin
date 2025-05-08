import { http } from '../http'
import type { CommentDTO, CommentPageQuery, CommentChildPageQuery, 
  CommentDeleteCommand } from '@/types/comment'
import type { PageDTO } from '@/services/types'

export const useCommentApi = {
  // 获取评论列表
  page(params: CommentPageQuery) {
    return http.get<PageDTO<CommentDTO>>('/comment/page', { params })
  },

  // 获取子评论列表
  pageChild(params: CommentChildPageQuery) {
    return http.get<PageDTO<CommentDTO>>('/comment/page_child', { params })
  },

  // 删除评论
  delete(params: CommentDeleteCommand) {
    return http.post('/comment/delete', params)
  }
} 