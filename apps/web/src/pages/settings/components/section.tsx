type SectionProps = {
  children: React.ReactNode
}

export const Section = ({ children }: SectionProps) => {
  return <div className='mb-4 bg-shade-01 p-4 rounded-2xl'>{children}</div>
}

export const SectionTitle = ({ children }: { children: React.ReactNode }) => {
  return <h2 className='font-medium mb-4'>{children}</h2>
}
