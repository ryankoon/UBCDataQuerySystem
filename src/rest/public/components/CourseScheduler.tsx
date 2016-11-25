/**
 * Created by alekspc on 2016-11-24.
 */
/*
 Should export a rendered module of dropdowns populated with rooms.
 */
import * as React from 'react';
import * as request from 'superagent';
import * as ReactBootstrap from 'react-bootstrap';
import * as ReactDOM from 'react-dom';
import {RoomForm} from "./RoomForm";
import {Response} from "restify";
import {CourseSchedulerForm} from "./CourseSchedulerForm";


export class CourseScheduler extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        this.state = {
        }
    }
    render() {
    return (
        <div>
            <CourseSchedulerForm compiler="TypeScript" framework="React"/>

        </div>
    )
    }
}