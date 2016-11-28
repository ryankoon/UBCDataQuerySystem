import * as React from 'react';
import * as ReactBootstrap from 'react-bootstrap';
import Button = ReactBootstrap.Button;
import Alert = ReactBootstrap.Alert;

export class Alerts extends React.Component<any, any> {
    constructor(props : any){
        super(props);
        this.state = {
            alertVisible : true
        }
    }
    handleAlertDismiss() {
        this.setState({alertVisible: false});
    }
    render(){
        if (this.state.alertVisible === true) {
            return (
                <Alert bsStyle={this.props.alertStyle} onDismiss={this.handleAlertDismiss.bind(this)}>
                    <h4>{this.props.message}</h4>
                    <p><Button onClick={this.handleAlertDismiss.bind(this)}>Hide Message</Button></p>
                </Alert>
            );
        }
        else{
            return (
                <div></div>
            )
        }
    }
}
