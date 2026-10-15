/**
 * BookmarkCard 组件的类型定义
 */

/**
 * 书签数据结构
 */
export interface Bookmark {
  /** 书签唯一 ID */
  id: string;
  /** 书签标题 */
  title: string;
  /** 书签链接地址 */
  url: string;
  /** 书签描述（可选，没有描述时可不传） */
  description?: string;
  /** 标签列表（字符串数组） */
  tags: string[];
}

/**
 * BookmarkCard 组件的 Props
 */
export interface BookmarkCardProps {
  /** 要展示的书签数据 */
  bookmark: Bookmark;
}
