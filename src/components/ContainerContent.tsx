import * as React from 'react';
import * as ReactDom from 'react-dom';

export class ContainerContent extends React.Component<any, any> {
    constructor(props : any){
        super(props);
    }
    render() {
        return (
           <div className ="containers-tab-content">
               {this.props.currentTab === 0 ?
               <div className ="importing-course-schedule">
                            HI I AM CONTENT 0
               </div>
                   : null
               }
               {this.props.currentTab === 1 ?
                   <div className ="importing-course-schedule">
                       HI I AM CONTENT 1
                   </div>
                   : null
               }
               {this.props.currentTab === 2 ?
                   <div className ="importing-course-schedule">
                       HI I AM CONTENT 2
                   </div>
                   : null
               }
           </div>
        );
    }
}