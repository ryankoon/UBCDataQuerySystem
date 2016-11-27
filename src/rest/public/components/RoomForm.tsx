import * as React from 'react';
import * as ReactBootstrap from 'react-bootstrap';
import * as request from 'superagent';

import FormControl = ReactBootstrap.FormControl;
import ControlLabel = ReactBootstrap.ControlLabel;
import FormGroup = ReactBootstrap.FormGroup;
import Button = ReactBootstrap.Button;
export class RoomForm extends React.Component<any, any> {
    constructor(props : any){
    super (props)
        this.state = {
            rooms_fullname : null,
            rooms_type : null,
            rooms_furniture : null,
            rooms_distance : null,
            rooms_seats: null,
            rooms_lat : null,
            rooms_lon: null
        }
    }

    setFurnitureType (e:any){
        this.setState({
            rooms_furniture : e.target.value
        })
    }
    setBuildingName (e:any){
        this.setState({
            rooms_fullname : e.target.value,
            rooms_lat : e.target[e.target.selectedIndex].getAttribute('data-lat'),
            rooms_lon : e.target[e.target.selectedIndex].getAttribute('data-lon')
        });
    }
    setRoomType (e:any){
        this.setState({
            rooms_type : e.target.value
        })
    }
    setDistance (e:any){
        this.setState({
            rooms_distance : e.target.value
        })
    }
    setSize (e:any){
        this.setState({
            rooms_seats : e.target.value
        })
    }

    submitRoomsForm(e : any){
        e.preventDefault();
        let tempState = this.state;
        for (var key in tempState){
            if(tempState[key] === null || tempState[key] === "select" || tempState[key] === "" || tempState[key] === 'undefined'){
                delete tempState[key];
            }
        }
        let keys = Object.keys(tempState);
        if (keys.length > 0 ) {
            let payload: String = JSON.stringify(tempState);
            request
                .post('http://localhost:4321/roomExplorer')
                .send(payload)
                .end((err, res) => {
                    if (err) {
                        console.log (err); // TODO : Need an error handle/display system.
                    }
                    if (res){
                        this.props.handleResponse(res, payload);
                    }
                });

        }
        else{
            console.log('Show an error message, this shouldnt happen');
        }


    }

    render() {
        return (
            <form ref="form">
                <FormGroup>
                    <ControlLabel> Building Name </ControlLabel>
                    <FormControl onChange = {this.setBuildingName.bind(this)} componentClass="select" placeholder="Building name" >
                        <option value = "select"> Select a building. </option>
                        {this.props.buildings.map((item:any, index: any) =>{
                            return <option key = {index} data-lat={item.lat} data-lon={item.lon} value={item.building_name}>{item.building_name}</option>
                        })}
                    </FormControl>

                    <ControlLabel> Room Type </ControlLabel>
                    <FormControl onChange = {this.setRoomType.bind(this)} componentClass="select" placeholder="RoomType" >
                        <option value = "select"> Select a type of room. </option>
                        {this.props.room_type.map((item:any, index: any) =>{
                            return <option  key = {index} value={item}>{item}</option>
                        })}
                    </FormControl>

                    <ControlLabel> Furniture Type </ControlLabel>
                    <FormControl componentClass="select" input = "text" name="furniture" placeholder="Furniture Type" onChange={this.setFurnitureType.bind(this)}>
                        <option value = "select"> Select a type of furniture. </option>
                        {this.props.furniture.map((item:any, index: any) =>{
                            return <option  key = {index} value={item}>{item}</option>
                        })}
                    </FormControl>


                    <ControlLabel> Within Distance </ControlLabel>
                    <FormControl input="number" onChange = {this.setDistance.bind(this)} componentClass="textarea" placeholder="Please enter a distance in km.">
                    </FormControl>

                    <ControlLabel> Within Room Size </ControlLabel>
                    <FormControl onChange = {this.setSize.bind(this)} componentClass="textarea" placeholder="Please enter a room size.">
                    </FormControl>

                    <Button type="submit" onClick = {this.submitRoomsForm.bind(this)}> Submit </Button>
                </FormGroup>
            </form>
            );
    }

        }