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

interface Window {
    FB: any;
}

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
            this.setState({
                errorMessage: res.body.err,
                schedule : false
            });
       }
        else {
            // set localStorage to track ratings
            let userList = JSON.parse(localStorage.getItem('facebookUserIds'));
            localStorage.setItem('facebookUserIds', JSON.stringify(userList));
            let currentUser = localStorage.getItem('currentFacebookUserId');
            if (userList && userList.length > 0) {
                for (var i = 0; i < userList.length; i++) {
                    if (userList[i] && userList[i].id === currentUser) {
                        if (userList[i].rating < res.body.quality) {
                            // Lets send a message.
                            let userObj = {
                                rating: res.body.quality,
                                id: currentUser
                            }
                            localStorage.setItem('newRatingFound', JSON.stringify(userObj));
                        }
                        userList[i].rating = res.body.quality; // TODO : ensure score is set.
                    }
                }
            }
            let result = res.body.bestSchedule
            // TODO: ensure set keys works.
            let resultKeys = Object.keys(result[0]);
            this.setState({
                schedule: true,
                responseContent: result,
                responseKeys: resultKeys,
                quality : res.body.quality
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
        if (this.state.schedule === false && (localStorage.getItem('rooms') === null || localStorage.getItem('courses') === null)){
                return(<Alerts alertStyle="danger"  message = {this.state.errorMessage} ></Alerts>)
        }
        else if (this.state.schedule === true) {
            return (
                <div>
                    <ResponseHandler quality={this.state.quality} isSchedule = 'true' responseKeys={this.state.responseKeys} responseContent ={this.state.responseContent} compiler="TypeScript" framework="React"/>
                </div>
            )
        }
        else{
            return (
            (<Alerts alertStyle="info"  message = 'Waiting for response....' ></Alerts>)
            )
        }

    }
}