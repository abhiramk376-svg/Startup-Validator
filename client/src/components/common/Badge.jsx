// variant: 'good' | 'warn'
export default function Badge({ children, variant = 'good' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}
