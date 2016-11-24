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
            buildingName : null,
            roomType : null,
            furnitureType : null,
            distance : null,
            size: null,
            lat : null,
            lng: null
        }
    }

    setFurnitureType (e:any){
        this.setState({
            furnitureType : e.target.value
        })
    }
    setBuildingName (e:any){
        this.setState({
            buildingName : e.target.value,
            lat : e.target.getAttribute('data-lat'),
            lng : e.target.getAttribute('data-lng')
        });
    }
    setRoomType (e:any){
        this.setState({
            roomType : e.target.value
        })
    }
    setDistance (e:any){
        this.setState({
            distance : e.target.value
        })
    }
    setSize (e:any){
        this.setState({
            size : e.target.value
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
                .end();
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
                            return <option data-lat = {item.lat} data-lng = {item.lng} value={item.building_name}>{item.building_name}</option>
                        })}
                    </FormControl>

                    <ControlLabel> Room Type </ControlLabel>
                    <FormControl onChange = {this.setRoomType.bind(this)} componentClass="select" placeholder="RoomType" >
                        <option value = "select"> Select a type of room. </option>
                        {this.props.room_type.map((item:any, index: any) =>{
                            return <option value={item}>{item}</option>
                        })}
                    </FormControl>

                    <ControlLabel> Furniture Type </ControlLabel>
                    <FormControl componentClass="select" input = "text" name="furniture" placeholder="Furniture Type" onChange={this.setFurnitureType.bind(this)}>
                        <option value = "select"> Select a type of furniture. </option>
                        {this.props.furniture.map((item:any, index: any) =>{
                            return <option value={item}>{item}</option>
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