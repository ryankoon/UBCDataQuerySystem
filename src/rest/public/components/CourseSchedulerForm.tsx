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
import ControlLabel = ReactBootstrap.ControlLabel;
import FormControl = ReactBootstrap.FormControl;
import Button = ReactBootstrap.Button;

export class CourseSchedulerForm extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        this.state = {
            department: null,
            id : null,
            name : null,
            distance : null

        }
    }
    setDepartment (e:any){
        this.setState({
            department : e.target.value
        })
    }
    setCourseCode (e:any){
        this.setState({
            id : e.target.value
        })
    }
    setBuildingName (e:any){
        this.setState({
            name : e.target.value
        })
    }
    setDistance (e:any){
        this.setState({
            distance : e.target.value
        })
    }
    submitSchedule(e:any){
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
                .post('http://localhost:4321/scheduleCourses')
                .send(payload)
                .end();
        }
        else{
            console.log('Show an error message, this shouldnt happen');
        }
    }

    render() {
        return(
            <form>
                <ControlLabel> Name of department </ControlLabel>
                <FormControl onChange = {this.setDepartment.bind(this)} componentClass="textarea" placeholder="Please enter a department acronym (e.g CPSC)">
                </FormControl>
                <ControlLabel> ID of a course </ControlLabel>
                <FormControl onChange = {this.setCourseCode.bind(this)} componentClass="textarea" placeholder="Please enter a course code (e.g. 210 for CPSC 210)">
                </FormControl>
                <ControlLabel> Name of building </ControlLabel>
                <FormControl onChange = {this.setBuildingName.bind(this)} componentClass="textarea" placeholder="Please enter a building name.">
                </FormControl>
                <ControlLabel> Distance from designated building (optional and in km)  </ControlLabel>
                <FormControl onChange = {this.setDistance.bind(this)} componentClass="textarea" placeholder="Please enter a distance if you entered a building name">
                </FormControl>
                <Button type="submit" onClick = {this.submitSchedule.bind(this)}> Submit Schedule </Button>

            </form>
        );

    }
}