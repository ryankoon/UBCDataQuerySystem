import * as React from 'react';
import * as ReactBootstrap from 'react-bootstrap';
import * as request from 'superagent';

import FormControl = ReactBootstrap.FormControl;
import ControlLabel = ReactBootstrap.ControlLabel;
import FormGroup = ReactBootstrap.FormGroup;
import Button = ReactBootstrap.Button;
import Radio = ReactBootstrap.Radio;
import ButtonGroup = ReactBootstrap.ButtonGroup;
import Checkbox = ReactBootstrap.Checkbox;

export class CourseForm extends React.Component<any, any> {
    constructor(props : any){
        super (props)
        this.state = {
            subcourses_title : null,
            subcourses_instructor : null,
            subcourses_Section : null,
            subcourses_SectionSize : null,
            subcourses_dept : null,
            subcourses_average: null,
            subcourses_passfail : null,
            subcourses_Course : null,
            orderByAverage : false,
            orderByPass : false,
            orderByFail : false
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
           subcourses_SectionSize : e.target.value
       })
    }
    setDepartmentName(e: any ){
        this.setState({
            subcourses_dept : e.target.value
        });
    }
    setCourseNumber(e : any) {
        this.setState({
            subcourses_Course : e.target.value
        })
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
    setOrderByAverage(e:any) {
        if (e.target.checked){
            this.setState({
                orderByAverage : true
            });
        }
        else{
            this.setState({
                orderByAverage: false
            })
        }
    }
    setOrderByPass(e:any) {
        if (e.target.checked) {
            this.setState({
                orderByPass : true
            })
        }
        else{
            this.setState({
                orderByPass : false
            })
        }
    }
    setOrderByFail(e:any) {
        if (e.target.checked){
            this.setState({
                orderByFail : true
            })
        }else{
            this.setState({
                orderByFail : false
            })
        }
    }
    submitCourseQuery(e: any) {
        e.preventDefault();


        let tempState = this.state;

        /*
        Need to account for the ordering now (hacky unfortunately)
         */
        let orderByFail = this.state.orderByFail;
        let orderByPass = this.state.orderByPass;
        let orderByAverage = this.state.orderByAverage;
        let orderByArray : Array<string> = [];

        if (orderByFail === true){
            orderByArray.push('subcourses_Fail');
        }
        if (orderByPass === true){
            orderByArray.push('subcourses_Pass');
        }
        if (orderByAverage === true) {
            orderByArray.push('subcourses_Avg');
        }
        if (orderByArray.length > 0 ){
            tempState['orderby'] = orderByArray;
        }

        for (var key in tempState){
            if(tempState[key] === null || tempState[key] === "select" || tempState[key] === "" || tempState[key] === 'undefined'
                || key === 'orderByFail' || key === 'orderByPass' || key === 'orderByAverage'){
                delete tempState[key];
            }
        }
        let keys = Object.keys(tempState);
        if (keys.length > 0 ) {
            let payload: String = JSON.stringify(tempState);
            request
                .post('http://localhost:4321/courseExplorer')
                .send(payload)
                .end( (err, res) => {
                   if(err){
                       console.log(err);
                   }
                   if(res){
                       this.props.handleResponse(res, payload);
                   }
                });
        }
        else{
            console.log("reaches this state when you submit query without selecting any filters.");
            console.log('Show an error message, this shouldnt happen');
        }
    }

    render() {
        return (
            <form ref="form">
                <FormGroup>
                    <ControlLabel> Courses </ControlLabel>
                    <FormControl onChange = {this.setCourseName.bind(this)} componentClass="select" placeholder="Course">
                        <option value = "undefined"> Select a course. </option>
                        {this.props.titles.map((item:any, index: any) =>{
                            return <option  value={item}>{item}</option>
                        })}
                    </FormControl>
                    <ControlLabel> Course Number </ControlLabel>
                    <FormControl onChange = {this.setCourseNumber.bind(this)} componentClass="select" placeholder="Course Number">
                        <option value = "undefined"> Select a course number. </option>
                        {this.props.courses.map((item:any, index: any) =>{
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
                    <FormGroup>
                        Order by
                        <Checkbox onChange={this.setOrderByPass.bind(this)} value="pass" inline>
                            Pass
                        </Checkbox>
                        <Checkbox onChange={this.setOrderByFail.bind(this)} value="fail"  inline>
                            Fail
                        </Checkbox>
                        <Checkbox onChange={this.setOrderByAverage.bind(this)} value="average"inline>
                            Avg
                        </Checkbox>
                    </FormGroup>
                    <Button type="submit" onClick = {this.submitCourseQuery.bind(this)}> Submit Query </Button>
                </FormGroup>
            </form>
        );
    }
}