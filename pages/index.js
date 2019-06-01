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
import defaults from '../constants/defaults'

export default () => (
  <Layout>
    <Head>
      {defaults.title('Stream Hero / The fundamental streaming tool')}
      <Meta />
    </Head>
    <div className='container'>

      <h1 />
      <h2>Don't let your Streams be Dreams.</h2>
    </div>
    <style jsx>{`
    	.container {
    	  position: absolute;
    	  top: 30%;
    	  left: 10px;
    	  text-align: center;
    	}

    	.container h2 {
    	  font-size: 5rem;
    	}

    	.container a {
    	  font-size: 1.4rem;
    	}

    	.btn {
    	  font-size: 1.6rem;
    	  font-weight: bold;
    	  background-color: #fff;
    	  border-radius: 50%;
    	  margin: 10px;
    	  width: 100px;
    	  height: 100px;
    	  opacity: 0.7;
    	  cursor: pointer;
    	  font-family: Arial, Helvetica, Helvetica Neue, sans-serif;
    	}

    	.btn:hover {
    	  color: white;
    	  background-color: rgba(0, 0, 0, 0.5);
    	}

    	.btnJoin {

    	}

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

      .container {
        display: flex;
      }
    `}</style>
  </Layout>
)
