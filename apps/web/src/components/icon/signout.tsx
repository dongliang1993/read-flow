export function SignOut({
  size = 16,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 20 20'
      fill='currentColor'
      className={className}
    >
      <path d='M17.707 3.21a.75.75 0 0 1 .75.75v12.083a.75.75 0 0 1-1.5 0V3.96a.75.75 0 0 1 .75-.75zM10.51 5.93a.75.75 0 0 1 1.061 0l2.952 2.952c.618.618.618 1.621 0 2.239l-2.952 2.952a.75.75 0 1 1-1.061-1.061l2.261-2.262-10.481.001a.75.75 0 0 1-.743-.648l-.007-.102a.75.75 0 0 1 .75-.75l10.481-.001L10.51 6.99a.75.75 0 0 1-.073-.977l.073-.084z'></path>
    </svg>
  )
}
