import * as React from 'react';
import * as ReactBootstrap from 'react-bootstrap';
import * as request from 'superagent';

import FormControl = ReactBootstrap.FormControl;
import ControlLabel = ReactBootstrap.ControlLabel;
import FormGroup = ReactBootstrap.FormGroup;
import Button = ReactBootstrap.Button;
import Radio = ReactBootstrap.Radio;
import ButtonGroup = ReactBootstrap.ButtonGroup;

export class CourseForm extends React.Component<any, any> {
    constructor(props : any){
        super (props)
        this.state = {
            subcourses_title : null,
            subcourses_instructor : null,
            subcourses_section : null,
            subcourses_size : null,
            subcourses_dept : null,
            subcourses_average: null,
            subcourses_passfail : null
        }
    }
    setCourseName(e : any) {
        this.setState({
            subcourses_title : e.target.value
        });
    }
    setInstructor(e : any) {
        this.setState({
            subcourses_instructor : e.target.value
        });
    }
    setSectionNumber(e : any) {
        this.setState({
            subcourses_Section : e.target.value
        });
    }
    setSectionSize(e: any){
       this.setState({
           subcourses_size : e.target.value
       })
    }
    setDepartmentName(e: any ){
        this.setState({
            subcourses_dept : e.target.value
        });
    }
    setAverage(e : any) {
        if (e.target.value === 'undefined' || e.target.value === null){
            this.setState({
                subcourses_average: null
            })
        }
        else{
            this.setState({
                subcourses_average : e.target.value
            })
        }
    }
    setPassFail(e:any){
        if (e.target.value === 'undefined' || e.target.value === null){
            this.setState({
                subcourses_passfail: null
            })
        }
        else{
            this.setState({
                subcourses_passfail : e.target.value
            })
        }
    }

    submitCourseQuery(e: any) {
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
                .post('http://localhost:4321/courseExplorer')
                .send(payload)
                .end();
        }
        else{
            console.log("reaches this state when you submit query without selecting any filters.");
            console.log('Show an error message, this shouldnt happen');
        }
    }

    render() {
        return (
            <form ref="form">
                <ControlLabel> Courses </ControlLabel>
                <FormControl onChange = {this.setCourseName.bind(this)} componentClass="select" placeholder="Course">
                    <option value = "undefined"> Select a course. </option>
                    {this.props.titles.map((item:any, index: any) =>{
                        return <option  value={item}>{item}</option>
                    })}
                </FormControl>
                <ControlLabel> Instructors </ControlLabel>
                <FormControl onChange = {this.setInstructor.bind(this)} componentClass="select" placeholder="Instructor" >
                    <option value = "undefined"> Select an instructor. </option>
                    {this.props.instructors.map((item:any, index: any) =>{
                        return <option  value={item}>{item}</option>
                    })}
                </FormControl>
                <ControlLabel>Departments</ControlLabel>
                <FormControl onChange = {this.setDepartmentName.bind(this)} componentClass="select" placeholder="SectionNumber" >
                    <option value = "undefined"> Select a section. </option>
                    {this.props.depts.map((item:any, index: any) =>{
                        return <option  value={item}>{item}</option>
                    })}
                </FormControl>
                <ControlLabel> Section Number </ControlLabel>
                <FormControl onChange = {this.setSectionNumber.bind(this)} componentClass="select" placeholder="SectionNumber" >
                    <option value = "undefined"> Select a section. </option>
                    {this.props.sections.map((item:any, index: any) =>{
                        return <option  value={item}>{item}</option>
                    })}
                </FormControl>
                <ControlLabel> Within section size </ControlLabel>
                <FormControl onChange = {this.setSectionSize.bind(this)} componentClass="select" placeholder="Size" >
                    <option value = "undefined"> Select a section. </option>
                    {this.props.sizes.map((item:any, index: any) =>{
                        return <option  value={item}>{item}</option>
                    })}
                </FormControl>
                <ControlLabel> Sort by a class average</ControlLabel>
                <ButtonGroup onChange = {this.setAverage.bind(this)}>
                    <Radio name="average"  active value = "undefined" inline>Neither </Radio>
                    <Radio name="average"  value = "high" inline>Highest </Radio>
                    <Radio name="average"  value = "high" inline>Lowest </Radio>
                </ButtonGroup>
                <ControlLabel> Pass/Fail Sort </ControlLabel>
                <ButtonGroup onChange = {this.setPassFail.bind(this)}>
                    <Radio name="average"  active value = "undefined" inline> Neither </Radio>
                    <Radio name="average"  value = "pass" inline> Pass </Radio>
                    <Radio name="average"  value = "fail" inline> Fail </Radio>
                </ButtonGroup>
                <Button type="submit" onClick = {this.submitCourseQuery.bind(this)}> Submit Query </Button>
            </form>
        );
    }
}