import { useState, useCallback } from 'react'

import { cn } from '@/lib/utils'
import { STUDIO_TABS, StudioTab } from '../../constants/studio'

type StudioProps = {
  children: (tab: StudioTab, isActive: boolean) => React.ReactNode
}

export const Studio = ({ children }: StudioProps) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('chat')

  const handleTabClick = useCallback((tab: StudioTab) => {
    setActiveTab(tab)
  }, [])

  return (
    <div id='studio' className='h-full w-full'>
      <div className='flex flex-row h-full position-relative'>
        <div className='rounded-3xl bg-shade-01 ml-2 flex-1 px-4 py-3 relative'>
          {/* 渲染所有 tab 内容，用 CSS 控制显隐 */}
          {STUDIO_TABS.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                'h-full',
                activeTab === tab.id ? 'block' : 'hidden'
              )}
            >
              {children(tab.id, activeTab === tab.id)}
            </div>
          ))}
        </div>

        {/* tabs */}
        <div style={{ width: '50px' }} className='shrink-0 pl-2'>
          <div className='flex flex-col gap-5 pt-[10px]'>
            {STUDIO_TABS.map((tab) => (
              <div
                key={tab.id}
                className='flex flex-col items-center justify-center cursor-pointer gap-1'
                onClick={() => handleTabClick(tab.id)}
              >
                <div
                  className={cn(
                    'text-secondary-foreground rounded-[8px] transition-all h-8 w-8 flex items-center justify-center hover:bg-gray-200',
                    activeTab === tab.id && 'bg-gray-200'
                  )}
                >
                  {tab.icon}
                </div>
                <div className='text-secondary-foreground text-sm'>
                  {tab.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
