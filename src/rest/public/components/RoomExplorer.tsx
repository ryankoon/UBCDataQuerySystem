/*
Should export a rendered module of dropdowns populated with rooms.
 */
import * as React from 'react';
import * as request from 'superagent';
import * as ReactBootstrap from 'react-bootstrap';
import {RoomForm} from "./RoomForm";
import {ResponseHandler} from "./ResponseHandler";
import Button = ReactBootstrap.Button;


export class RoomExplorer extends React.Component<any, any> {
    constructor(props:any){
        super(props);
        this.state = {
            building_name : [],
            room_type : [],
            furniture_type : [],
            responseContent : [],
            responseKeys : [],
            output : false
        }
        this.handleResponse = this.handleResponse.bind(this);
    }
    componentWillReceiveProps(){
    console.log('hit props');
    }

    handleResponse (data : any, sentStates : string) {
        if (data.body.result.length > 0) {
            var responseContent = data.body.result;

            var masterArray : Array<any> = [];
            var keys = Object.keys(responseContent[0]);


            for (var i=0; i < responseContent.length; i ++) {
                var tempArray = keys.map(key => responseContent[i][key]);
                masterArray.push(tempArray);
            }
            this.setState({
                responseContent : responseContent,
                output : true,
                responseKeys : keys
            })
        }
    }

    componentWillMount() {
        request.get('http://localhost:4321/roomInfo')
            .then( res => {

                console.log(this);

                let arrayOfRoomObjects = res.body.result;

                let building : Array<Object> = [];
                let room_type : Array<string> = [];
                let furniture_type : Array<string> = [];

                let tempBuildingTracker : Array<string> = [];

                for (let i=0; i < arrayOfRoomObjects.length; i++) {

                    if (tempBuildingTracker.indexOf(arrayOfRoomObjects[i].rooms_fullname) === -1) {
                        let temp : Object = {
                            building_name : arrayOfRoomObjects[i].rooms_fullname,
                            lat : arrayOfRoomObjects[i].rooms_lat,
                            lon : arrayOfRoomObjects[i].rooms_lon
                        }
                        building.push(temp);
                        tempBuildingTracker.push(arrayOfRoomObjects[i].rooms_fullname);
                    }
                    if (room_type.indexOf(arrayOfRoomObjects[i].rooms_type) === -1) {
                        if (arrayOfRoomObjects[i].rooms_type.length > 0) { // TODO: investigate why we have "" here in the data
                            room_type.push(arrayOfRoomObjects[i].rooms_type);
                        }
                    }
                    if (furniture_type.indexOf(arrayOfRoomObjects[i].rooms_furniture) === -1) {
                        furniture_type.push(arrayOfRoomObjects[i].rooms_furniture);
                    }
                }
                console.log(this);
                this.setState({
                    building_name : building,
                    room_type : room_type,
                    furniture_type : furniture_type,
                });
            }).catch(err => {
            // TODO: need to display warning / error handling
            console.log (err);
        })
    }

    render() {
        if (this.state.output === false) {
            return (
                <div>
                    <RoomForm handleResponse={this.handleResponse.bind(this)} buildings={this.state.building_name}
                              room_type={this.state.room_type} furniture={this.state.furniture_type}
                              compiler="TypeScript"
                              framework="React"/>
                </div>
            );
        }
        else{
            return (
                <div>
                    <ResponseHandler formContext = "rooms" responseKeys = {this.state.responseKeys} responseContent={this.state.responseContent} compiler="TypeScript"
                                 framework="React"/>
                </div>
            );

        }
    }
}