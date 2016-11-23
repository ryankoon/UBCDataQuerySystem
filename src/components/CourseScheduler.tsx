import * as React from 'react';
import {DropdownButton, MenuItem} from 'react-bootstrap'

export class CourseScheduler extends React.Component<any, any>  {
    constructor(props: any) {
        super(props);
    }
    render() {
        return (
            <div>
                <h2> Course Scheduler</h2>
                <DropdownButton bsStyle="primary" id="courses-dropdown" title="Course Name">
                    <MenuItem eventKey="1">Action<input type="checkbox"/></MenuItem>
                    <MenuItem eventKey="2">Another action<input type="checkbox"/></MenuItem>
                    <MenuItem eventKey="3" active>Active Item<input type="checkbox"/></MenuItem>
                    <MenuItem eventKey="4">Separated link<input type="checkbox"/></MenuItem>
                </DropdownButton>
            </div>
        );
    }
};