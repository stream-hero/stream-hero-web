/*
 * Index page
 * Download links for client/apps
 * Login link
 * About link
 * QR Scanner
 */
import Layout from '../layouts/main'
import Meta from './section/Meta'
import Head from 'next/head'

const title = 'SH Server'

export default () => (
  <Layout>
    <Head>
      <title>{title}</title>
      <Meta />
    </Head>

    <h1>{title}</h1>
    <h2>Don't let your Streams be Dreams.</h2>
    <style jsx>{`
      h1,
      a {
        font-family: 'Arial';
      }

      ul {
        padding: 0;
      }

      li {
        list-style: none;
        margin: 5px 0;
      }

      a {
        text-decoration: none;
        color: blue;
      }

      a:hover {
        opacity: 0.6;
      }
    `}</style>
  </Layout>
)
