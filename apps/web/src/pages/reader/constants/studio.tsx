import { MessageCircle, FileText } from 'lucide-react'

export type StudioTab = 'chat' | 'notes'

export type StudioTabItem = {
  id: StudioTab
  label: string
  icon: React.ReactNode
}

export const STUDIO_TABS: StudioTabItem[] = [
  {
    id: 'chat',
    label: '聊天',
    icon: <MessageCircle size={20} />,
  },
  {
    id: 'notes',
    label: '摘录',
    icon: <FileText size={20} />,
  },
]
