import { http } from '../http'
import type { LabelDTO } from '@/types/article'
import type { PageDTO } from '@/services/types'
import { LabelDeleteCommand, LabelPageQuery, LabelUpdateCommand, LabelInsertCommand } from '@/types/label'

export const useLabelApi = {
  // 获取标签列表
  getKinds() {
    return http.get<LabelDTO[]>('/label/kinds')
  },
  
  // 分页查询标签
  page(params: LabelPageQuery) {
    return http.get<PageDTO<LabelDTO>>('/label/page/admin', { params })
  },
  
  // 更新标签
  update(params: LabelUpdateCommand) {
    return http.post('/label/update', params)
  },
  
  // 删除标签
  delete(params: LabelDeleteCommand) {
    return http.post('/label/delete', params)
  },

  // 插入标签
  insert(params: LabelInsertCommand) {
    return http.post('/label/insert', params)
  },

  restore(params: { labelId: string }){
    return http.post('/label/restore',params)
  }

}
