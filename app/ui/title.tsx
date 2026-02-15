function Title({ children }: { children?: React.ReactNode }) {
  return (
    <div className="text-4xl text-accent-text font-bold">
      {children}
    </div>
  )
}

export default Title
