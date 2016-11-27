/**
 * Created by alekspc on 2016-11-25.
 */

import * as React from 'react';
import * as request from 'superagent';
import * as ReactBootstrap from 'react-bootstrap';
import * as ReactDOM from 'react-dom';
import Button = ReactBootstrap.Button;

export class FacebookButton extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
    }
    render() {
        return (
            <Button type="click" className="fb-connect" bsStyle="primary">Connect to Facebook</Button>
        );
    }
}
