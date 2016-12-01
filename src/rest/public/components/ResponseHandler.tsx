import * as React from 'react';
import * as ReactBootstrap from 'react-bootstrap';
import * as ReactBootstrapTable from 'react-bootstrap-table';
import BootstrapTable = ReactBootstrapTable.BootstrapTable;
import TableHeaderColumn = ReactBootstrapTable.TableHeaderColumn;
import Table = ReactBootstrap.Table;
import Checkbox = ReactBootstrap.Checkbox;
import {SelectRowMode} from "react-bootstrap-table";
import {SelectRow} from "react-bootstrap-table";
import Button = ReactBootstrap.Button;
import {Alerts} from './Alert';

export class ResponseHandler extends React.Component<any, any> {
    constructor(props:any){
        super(props);
        this.state = {
            selected: [],
            alert : false
        }
    }
    refs: {
        [string: string]: any;
        table:any;
    }

    onRowSelect(row : any, isSelected : Boolean, e : any) {
        if (isSelected) {

            if(this.props.formContext === "courses"){
                this.setState({
                    selected: [ ...this.state.selected, row.subcourses_uuid ]
                });
            }else if (this.props.formContext === "rooms"){
                this.setState({
                    selected: [ ...this.state.selected, row.rooms_name ]
                });
            }
            else{
                this.setState({
                    selected: [...this.state.selected, row.Id]
                });
            }
            return true;
        } else {
            if(this.props.formContext === "courses"){
                this.setState({ selected: this.state.selected.filter( (ours : any) => ours !== row.subcourses_uuid) });

            }else if (this.props.formContext ==="rooms"){
                this.setState({ selected: this.state.selected.filter( (ours : any) => ours !== row.rooms_name) });

            }
            else{
                this.setState({ selected: this.state.selected.filter( (ours : any) => ours !== row.Id) });
            }
            return true;
        }
    }
    rowSelectAll(isSelected: Boolean, rows : any) {
        if(isSelected) {
            let interestedArray : Array<string> = [];
            if (this.props.formContext === "courses"){
                for (var i=0; i < rows.length; i++){
                    interestedArray.push(rows[i].subcourses_uuid);
                }
            }
            else if(this.props.formContext === "rooms"){

                for (var i=0; i < rows.length; i++){
                    interestedArray.push(rows[i].rooms_name);
                }
            }
            else{
                for (var i=0; i < rows.length; i++){
                    interestedArray.push(rows[i].Id);
                }
            }
            this.setState({
                selected: [ ...this.state.selected, interestedArray ]
            });
            return true;
        }
        else{
            var emptyState : Array<any> = [];
            this.setState({
                selected: emptyState
            });
        return true;
        }
    }
    applySchedule(e : any){
        if (this.state.selected.length > 0) {
            let temp : any = [];
            var itemList : any = [];
            if (this.props.formContext === 'rooms'){
                itemList = this.state.selected[0];
            }
            else{
                itemList = this.state.selected;
            }
            for (var i=0; i < itemList.length; i++)
            {
                temp.push(itemList[i]);
            }
            var currentLocalStorage = localStorage.getItem(this.props.formContext);
            if (currentLocalStorage !== null) {
                let ourArray = currentLocalStorage.split(',');
                let mergedArray = temp.concat(ourArray);
                localStorage.setItem(this.props.formContext, mergedArray);
            }
            else {
                localStorage.setItem(this.props.formContext, temp);
            }

            console.log('set schedule. lets show success!');
            this.setState({
                alert : true
            });

        }
    }

    render() {

        const rowMode : SelectRowMode = 'checkbox';
        const selectRow : SelectRow = {
            mode : rowMode,
            onSelect : this.onRowSelect.bind(this),
            onSelectAll : this.rowSelectAll.bind(this)
        }
        const setSchedule = this.applySchedule.bind(this);

         var renderHead = (() => {
          return ( this.props.responseKeys.map( (item: any)=>{
              if (item === 'rooms_name' || item ==='subcourses_uuid' || item === 'Id' ) {
                  return   <TableHeaderColumn isKey={true} dataAlign="center"
                                              dataField={item}> {item}</TableHeaderColumn>
              }
              else{
                return <TableHeaderColumn dataAlign="center" dataSort={true} dataField={item}>{item}</TableHeaderColumn>
              }
            }) );
        });

       if(this.state.alert === true){
           return(
               <div>
                   <Alerts alertStyle="success" message="Successfully added to schedule!"></Alerts>
                   <Button onClick={setSchedule}> Apply to Schedule </Button>
                   <BootstrapTable
                       search
                       columnFilter
                       ref="table"  selectRow={selectRow} data = {this.props.responseContent} striped = {true} hover = {true}>
                       {renderHead()}
                   </BootstrapTable>
               </div>
           );
       }
       else if (this.props.isSchedule === 'true') {
           return(
               <div>
                   <h3> Quality of this schedule is : {this.props.quality}</h3>
                   <BootstrapTable
                       search
                       columnFilter
                       ref="table" data = {this.props.responseContent} striped = {true} hover = {true}>
                       {renderHead()}
                   </BootstrapTable>
               </div>
           );
       }
       else{
           return(
               <div>
                   <Button onClick={setSchedule}> Apply to Schedule </Button>
                   <BootstrapTable
                       search
                       columnFilter
                       ref="table"  selectRow={selectRow} data = {this.props.responseContent} striped = {true} hover = {true}>
                       {renderHead()}
                   </BootstrapTable>
               </div>
           );
       }
    }
}
