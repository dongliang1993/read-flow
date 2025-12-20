import { MessageCircle } from 'lucide-react'
import { PickIcon } from '@/components/icon/pick'

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
    icon: <PickIcon size={20} />,
  },
]
