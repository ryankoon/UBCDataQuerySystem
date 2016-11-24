import * as React from 'react';
import * as ReactBootstrap from 'react-bootstrap';
import * as request from 'superagent';

import FormControl = ReactBootstrap.FormControl;
import ControlLabel = ReactBootstrap.ControlLabel;
import FormGroup = ReactBootstrap.FormGroup;
import Button = ReactBootstrap.Button;

export class CourseForm extends React.Component<any, any> {
    constructor(props : any){
        super (props)
        this.state = {
            courses_title : null,
            courses_instructor : null,
            courses_section : null,
            courses_size : null,
            courses_dept : null
        }
    }
    setCourseName(e : any) {
        this.setState({
            courses_title : e.target.value
        });
    }
    setInstructor(e : any) {
        this.setState({
            courses_instructor : e.target.value
        });
    }
    setSectionNumber(e : any) {
        this.setState({
            courses_section : e.target.value
        });
    }
    setSectionSize(e: any){
       this.setState({
           courses_size : e.target.value
       })
    }
    setDepartmentName(e: any ){
        this.setState({
            courses_dept : e.target.value
        });
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
                <ControlLabel> Section Size </ControlLabel>
                <FormControl onChange = {this.setSectionSize.bind(this)} componentClass="select" placeholder="Size" >
                    <option value = "undefined"> Select a section. </option>
                    {this.props.sizes.map((item:any, index: any) =>{
                        return <option  value={item}>{item}</option>
                    })}
                </FormControl>
            </form>
        );
    }
}