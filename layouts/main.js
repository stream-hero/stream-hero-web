import Meta from '../components/meta'
import Footer from '../components/footer'
import Header from '../components/header'
export default ({ children }) => (
  <>
    <Meta title={'Stream Hero'} />
    <Header />
    { children }
    <Footer />
  </>
)
