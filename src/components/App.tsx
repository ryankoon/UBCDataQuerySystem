import * as React from 'react';
import * as ReactDom from 'react-dom';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import {AjaxRoomDropDown} from './AjaxRoomDropDown';
import {RoomForm} from './RoomForm';
export class App extends React.Component<any, any> {
    handleSelect(index: any, last: any) {
        console.log('Selected tab: ' + index + ', Last tab: ' + last);
    }
    render() {
        return (
            <div>
                <h1>Course Scheduling System!!!!!</h1>
                <Tabs>
                    <TabList>
                        <Tab>Course Explorer</Tab>
                        <Tab>Room Explorer</Tab>
                        <Tab>Course Scheduler</Tab>
                    </TabList>
                    <TabPanel>
                        <h2>Explore your potential courses!</h2>
                        <h2>Here is the course module endpoint dropdown thingy </h2>
                    </TabPanel>
                    <TabPanel>
                        <h2>Explore your potential rooms!</h2>
                        <AjaxRoomDropDown compiler="TypeScript" framework="React"/>
                        <RoomForm handle compiler="TypeScript" framework="React"/>
                        <p>Here is your potential rooms to choose from!!!</p>
                    </TabPanel>
                    <TabPanel>
                        <h2> Course Scheduler....</h2>
                    </TabPanel>
                </Tabs>
            </div>
        );
    }
}
// Probably what I need to do... is to pass down a handler function to AjaxRoomDropDown
// NEed to pass the result of that to roomform?
// or.... I need to use jquery and do some updating schenan