/**
 * Created by alekspc on 2016-11-24.
 */
/*
 Should export a rendered module of dropdowns populated with rooms.
 */
import * as React from 'react';
import {ResponseHandler} from './ResponseHandler';
import {Alerts} from './Alert';
import * as request from 'superagent';
import * as superagent from "superagent";

export class CourseScheduler extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        this.state = {
            schedule : false,
            responseContent : null,
            responseKeys : null,
            errorMessage : null
        }
    }
    handleResponse(res : any, payload : any){
        // TODO: unremove comments. this is temporary to test FB
        if (res.body && res.body.err && res.body.err.length > 0){
            // set localStorage to track ratings
            let userList = JSON.parse(localStorage.getItem('facebookUserIds'));
            let currentUser = localStorage.getItem('currentFacebookUserId');
            for (var i=0; i < userList.length; i++){
                if(userList[i] && userList[i].id === currentUser){
                    userList[i].rating = res.body.quality; // TODO : ensure score is set.
                }
            }
            localStorage.setItem('facebookUserIds', JSON.stringify(userList));
            this.setState({
                errorMessage: res.body.err,
                schedule : false
            });
       }
        else {
            let result = res.body.bestSchedule
            // TODO: ensure set keys works.
            let resultKeys = Object.keys(result[0]);
            this.setState({
                schedule: true,
                responseContent: result,
                responseKeys: resultKeys
            });
        }

    }


    componentWillMount(){
        if (localStorage.getItem('rooms') !== null && localStorage.getItem('courses') !== null){
            // TODO: set post
            let roomsStr  = localStorage.getItem('rooms');
            let coursesStr = localStorage.getItem('courses');
            let courses : string[];
            let rooms : string[];
            if(coursesStr && roomsStr){
                courses = coursesStr.split(',');
                rooms = roomsStr.split(',');
            }
            let payload = {
                rooms : rooms,
                courses : courses
            }
            let stringifiedPayload = JSON.stringify(payload);
            superagent.post('http://localhost:4321/scheduleCourses')
                .send(stringifiedPayload)
                .end( (err, res) => {
                    if(err){
                        console.log(err);
                    }
                    if(res){
                        this.handleResponse(res, payload);
                    }
                });
        }else{
            this.setState({
                schedule : false,
                errorMessage : 'Please select rooms and courses before submitting',
            });

        }
    }
    render() {
        if (this.state.schedule === true) {
            return (
                <div>
                    <ResponseHandler isSchedule = 'true' responseKeys={this.state.responseKeys} responseContent ={this.state.responseContent} compiler="TypeScript" framework="React"/>
                </div>
            )
        }
        else{
            return(<Alerts alertStyle="danger"  message = {this.state.errorMessage} ></Alerts>)
        }
    }
}