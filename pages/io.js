import io from "socket.io-client";
import fetch from "isomorphic-fetch";

/* This is the proxy API between Streeam Hero and it's accompanyingg app: "stream-hero" amd "stream hero-client" */

class HelloUA extends React.Component {
	static async getInitialProps({ req }) {
		const userAgent = req ? req.headers["user-agent"] : navigator.userAgent;
		let messages = []
		console.log('messages: ', messages)
		return { userAgent, messages };
	}

	static defaultProps = {
		userAgent: "",
		messages: []
	};

	state = {
		field: "",
		text: "",
		messages: this.props.messages,
		userAgent: this.props.userAgent
	};

	// connect to WS server and listen event
	componentDidMount() {
		this.socket = io(/* SOCKET */);
		this.socket.on("message", this.handleMessage);
		this.socket.on("now", data => {
			this.setState({text: data.message})
		});
	}

	// close socket connection
	componentWillUnmount() {
		this.socket.off("message", this.handleMessage);
		this.socket.close();
	}

	// add messages from server to the state
	handleMessage = message => {
		this.setState(state => ({ messages: state.messages.concat(message) }));
	};

	handleChange = event => {
		this.setState({ field: event.target.value });
	};

	// send messages to server and add them to the state
	handleSubmit = event => {
		event.preventDefault();

		// create message object
		const message = {
			id: new Date().getTime(),
			value: this.state.field
		};

		// send object to WS server
		this.socket.emit("message", message);

		// add it to state and clean current input value
		this.setState(state => ({
			field: "",
			messages: state.messages.concat(message)
		}));
	};

	render() {
		return (
			<div>
				<h1>Hello World {this.state.userAgent}</h1>
				<p>{this.state.text}</p>
				<div>
					<ul>
						{this.state.messages.map(message => (
							<li key={message.id}>{message.value}</li>
						))}
					</ul>
					<form onSubmit={this.handleSubmit}>
						<input
							onChange={this.handleChange}
							type="text"
							placeholder="Hello world!"
							value={this.state.field}
						/>
						<button>Send</button>
					</form>
				</div>
			</div>
		);
	}
}

export default HelloUA;
