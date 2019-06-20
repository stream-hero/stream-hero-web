/*
 * Index page
 * Download links for client/apps
 * Login link
 * About link
 * QR Scanner
 * Server-side validation
 */

import AwesomeDebouncePromise from "awesome-debounce-promise";
import Head from "next/head";
import Link from 'next/link'
import fetch from "isomorphic-fetch";
import Layout from "../layouts/main";
import Meta from "./section/Meta";
import defaults from "../constants/defaults";
import blacklist from "../constants/blacklist";

const extract = (str, pattern) => (str.match(pattern) || []).pop() || '';

const searchAPI = async heroName => {
	if (heroName in blacklist) {
		return false
	}
	const res = await fetch("/io/exists/" + encodeURIComponent(heroName)).then(
		response => response.json()
	);

	return res;
};

const searchAPIDebounced = AwesomeDebouncePromise(searchAPI, 500);

class Index extends React.Component {
	state = {
		heroName: "",
		loading: false,
		result: false
	};

	handleConnect = async e => {
		// alert(this.state.heroName);
	};

	handleTextChange = async e => {
		let heroName = e.target.value;

		extract(heroName, "[-0-9a-z]+");

		this.setState({ heroName, result: false});

		const result = await searchAPIDebounced(heroName);

		this.setState({ result });
	};

	randomName = async e => {
		const res = await fetch("/io/connect").then(response => response.json());
		this.setState({ heroName: res });
	};

	componentWillUnmount() {
		this.setState = () => {};
	}

	render() {
		return (
			<Layout>
				<div className="container">
					<h1>Take control of your machine</h1>
					<h2>
						{"One more thing you didn't know your phone could do" ||
							"Put your phone where your money should be"}
					</h2>

					<input
						className={this.state.loading ? "valid" : "invalid"}
						placeholder="Enter a name for your Dashboard"
						type="text"
						value={this.state.heroName}
						onChange={this.handleTextChange}
					/>

			  	<Link as={`/x/${this.state.heroName}`} href={`/dashboard?id=${this.state.heroName}`}>
						<button disabled={!this.state.heroName} onClick={this.handleConnect}>
							{this.state.result
								? `Connect to existing Dashboard: `
								: `Create new Dashboard: `}{" "}
							<strong>{this.state.heroName}</strong>
						</button>
					</Link>
					<button onClick={this.randomName}>
						<strong>Random Name</strong>
					</button>

					<h5>
						Already have a dashboard? Scan the QR code for immediate access.
					</h5>
				</div>

				<style jsx>{`
					.container {
						display: flex;
						flex-direction: column;
					}
					.valid {
						border: 2px solid green;
					}
					.invalid {
						border: 2px solid blue;
					}
				`}</style>
			</Layout>
		);
	}
}

export default Index;
