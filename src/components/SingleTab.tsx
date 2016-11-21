import * as React from 'react';

//TODO: This is the container for all of our tabs.
export default class SingleTab extends React.Component<any, any> {
    constructor(props : any){
        super(props);
    }
    render() {
        return (
            <li >
                <a onClick={this.handleClick} href="#">  {this.props.name} </a>
            </li>);
    }
    handleClick(e : any){ // this is an issue... I need to figure out how to properly swap tabs and display containercontent
       // probably need to do a bind on this.state somehow and click state in props
        e.preventDefault();
        this.props.swapClick(e);
    }
}