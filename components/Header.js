import Link from 'next/link'

export default ({ children }) => (
  <div className='footer'>
    <nav>
      <ul>
        <li>
          <Link prefetch href='/d'>
            <a>StreamHero</a>
          </Link>
        </li>
        <li className='float-right'>
          <Link prefetch href='/download'>
            <a>Get ScreenHero</a>
          </Link>
        </li>
      </ul>
    </nav>
  </div>
)
