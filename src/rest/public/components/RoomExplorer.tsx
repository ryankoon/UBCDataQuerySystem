/*
Should export a rendered module of dropdowns populated with rooms.
 */
import * as React from 'react';
import * as request from 'superagent';
import * as ReactBootstrap from 'react-bootstrap';
import * as ReactDOM from 'react-dom';
import {RoomForm} from "./RoomForm";


export class RoomExplorer extends React.Component<any, any> {
    constructor(props:any){
        super(props);
        this.state = {
            building_name : [],
            room_type : [],
            furniture_type : []
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
                            lng : arrayOfRoomObjects[i].rooms_lon
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
    render(){
        return (
            <div>
                <RoomForm buildings = {this.state.building_name} room_type ={this.state.room_type} furniture = {this.state.furniture_type} compiler="TypeScript" framework="React"/>
            </div>
        );
    }
}