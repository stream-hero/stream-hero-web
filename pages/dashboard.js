// import * as block from "components/block";
import Head from 'next/head'
import Layout from '../layouts/main.js'
import Link from 'next/link'
import fetch from 'isomorphic-unfetch'

const Dashboard = (props) => (
  <Layout>
    <h1>Hero Dashboard</h1>
    <Link as={`/d/${props.id}`} href={`/dashboard?id=${props.id}`}>
      <a>Goto dashboard ${props.id}</a>
    </Link>
  </Layout>
)

Dashboard.getInitialProps = async function () {
  const res = await fetch('https://api.tvmaze.com/search/shows?q=batman')
  const data = await res.json()

  console.log(`Show data fetched. Count: ${data.length}`)

  return {
    shows: data.map(entry => entry.show)
  }
}

export default Dashboard
