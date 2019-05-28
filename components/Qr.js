if (typeof window !== 'undefined') {
  var QrReader = require('react-qr-reader')
}

class Qr extends React.Component {

	// constructor(props) {
	//     super(props);
	//     this.state = {
	// 	    result: '',
	// 	    scanner: false,
	// 	    success: '',
	// 	};
	// }

	state = {
	    result: '',
	    scanner: false,
	    success: '',
	}

	handleScan = data => {
	    if (data) {
	        console.log(data)
	        this.setState({
	            result: data,
	            scanner: false,
	        })
	        // this.checkIn()
	    } else {
	    	// Continue Scanning
	    	//this.handleError('Invalid QR data received.')
	    }
	}

	handleError = err => {
	    console.error(err)
	}

	qrClickHandler = () => {
	    // Display QR scanner
	    this.setState({ scanner: !this.state.scanner })
	}

	render() {
		  return (
		    <React.Fragment>
		        {<button onClick={this.qrClickHandler}>QR READER</button>}
		    	{this.state.result}
			    {this.state.scanner && (
			        <div>
			            <QrReader
			                scanDelay={300}
			                onError={this.handleError}
			                onScan={this.handleScan}
			            />
			        </div>
			    )}
		    </React.Fragment>
		)
	}
}

export default Qr;
