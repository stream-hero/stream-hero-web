import Page from '../layouts/main'
import Meta from './section/Meta'
// import Dashboard from './Dashboard'
import Grid from './Grid'
// import GenName from './GenName'
import Head from 'next/head'

const title = 'Stream Hero Cloud'

export default () => (
  <Page>
    <Head>
      <title>{title}</title>
      <Meta />
    </Head>
    <h1>{title}</h1>
    <Grid />

  </Page>
)
