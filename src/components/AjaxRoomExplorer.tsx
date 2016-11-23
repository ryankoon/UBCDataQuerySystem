/*
TODO : Should send, receieve and parse AJAX requests to the backend for rooms.
 */
import * as React from 'react';
import * as request from 'superagent';
import * as ReactBootstrap from 'react-bootstrap';
import * as ReactDOM from 'react-dom';
import DropdownButton = ReactBootstrap.DropdownButton;
import MenuItem = ReactBootstrap.MenuItem;
export class AjaxRoomExplorer extends React.Component<any, any> {

    constructor(props : any) {
        super(props);
        this.state = {
            room_number : [],
            building_name : [],
            room_size : [],
            room_type : []        }
       // }
    }

    componentWillMount () {
        request.get('http://localhost:4321/roomInfo')
            .then( res => {
                let arrayOfRoomObjects = res.body.result;

                let room_number : Array<string> = [];
                let building_name : Array<string> = [];
                let room_size : Array<any> = [];
                let room_type : Array<string> = [];

                // TODO: handle the distance?
                let room_lat : Array<any> = [];
                let room_lng : Array<any> =[];

                for (let i=0; i < arrayOfRoomObjects.length; i++) {

                    if (room_number.indexOf(arrayOfRoomObjects[i].rooms_number) === -1) {
                        room_number.push(arrayOfRoomObjects[i].rooms_number);
                    }
                    if (building_name.indexOf(arrayOfRoomObjects[i].rooms_fullname) === -1) {
                        building_name.push(arrayOfRoomObjects[i].rooms_fullname);
                    }
                    if (room_size.indexOf(arrayOfRoomObjects[i].rooms_seats) === -1) {
                        room_size.push(arrayOfRoomObjects[i].rooms_seats);
                    }
                    if (room_type.indexOf(arrayOfRoomObjects[i].rooms_type) === -1) {
                        room_type.push(arrayOfRoomObjects[i].rooms_type);
                    }
                }

                room_size.sort( (a,b) => a-b);

                this.setState({
                    room_number : room_number,
                    building_name : building_name,
                    room_size : room_size,
                    room_type : room_type
                });
            }).catch(err => {
                // TODO: need to display warning / error handling
                console.log (err);
        })
    }
    render () {
        return (
        <div>
            <DropdownButton className ="dropdown-margins" bsStyle="primary" id="building-dropdown" title="Building Name">
                {this.state.building_name.map((item:any, index: any) =>{
                    return <MenuItem eventKey = {index}> {item} </MenuItem>
                })}
            </DropdownButton>

            <DropdownButton bsStyle="primary" id="room-number-dropdown" title="Room Number">
            {this.state.room_number.map((item:any, index: any) =>{
                return <MenuItem eventKey = {index}> {item} </MenuItem>
            })}
            </DropdownButton>

            <DropdownButton bsStyle="primary" id="room-size-dropdown" title="Room Size">
                {this.state.room_size.map((item:any, index: any) =>{
                    return <MenuItem eventKey = {index}> {item} </MenuItem>
                })}
            </DropdownButton>

            <DropdownButton bsStyle="primary" id="room-type-dropdown" title="Room Type">
                {this.state.room_type.map((item:any, index: any) =>{
                    return <MenuItem eventKey = {index}> {item} </MenuItem>
                })}
            </DropdownButton>
        </div>
        );
    }

}