/**
 * BookmarkCard 组件测试
 * 覆盖：渲染测试、Props 传递测试
 *
 * 运行前需要安装依赖：
 *   npm install --save-dev @testing-library/react @testing-library/jest-dom jest
 */

import { render, screen } from '@testing-library/react';
import { BookmarkCard } from './index';
import type { Bookmark } from './types';

// 测试用的书签数据
const mockBookmark: Bookmark = {
  id: '1',
  title: 'React 官方文档',
  url: 'https://react.dev',
  description: 'React 的官方文档，包含教程和 API 参考',
  tags: ['前端', 'React', '文档'],
};

describe('BookmarkCard', () => {
  // 渲染测试：组件能正常渲染出书签的各个部分
  test('渲染书签的标题、URL、描述和标签', () => {
    render(<BookmarkCard bookmark={mockBookmark} />);

    // 标题
    expect(screen.getByText('React 官方文档')).toBeInTheDocument();
    // URL
    expect(screen.getByText('https://react.dev')).toBeInTheDocument();
    // 描述
    expect(
      screen.getByText('React 的官方文档，包含教程和 API 参考')
    ).toBeInTheDocument();
    // 标签列表
    expect(screen.getByText('前端')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('文档')).toBeInTheDocument();
  });

  test('标题是链接，且指向正确的 URL', () => {
    render(<BookmarkCard bookmark={mockBookmark} />);

    const link = screen.getByRole('link', { name: 'React 官方文档' });
    expect(link).toHaveAttribute('href', 'https://react.dev');
  });

  // Props 传递测试：传入不同的数据，组件展示对应内容
  test('传入不同 Props 时展示对应内容', () => {
    // 不带描述、不带标签的书签
    const bookmarkWithoutDescription: Bookmark = {
      id: '2',
      title: 'Next.js 官网',
      url: 'https://nextjs.org',
      tags: [],
    };

    render(<BookmarkCard bookmark={bookmarkWithoutDescription} />);

    expect(screen.getByText('Next.js 官网')).toBeInTheDocument();
    expect(screen.getByText('https://nextjs.org')).toBeInTheDocument();
    // 旧数据不应出现在新渲染结果中
    expect(screen.queryByText('React 官方文档')).not.toBeInTheDocument();
  });
});
