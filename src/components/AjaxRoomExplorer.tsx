/*
TODO : Should send, receieve and parse AJAX requests to the backend for rooms.
 */
import * as React from 'react';
import * as request from 'superagent';
import * as ReactDOM from 'react-dom';
export class AjaxRoomExplorer extends React.Component<any, any> {

    constructor(props : any) {
        super(props);
        this.state = {
            rooms : []
        }
       // this.state = {
        //    items : []
            /*
            room_name : [],
            building_name : [],
            room_size : [],
            furniture_type : [],
            location : []
            */
       // }
    }

    componentWillMount () {
        request.get('http://localhost:4321/roomInfo')
            .then( res => {
                this.setState({rooms : res.body.result});
            }).catch(err => {
                // TODO: need to display warning / error handling
                console.log (err);
        })
    }
    render () {
        return (
            <ul>
                <li> Should've rendered a massive list </li>
                {this.state.rooms.map((item : any)=>{
                return <li> {item.rooms_number} </li>
                })}
            </ul>
        );
    }

}