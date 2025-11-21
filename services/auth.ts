import { supabaseClient, supabaseServer } from '../lib/supabaseClient';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// 注册请求参数类型
export interface SignUpParams {
  email: string;
  password: string;
  metadata?: {
    name?: string;
    [key: string]: any;
  };
}

// 登录请求参数类型
export interface SignInParams {
  email: string;
  password: string;
}

// 注册响应类型
export interface SignUpResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

// 登录响应类型
export interface SignInResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * 用户注册（Email + Password）
 * @param params - 注册参数（email, password, metadata）
 * @returns 注册结果（user, session, error）
 */
export async function signUp(params: SignUpParams): Promise<SignUpResponse> {
  try {
    const { email, password, metadata } = params;

    // 验证输入参数
    if (!email || !password) {
      return {
        user: null,
        session: null,
        error: {
          name: 'ValidationError',
          message: 'Email and password are required'
        } as AuthError
      };
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        user: null,
        session: null,
        error: {
          name: 'ValidationError',
          message: 'Invalid email format'
        } as AuthError
      };
    }

    // 验证密码强度（至少 6 个字符）
    if (password.length < 6) {
      return {
        user: null,
        session: null,
        error: {
          name: 'ValidationError',
          message: 'Password must be at least 6 characters long'
        } as AuthError
      };
    }

    // 调用 Supabase 注册 API
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {}
      }
    });

    return {
      user: data.user,
      session: data.session,
      error: error
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      user: null,
      session: null,
      error: {
        name: 'UnexpectedError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      } as AuthError
    };
  }
}

/**
 * 用户登录（Email + Password）
 * @param params - 登录参数（email, password）
 * @returns 登录结果（user, session, error）
 */
export async function signIn(params: SignInParams): Promise<SignInResponse> {
  try {
    const { email, password } = params;

    // 验证输入参数
    if (!email || !password) {
      return {
        user: null,
        session: null,
        error: {
          name: 'ValidationError',
          message: 'Email and password are required'
        } as AuthError
      };
    }

    // 调用 Supabase 登录 API
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    return {
      user: data.user,
      session: data.session,
      error: error
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      user: null,
      session: null,
      error: {
        name: 'UnexpectedError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      } as AuthError
    };
  }
}

/**
 * 用户登出
 * @returns 登出结果（error）
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabaseClient.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      error: {
        name: 'UnexpectedError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      } as AuthError
    };
  }
}

/**
 * 获取当前用户
 * @returns 当前用户信息
 */
export async function getCurrentUser(): Promise<{
  user: User | null;
  error: AuthError | null;
}> {
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    return { user, error };
  } catch (error) {
    console.error('Get current user error:', error);
    return {
      user: null,
      error: {
        name: 'UnexpectedError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      } as AuthError
    };
  }
}

/**
 * 获取当前会话
 * @returns 当前会话信息
 */
export async function getCurrentSession(): Promise<{
  session: Session | null;
  error: AuthError | null;
}> {
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    return { session, error };
  } catch (error) {
    console.error('Get current session error:', error);
    return {
      session: null,
      error: {
        name: 'UnexpectedError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      } as AuthError
    };
  }
}

/**
 * 刷新当前会话
 * @returns 刷新后的会话信息
 */
export async function refreshSession(): Promise<{
  session: Session | null;
  error: AuthError | null;
}> {
  try {
    const { data: { session }, error } = await supabaseClient.auth.refreshSession();
    return { session, error };
  } catch (error) {
    console.error('Refresh session error:', error);
    return {
      session: null,
      error: {
        name: 'UnexpectedError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      } as AuthError
    };
  }
}

/**
 * 重置密码（发送重置密码邮件）
 * @param email - 用户邮箱
 * @returns 发送结果（error）
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    if (!email) {
      return {
        error: {
          name: 'ValidationError',
          message: 'Email is required'
        } as AuthError
      };
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        error: {
          name: 'ValidationError',
          message: 'Invalid email format'
        } as AuthError
      };
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`
    });

    return { error };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      error: {
        name: 'UnexpectedError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      } as AuthError
    };
  }
}

/**
 * 更新密码
 * @param newPassword - 新密码
 * @returns 更新结果（error）
 */
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  try {
    if (!newPassword) {
      return {
        error: {
          name: 'ValidationError',
          message: 'New password is required'
        } as AuthError
      };
    }

    // 验证密码强度
    if (newPassword.length < 6) {
      return {
        error: {
          name: 'ValidationError',
          message: 'Password must be at least 6 characters long'
        } as AuthError
      };
    }

    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });

    return { error };
  } catch (error) {
    console.error('Update password error:', error);
    return {
      error: {
        name: 'UnexpectedError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      } as AuthError
    };
  }
}

