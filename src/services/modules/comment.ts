import { http } from '../http'
import type {
  CommentDTO, 
  CommentPageQuery,
  CommentDeleteCommand,
  CommentChildPageQuery
} from '@/types/comment'
import type { PageDTO } from '@/services/types'

export const useCommentApi = {
  // 获取评论列表
  page(params: CommentPageQuery) {
    return http.get<PageDTO<CommentDTO>>('/comment/page/all', { params })
  },

  pageChild(params: CommentChildPageQuery) {
    return http.get<PageDTO<CommentDTO>>('/comment/page/child/all', { params })
  },

  get(commentId: string) {
    return http.get<CommentDTO>(`/comment/get/all/${commentId}`)
  },

  // 删除评论
  delete(params: CommentDeleteCommand) {
    return http.post('/comment/delete/admin', params)
  }
}