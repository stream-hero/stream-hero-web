// import * as block from "components/block";
import Head from 'next/head'
import Layout from '../layouts/main.js'
import Link from 'next/link'
import got from 'got'
import { APPNAME, DOMAIN, TAG } from '../constants/globals'

class Dashboard extends React.Component {
  static getInitialProps ({ query }) {
  	console.log(query)
    return { query }
  }
  render () {
    return (
      <Layout>
        <h1>Hero Dashboard</h1>
        <Link as={`/x/${this.props.query.id}`} href={`/dashboard?id=${this.props.query.id}`}>
          <a>Goto dashboard {this.props.query.id}</a>
        </Link>
      </Layout>
    )
  }
}

export default Dashboard
