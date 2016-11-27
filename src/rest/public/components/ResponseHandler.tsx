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


export class ResponseHandler extends React.Component<any, any> {
    constructor(props:any){
        super(props);
        this.state = {
            selected: [],
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
            }else{
                this.setState({
                    selected: [ ...this.state.selected, row.name ]
                });
            }
            return true;
        } else {
            if(this.props.formContext === "courses"){
                this.setState({ selected: this.state.selected.filter( (ours : any) => ours !== row.subcourses_uuid) });

            }else{
                this.setState({ selected: this.state.selected.filter( (ours : any) => ours !== row.name) });

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
            else{

                for (var i=0; i < rows.length; i++){
                    interestedArray.push(rows[i].name);
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
            localStorage.setItem(this.props.formContext, this.state.selected);
            console.log('set schedule. lets show success!');
        }
        else{
            localStorage.removeItem(this.props.formContext);
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
              if (item === 'name' || item ==='subcourses_uuid' ) {
                  return   <TableHeaderColumn isKey={true} dataAlign="center"
                                              dataField={item}> {item}</TableHeaderColumn>
              }
              else{
                return <TableHeaderColumn dataAlign="center" dataSort={true} dataField={item}>{item}</TableHeaderColumn>
              }
            }) );
        });

        return(
         <div>
            <Button onClick={setSchedule}> Apply to schedule </Button>
            <BootstrapTable ref="table"  selectRow={selectRow} data = {this.props.responseContent} striped = {true} hover = {true}>
                {renderHead()}
            </BootstrapTable>
         </div>
        );
    }
}
