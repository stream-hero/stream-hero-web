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

    <div className='container'>
      <h1>Take control of your machine</h1>
      <h2>{
      	"One more thing you didn't know your phone could do" ||
      	'Put your phone where your money should be'
      }</h2>
      <button>Create your dashboard</button>

      <h5>Already have a dashboard? (you can also scan the QR code below)</h5>
      <input type='text' onchange={() => ''} />

    </div>

    <style jsx>{`
    	.container {
    	  display: flex;
    	  flex-direction: column;
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
