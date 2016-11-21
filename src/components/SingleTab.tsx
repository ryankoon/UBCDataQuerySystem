import * as React from 'react';

//TODO: This is the container for all of our tabs.
export default class SingleTab extends React.Component<any, any> {
    constructor(props : any){
        super(props);
        this.handleClick = this.props.handleClick.bind(this);
    }
    render() {
        return (
            <li >
                <a onClick = {this.props.handleClick} href="#">  {this.props.name} </a>
            </li>);
    }
    handleClick(e : any) {
        console.log('we hit!');
        console.log('this is e: ' + e);
        e.preventDefault();
       // this.props.handleClick();
    }
    // we now want 'onClick' show content....
}