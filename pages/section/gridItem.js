import Page from '../../layouts/main'
import Meta from '../section/Meta'

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
