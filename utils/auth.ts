import { supabaseClient } from '../lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

/**
 * 获取当前会话（客户端）
 * @returns Promise<Session | null>
 */
export async function getSession(): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Error in getSession:', error);
    return null;
  }
}

/**
 * 获取当前用户（客户端）
 * @returns Promise<User | null>
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

/**
 * 检查用户是否已登录（客户端）
 * @returns Promise<boolean>
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

/**
 * 从请求头中获取用户（服务端/API 路由）
 * @param authHeader - Authorization 请求头（格式：Bearer <token>）
 * @returns Promise<User | null>
 */
export async function getUserFromHeader(authHeader?: string): Promise<User | null> {
  if (!authHeader) {
    return null;
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    if (error) {
      console.error('Error getting user from header:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error in getUserFromHeader:', error);
    return null;
  }
}

