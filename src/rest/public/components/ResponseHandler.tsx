import * as React from 'react';
import * as ReactBootstrap from 'react-bootstrap';
import * as ReactBootstrapTable from 'react-bootstrap-table';
import BootstrapTable = ReactBootstrapTable.BootstrapTable;
import TableHeaderColumn = ReactBootstrapTable.TableHeaderColumn;
import Table = ReactBootstrap.Table;
import Checkbox = ReactBootstrap.Checkbox;
import {SelectRowMode} from "react-bootstrap-table";
import {SelectRow} from "react-bootstrap-table";


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
        if (isSelected && this.state.selected.length !== 2) {
            this.setState({
                selected: [ ...this.state.selected, row.name ]
            });
            return true;
        } else {
            this.setState({ selected: this.state.selected.filter( (ours : any) => ours !== row.name) });
            return false;
        }
    }

    render() {

        const rowMode : SelectRowMode = 'checkbox';

        const selectRow : SelectRow = {
            mode : rowMode,
            onSelect : this.onRowSelect.bind(this)
        }
        const {
            currPage
        } = this.state;

         var renderHead = (() => {
          return ( this.props.responseKeys.map( (item: any)=>{
              if (item === 'name' ) {
                  return   <TableHeaderColumn isKey={true} dataAlign="center"
                                              dataField={item}> {item}</TableHeaderColumn>
              }
              else{
                return <TableHeaderColumn dataAlign="center" dataSort={true} dataField={item}>{item}</TableHeaderColumn>
              }
            }) );
        });

        return(
        <BootstrapTable ref="table" selectRow={selectRow} data = {this.props.responseContent} striped = {true} hover = {true}>
            {renderHead()}
        </BootstrapTable>
        );
    }
}
