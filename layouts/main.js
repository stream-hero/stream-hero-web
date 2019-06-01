import Meta from '../components/meta'
import Footer from '../components/footer'
import Header from '../components/header'
export default ({ children }) => (
  <div className='theme-dark'>
    <Meta title={'Stream Hero'} />
    <Header />
    { children }
  </div>
)
