import * as React from 'react';
import * as ReactBootstrap from 'react-bootstrap';
import Table = ReactBootstrap.Table;


export class ResponseHandler extends React.Component<any, any> {
    constructor(props:any){
        super(props);
    }


    render() {

         var getArrays = (() => {
             var masterArray : Array<any> = [];
             this.props.responseContent.map( (eachRow : any) => {
                var tempArray : Array<any>= [];
                for (var property in eachRow){
                    if (eachRow.hasOwnProperty(property)){
                        tempArray.push(eachRow[property]);
                    }
                }
                masterArray.push(tempArray);
            });
             return masterArray;
         });
         var renderRows = (() =>{
             var masterArray = getArrays();
              var html = "";
             return masterArray.map( (item:any) => {
                return <tr>{item.map( (subItem : any) => <td>{subItem}</td>)}</tr>
             })
         })
         var renderHead = (() => {
          return  this.props.responseKeys.map( (item: any)=>{
                return <th>{item}</th>
            });
        });
        return(
        <Table responsive>
            <thead>
            {renderHead()}
            </thead>
            <tbody>
            {renderRows()}
            </tbody>
        </Table>
        );
    }
}
