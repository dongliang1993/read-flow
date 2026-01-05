export const AnthropicIcon = ({
  size = 16,
  className,
}: {
  size?: number
  className?: string
}) => {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M17.304 3.541h-3.469l6.227 16.918h3.469L17.304 3.54zm-10.608 0L.47 20.459h3.563l1.27-3.63h6.541l1.27 3.63h3.563L10.451 3.54H6.695zm.435 10.381l2.166-6.186 2.166 6.186H7.13z'
        fill='currentColor'
      />
    </svg>
  )
}

