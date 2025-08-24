"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  getUserFromStorage,
  setUserToStorage,
  clearUserFromStorage,
  type User,
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 设置认证cookie的辅助函数
const setAuthCookie = (user: User) => {
  // 设置一个简单的认证cookie，24小时后过期
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  document.cookie = `auth-token=${user.id}; expires=${expires}; path=/; SameSite=Lax`;
};

// 清除认证cookie的辅助函数
const clearAuthCookie = () => {
  document.cookie =
    "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 刷新用户信息的函数
  const refreshUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session refresh error:", error);
        return;
      }

      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
          email_confirmed_at: session.user.email_confirmed_at,
          created_at: session.user.created_at,
        };
        
        setUser(userData);
        setUserToStorage(userData);
        setAuthCookie(userData);
      } else {
        // 如果没有Supabase会话，清除本地状态
        setUser(null);
        clearUserFromStorage();
        clearAuthCookie();
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  };

  useEffect(() => {
    // 检查本地存储的用户会话和Supabase会话
    const checkAuth = async () => {
      try {
        // 首先尝试从Supabase获取会话
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Supabase session error:", error);
        }

        if (session?.user) {
          // 有Supabase会话，使用它
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
            email_confirmed_at: session.user.email_confirmed_at,
            created_at: session.user.created_at,
          };
          
          setUser(userData);
          setUserToStorage(userData);
          setAuthCookie(userData);
        } else {
          // 没有Supabase会话，检查本地存储
          const userData = getUserFromStorage();
          if (userData) {
            setUser(userData);
            setAuthCookie(userData);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        clearUserFromStorage();
        clearAuthCookie();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // 监听Supabase认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
            email_confirmed_at: session.user.email_confirmed_at,
            created_at: session.user.created_at,
          };
          
          setUser(userData);
          setUserToStorage(userData);
          setAuthCookie(userData);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          clearUserFromStorage();
          clearAuthCookie();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      // 使用Supabase Auth进行登录
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message || "登录失败，请重试",
        };
      }

      if (data.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || '',
          email_confirmed_at: data.user.email_confirmed_at,
          created_at: data.user.created_at,
        };
        
        setUser(userData);
        setUserToStorage(userData);
        setAuthCookie(userData);
        return { success: true };
      }

      return { success: false, error: "登录失败，请重试" };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "网络错误，请检查网络连接",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      // 使用Supabase Auth进行注册
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message || "注册失败，请重试",
        };
      }

      if (data.user && !data.user.email_confirmed_at) {
        return { 
          success: true, 
          error: "注册成功！请检查您的邮箱并点击确认链接完成账户激活。" 
        };
      }

      return { success: false, error: "注册过程中发生错误，请重试" };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error: "网络错误，请检查网络连接",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // 调用Supabase登出
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // 无论API调用是否成功，都清除本地状态
      setUser(null);
      clearUserFromStorage();
      clearAuthCookie();
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
