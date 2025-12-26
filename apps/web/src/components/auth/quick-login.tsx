type Channel = {
  label: string
  icon: React.ReactNode
  onClick: () => void
}

type QuickLoginProps = {
  isLoading: boolean
  // 渠道
  channels: Channel[]
}

export const QuickLogin = ({ channels, isLoading }: QuickLoginProps) => {
  const renderIcon = (icon: React.ReactNode) => {
    if (typeof icon === 'function') {
      const Icon = icon as React.ElementType
      return <Icon />
    }
    return icon
  }

  return (
    <div className='w-full items-center gap-2 grid grid-cols-1'>
      {channels.map((item) => (
        <button
          key={item.label}
          type='button'
          onClick={item.onClick}
          disabled={isLoading}
          className='cursor-pointer inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50'
        >
          {renderIcon(item.icon)}
        </button>
      ))}
    </div>
  )
}
