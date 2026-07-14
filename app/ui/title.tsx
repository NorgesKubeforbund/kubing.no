function Title({ children, small }: { children?: React.ReactNode, small?: boolean }) {
  if (small) {
    return (
      <div className="text-3xl text-black font-semibold">
        {children}
      </div>
    )
  }
  return (
    <div className="text-4xl text-accent-text font-bold">
      {children}
    </div>
  )
}

export default Title
