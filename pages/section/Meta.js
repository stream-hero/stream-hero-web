import Head from 'next/head'
import { APPNAME } from '../../constants/globals'

export default ({ children }) => (
  <Head>
    <title>{children || APPNAME}</title>
    <meta
      name='viewport'
      content='initial-scale=1.0, width=device-width'
      key='viewport'
    />
    <meta
      name='viewport'
      content='initial-scale=1.2, width=device-width'
      key='viewport'
    />
  </Head>
)
