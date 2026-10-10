import { useNavigate } from 'react-router-dom'
import AppNav from '../components/layout/AppNav.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Profile() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    const initials = (user?.fullName || 'Jordan Rivera')
        .split(' ')
        .map((s) => s[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    const joined = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
        : null

    function handleLogout() {
        signOut()
        navigate('/signin', { replace: true })
    }

    return (
        <div className="page">
            <AppNav />

            <div style={{ maxWidth: 560, margin: '0 auto', padding: '56px 24px' }}>
                <div
                    className="verdict-card"
                    style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div
                            className="avatar"
                            style={{ width: 56, height: 56, fontSize: 18 }}
                        >
                            {initials}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 20 }}>{user?.fullName || 'Jordan Rivera'}</h2>
                            {user?.email && (
                                <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>{user.email}</p>
                            )}
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border, #e5e5e5)', paddingTop: 20 }}>
                        <dl style={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 12, margin: 0, fontSize: 14 }}>
                            <dt style={{ color: 'var(--text-muted)' }}>Full name</dt>
                            <dd style={{ margin: 0 }}>{user?.fullName || '—'}</dd>

                            <dt style={{ color: 'var(--text-muted)' }}>Email</dt>
                            <dd style={{ margin: 0 }}>{user?.email || '—'}</dd>

                            {joined && (
                                <>
                                    <dt style={{ color: 'var(--text-muted)' }}>Member since</dt>
                                    <dd style={{ margin: 0 }}>{joined}</dd>
                                </>
                            )}
                        </dl>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border, #e5e5e5)', paddingTop: 20 }}>
                        <button
                            type="button"
                            onClick={handleLogout}
                            style={{
                                padding: '10px 18px',
                                borderRadius: 8,
                                border: '1px solid var(--danger, #d64545)',
                                background: 'none',
                                color: 'var(--danger, #d64545)',
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}