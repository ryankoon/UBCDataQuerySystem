import * as React from 'react';
import * as ReactBootstrap from 'react-bootstrap';
import Button = ReactBootstrap.Button;
import Alert = ReactBootstrap.Alert;

export class Alerts extends React.Component<any, any> {
    constructor(props : any){
        super(props);
        this.state = {
            alertVisible : false
        }
    }

    handleAlertShow() {
        this.setState({alertVisible: true});
    }
    handleAlertDismiss() {
        this.setState({alertVisible: false});
    }
    render(){
        return(
        <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss}>
            <h4>UHOH AN ERROR!</h4>
            <p>{this.props.error}</p>
            <p><Button onClick={this.handleAlertDismiss}>Hide Message</Button></p>
        </Alert>
        );
    }
}
