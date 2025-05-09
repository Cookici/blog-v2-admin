import { defineStore } from 'pinia'
import type { UserInfo } from '@/types/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as UserInfo | null,
  }),
  
  getters: {
    // 获取用户ID
    getUserId(): string | undefined {
      return this.userInfo?.userId;
    },
    
    // 获取用户名
    getUserName(): string | undefined {
      return this.userInfo?.userName;
    },
    
    // 判断用户是否已登录
    isLoggedIn(): boolean {
      return !!this.userInfo;
    }
  },

  actions: {
    // 设置用户信息
    setUser(userInfo: UserInfo) {
      this.userInfo = userInfo;
    },

    // 清除用户信息
    clearUser() {
      this.userInfo = null;
    }
  }
});