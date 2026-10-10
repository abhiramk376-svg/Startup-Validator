// All icons as small, prop-driven SVG components — mirrors the icon set used
// throughout the prototype (checkmark logo mark, search, user, mail, lock, etc).

export function LogoMarkIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16" {...props}>
      <path d="M4 16L10 9L14 13L20 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SparkIcon(props) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
    </svg>
  )
}

export function SearchIcon(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20L16 16" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function UserIcon(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 21C4 17 7.5 14 12 14C16.5 14 20 17 20 21" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function MailIcon(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function LockIcon(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 11V8C8 5.8 9.8 4 12 4C14.2 4 16 5.8 16 8V11" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function EyeIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M2 12S5.5 5 12 5S22 12 22 12S18.5 19 12 19S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function ShieldIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 2L20 5V11C20 16 16.5 20 12 22C7.5 20 4 16 4 11V5L12 2Z" stroke="#D8A34D" strokeWidth="1.6" />
    </svg>
  )
}

export function BellIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M6 8C6 5 8.5 3 12 3C15.5 3 18 5 18 8V13L20 17H4L6 13V8Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9.5 17C9.5 18.4 10.6 19.5 12 19.5C13.4 19.5 14.5 18.4 14.5 17" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

export function ArrowUpRightIcon(props) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function BackArrowIcon(props) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M17 7L7 17M7 17H15M7 17V9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function GoogleIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...props}>
      <path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.3h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.6c2.1-1.9 3.2-4.8 3.2-8.1z" />
      <path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8C4.1 20.6 7.8 23 12 23z" />
      <path fill="#FBBC05" d="M6 14.3c-.2-.7-.4-1.4-.4-2.3s.1-1.6.4-2.3V6.9H2.3C1.5 8.4 1 10.1 1 12s.5 3.6 1.3 5.1L6 14.3z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2C17.4 2.1 15 1 12 1 7.8 1 4.1 3.4 2.3 6.9L6 9.7c.9-2.5 3.2-4.3 6-4.3z" />
    </svg>
  )
}

export function CheckCircleIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="11" cy="11" r="7" stroke="#0E7C6B" strokeWidth="2" />
      <path d="M20 20L16 16" stroke="#0E7C6B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function TrendIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M3 17L9 11L13 15L21 7" stroke="#B9843A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ListIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 6H20M4 12H20M4 18H14" stroke="#4B504C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function InfoIcon(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11V17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
    </svg>
  )
}
