import Link from 'next/link'
import Qr from './Qr'

function Footer () {
  return (
  	<>
    <h4>Don't let your Streams be Dreams.</h4>
    <nav>
      <ul>
        <li>
          <Link href='https://lacymorrow.com'>
            <a className='heart'>Lacy Morrow</a>
          </Link>
        </li>
        <li>
          <Qr />
        </li>
        <li>
          <Link prefetch href='/download'>
            <a>Download</a>
          </Link>
        </li>
        <li>
          <Link prefetch href='/issues'>
            <a>Issues</a>
          </Link>
        </li>
        <li>
          <Link prefetch href='/contact'>
            <a>Contact</a>
          </Link>
        </li>
      </ul>
    </nav>
    <style jsx>{`
    	.heart:hover {
    		cursor: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zd…R5bGU9ImZvbnQtc2l6ZToxNHB4Ij48dGV4dCB5PSIxNiI+4p2k77iPPC90ZXh0Pjwvc3ZnPg==),auto!important;
    	}
    `}</style>
	  </>
  )
}

export default Footer
