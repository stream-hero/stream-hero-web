import Link from 'next/link'
import Qr from './Qr'

function Header () {
  return (
    <nav>
      <ul>
        <li>
          <Qr />
        </li>
        <li>
          <Link prefetch href='/'>
            <a>Home</a>
          </Link>
        </li>
        <li>
          <Link prefetch href='/about'>
            <a>About</a>
          </Link>
        </li>
        <li>
          <Link prefetch href='/contact'>
            <a>Contact</a>
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Header
