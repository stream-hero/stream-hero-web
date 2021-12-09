// import * as block from "components/block";
import Head from 'next/head'

const offscreen = document.querySelector('canvas').transferControlToOffscreen();
const worker = new Worker('myworkerurl.js');
worker.postMessage({ canvas: offscreen }, [offscreen]);

export default Worker;
