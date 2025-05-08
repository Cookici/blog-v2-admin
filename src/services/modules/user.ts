import { http } from '../http';
import type {
  LoginParams,
  loginResponse,
  UserAdminSearchReq,
  UserInfo,
  UserOperatorReq
} from '@/types/user';
import { PageDTO } from '../types';

// 用户相关接口
export const useUserApi = {
  // 登录
  login(params: LoginParams) {
    return http.post<loginResponse>('/user/login', params);
  },

  // 登出
  logout() {
    return http.post('/user/logout');
  },
  // 搜索好友
  search(params: UserAdminSearchReq) {
    return http.get<PageDTO<UserInfo>>('/user/search/admin', { params })
  },
  operator(params: UserOperatorReq) {
    return http.post('/user/operator', params)
  }
};