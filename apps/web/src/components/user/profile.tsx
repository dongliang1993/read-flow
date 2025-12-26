import { cn } from '@/lib/utils'

type ProfileProps = {
  coverImage?: string
  avatarImage?: string
  name: string
  bio?: string

  exp?: number
  className?: string
}

const defaultCover =
  'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=400&h=200&fit=crop'

export function Profile({
  coverImage = defaultCover,
  avatarImage,
  name,
  bio,
  exp = 65,
  className,
}: ProfileProps) {
  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-2xl bg-white overflow-hidden shadow-lg',
        className
      )}
    >
      <div className='relative'>
        <div className='h-36 overflow-hidden rounded-3xl'>
          <img
            src={coverImage}
            alt='Cover'
            className='w-full h-full object-cover'
          />
        </div>
      </div>

      <div className='relative px-5 pb-5'>
        <div className='flex items-end justify-between -mt-12'>
          <div className='relative'>
            <div className='size-24 rounded-full border-4 border-white bg-neutral-100 overflow-hidden shadow-md'>
              {avatarImage ? (
                <img
                  src={avatarImage}
                  alt={name}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full bg-linear-to-br from-neutral-200 to-neutral-300 flex items-center justify-center text-2xl font-semibold text-neutral-500'>
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className='flex items-center gap-2 mb-2'>
            <span className='text-xs text-neutral-500 font-medium'>exp.</span>
            <div className='flex gap-[2px]'>
              {Array.from({ length: 30 }).map((_, i) => {
                const isActive = i < Math.floor((exp / 100) * 30)
                const hue = (i / 30) * 300
                return (
                  <div
                    key={i}
                    className={cn(
                      'w-[3px] h-3 rounded-full transition-colors',
                      isActive ? '' : 'bg-neutral-200'
                    )}
                    style={
                      isActive
                        ? { backgroundColor: `hsl(${hue}, 70%, 55%)` }
                        : undefined
                    }
                  />
                )
              })}
            </div>
          </div>
        </div>

        <div className='mt-4'>
          <h2 className='text-xl font-semibold text-neutral-900'>{name}</h2>
          {bio && (
            <p className='mt-1 text-sm text-neutral-500 leading-relaxed'>
              {bio}
            </p>
          )}
        </div>
      </div>
      {/* <div className='mt-5 flex items-center justify-between border-t border-neutral-100 pt-3'>
        <div className='w-full h-full flex items-center justify-center'>
          <SocialIcon type='instagram' />
        </div>
        <div className='w-full h-full flex items-center justify-center'>
          <SocialIcon type='x' />
        </div>
        <div className='w-full h-full flex items-center justify-center'>
          <SocialIcon type='threads' />
        </div>
      </div> */}
    </div>
  )
}

function SocialIcon({ type }: { type: 'instagram' | 'x' | 'threads' }) {
  const icons = {
    instagram: (
      <svg viewBox='0 0 24 24' className='size-5' fill='currentColor'>
        <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
      </svg>
    ),
    x: (
      <svg viewBox='0 0 24 24' className='size-5' fill='currentColor'>
        <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
      </svg>
    ),
    threads: (
      <svg viewBox='0 0 24 24' className='size-5' fill='currentColor'>
        <path d='M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.068V12c.014-3.503.87-6.343 2.54-8.433C5.916 1.555 8.676.384 12.26.384h.006c2.66.018 5.035.741 7.047 2.151 1.92 1.347 3.381 3.285 4.341 5.756l-2.7.958c-.702-1.828-1.809-3.283-3.29-4.324-1.458-1.023-3.203-1.543-5.19-1.556h-.006c-2.724-.011-4.863.864-6.354 2.6-1.43 1.667-2.165 4.057-2.185 7.105v.05c.019 3.037.751 5.422 2.176 7.088 1.488 1.74 3.627 2.628 6.356 2.64h.006c2.381-.012 4.324-.632 5.773-1.843 1.336-1.118 2.219-2.693 2.626-4.683l2.769.474c-.508 2.545-1.702 4.611-3.55 6.144-1.925 1.597-4.426 2.413-7.437 2.426zM8.57 11.613c.154-1.63.877-2.906 2.09-3.69 1.085-.701 2.48-1.058 4.143-1.058l.269.003c2.103.05 3.746.743 4.885 2.063 1.057 1.224 1.596 2.9 1.602 4.982v.074c-.006 2.076-.544 3.746-1.599 4.965-1.132 1.309-2.771 1.998-4.874 2.048l-.27.003c-1.668 0-3.066-.363-4.152-1.079-1.21-.798-1.93-2.08-2.082-3.705l2.686-.318c.081.848.442 1.493 1.073 1.917.66.444 1.524.669 2.567.669.102 0 .206-.002.311-.006 1.225-.03 2.174-.38 2.818-1.04.595-.607.898-1.468.901-2.56v-.052c-.002-1.094-.305-1.959-.9-2.57-.643-.664-1.59-1.017-2.813-1.048-.107-.003-.212-.004-.317-.004-1.039 0-1.902.218-2.561.65-.634.416-.998 1.053-1.082 1.896z' />
      </svg>
    ),
  }

  return (
    <button
      type='button'
      className='flex-1 flex items-center justify-center py-2 text-neutral-700 hover:text-neutral-900 transition-colors'
    >
      {icons[type]}
    </button>
  )
}
