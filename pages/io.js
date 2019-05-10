import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function Page({ stars }) {
  return <div>Next stars: {stars}</div>;
}

Page.getInitialProps = async ({ req }) => {
  // const res = await fetch('https://api.github.com/repos/zeit/next.js');
  // const json = await res.json();
  return { stars: 5 };
};

export default Page;
