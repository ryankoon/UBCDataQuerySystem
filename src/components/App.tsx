import * as React from 'react';
import * as ReactDom from 'react-dom';
import SingleTab from './SingleTab.tsx';
import {TabsContainer} from "./TabsContainer";
import {ContainerContent} from "./ContainerContent";

//TODO: this should pull together the tab container with the appropriate values.
/*
Setup Tab properties
 */
var tabProperties = [
    {value : 0, name : 'Course Explorer'},
    {value : 1, name : 'Room Explorer'},
    {value : 2, name : 'Course Scheduler'}
    ]

export class App extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            tabProperties: tabProperties,
            tabSelected: 0
        }
    }

    render() {
        return (
            <div>
                <TabsContainer compiler="TypeScript"
                           tabProperties={tabProperties}
                           framework="React"
                 />
                <ContainerContent currentTab={this.state.currentTab} />
            </div>
        );
    }

    swapTab(tabSelected: any) {
        this.setState({currentTab: tabSelected.value});

    }
}