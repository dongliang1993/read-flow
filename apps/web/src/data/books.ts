export interface Book {
  id: string
  title: string
  author: string
  cover: string
  progress: number
  status: 'reading' | 'finished' | 'unread'
}

export const mockBooks: Book[] = [
  {
    id: '1',
    title: '薛兆丰经济学讲义',
    author: '薛兆丰',
    cover:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    progress: 3,
    status: 'reading',
  },
  {
    id: '2',
    title: '弹性生长',
    author: '九边',
    cover:
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
    progress: 1,
    status: 'reading',
  },
  {
    id: '3',
    title: '认知觉醒',
    author: '周岭',
    cover:
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=400&fit=crop',
    progress: 71,
    status: 'reading',
  },
  {
    id: '4',
    title: '迷雾怪屋',
    author: '佚名',
    cover:
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop',
    progress: 100,
    status: 'finished',
  },
  {
    id: '5',
    title: '送我在北京',
    author: '胡安',
    cover:
      'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop',
    progress: 100,
    status: 'finished',
  },
  {
    id: '6',
    title: '大白金塔下有高跟鞋',
    author: '马家辉',
    cover:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
    progress: 100,
    status: 'finished',
  },
  {
    id: '7',
    title: '置身事内',
    author: '兰小欢',
    cover:
      'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=300&h=400&fit=crop',
    progress: 5,
    status: 'reading',
  },
  {
    id: '8',
    title: "Touchstone Student's Book 4",
    author: 'Michael McCarthy',
    cover:
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop',
    progress: 0,
    status: 'unread',
  },
  {
    id: '9',
    title: 'English For Everyone',
    author: 'DK',
    cover:
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=400&fit=crop',
    progress: 0,
    status: 'unread',
  },
]
