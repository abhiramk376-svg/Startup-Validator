import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import Logo from './Logo.jsx'
import { BellIcon } from '../icons/Icons.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

// Signed-in app nav used on Chat / Results / Reports
export default function AppNav({ active }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const initials = (user?.fullName || 'Jordan Rivera')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    setMenuOpen(false)
    signOut()
    navigate('/signin', { replace: true })
  }

  return (
    <nav className="app-nav">
      <Logo small to="/app" />
      <div className="nav-links">
        <Link to="/app" style={active === 'new' ? { color: 'var(--text)' } : undefined}>
          New Evaluation
        </Link>
        <Link to="/app/reports" style={active === 'reports' ? { color: 'var(--text)' } : undefined}>
          My Evaluations
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <BellIcon className="bell" />
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="avatar"
            onClick={() => setMenuOpen((open) => !open)}
            style={{ cursor: 'pointer', border: 'none' }}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            {initials}
          </button>

          {menuOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                minWidth: 200,
                background: 'var(--surface, #fff)',
                border: '1px solid var(--border, #e5e5e5)',
                borderRadius: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                zIndex: 50,
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border, #e5e5e5)' }}>
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{user?.fullName || 'Jordan Rivera'}</p>
                {user?.email && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{user.email}</p>
                )}
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/app/profile')
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid var(--border, #e5e5e5)',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: 'var(--text)',
                }}
              >
                View profile
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: 'var(--danger, #d64545)',
                }}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}