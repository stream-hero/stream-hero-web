// import * as block from "components/block";
import Head from 'next/head'
import Layout from '../layouts/main.js'
import Link from 'next/link'

import got from 'got'
import { APPNAME, DOMAIN, TAG } from '../constants/globals'

const Dashboard = (props) => (
  <Layout>
    <h1>Hero Dashboard</h1>
    <Link as={`/d/${props.id}`} href={`/dashboard?id=${props.id}`}>
      <a>Goto dashboard ${props.id}</a>
    </Link>
  </Layout>
)

// Dashboard.getInitialProps = async function () {
//   const res = await got('https://api.tvmaze.com/search/shows?q=batman')
//   const data = await res.json()

//   console.log(`Show data fetched. Count: ${data.length}`)

//   return {
//     shows: data.map(entry => entry.show)
//   }
// }

export default Dashboard
