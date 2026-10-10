import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

// Marketing nav used on the public Landing page
export default function SiteNav() {
  return (
    <nav className="site-nav">
      <Logo />
      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#how-it-works">How it Works</a>
        <a href="#about">About</a>
      </div>
      <Link className="btn btn-primary" to="/signin">Launch App</Link>
    </nav>
  )
}
