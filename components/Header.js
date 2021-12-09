import Link from 'next/link'
import defaults from '../constants/defaults'

export default ({ children }) => (
  <nav>
    <ul>
      <li>
        <Link prefetch href='/'>
          <a>{defaults.appName}</a>
        </Link>
      </li>
      <li className='float-right'>
        <Link prefetch href='/download'>
          <a>Get {defaults.appName}</a>
        </Link>
      </li>
    </ul>
    <style jsx>{`
    	ul {
    		display: flex;
    		justify-content: space-between;
    		flex-direction: row;
    	  padding: 0;
    	}

    	li {
    	  list-style: none;
    	  margin: 5px 0;
    	}
    `}</style>
  </nav>
)
