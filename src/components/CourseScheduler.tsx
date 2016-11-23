import * as React from 'react';
import {DropdownButton, MenuItem} from 'react-bootstrap'

export class CourseScheduler extends React.Component<any, any>  {
    title: string;
    i: number;
    constructor(props: any) {
        super(props);
        this.title = props.title;
        this.i = props.i;
    }
    render() {
        return (
            <div>
                <h2> Course Scheduler</h2>
                <DropdownButton bsStyle={this.title.toLowerCase()} title={this.title} key={this.i} id={`dropdown-basic-${this.i}`}>
                    <MenuItem eventKey="1">Action</MenuItem>
                    <MenuItem eventKey="2">Another action</MenuItem>
                    <MenuItem eventKey="3" active>Active Item</MenuItem>
                    <MenuItem divider />
                    <MenuItem eventKey="4">Separated link</MenuItem>
                </DropdownButton>
            </div>
        );
    }
};