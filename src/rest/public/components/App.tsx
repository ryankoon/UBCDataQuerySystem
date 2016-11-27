import * as React from 'react';
import * as ReactDom from 'react-dom';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import {RoomExplorer} from './RoomExplorer';
import {CourseExplorer} from './CourseExplorer';
import {CourseScheduler} from "./CourseScheduler";
export class App extends React.Component<any, any> {
    handleSelect(index: any, last: any) {
        console.log('Selected tab: ' + index + ', Last tab: ' + last);
    }
    render() {
        return (
            <div>
                <h1>UBC Data Query System</h1>
                <Tabs>
                    <TabList>
                        <Tab>Course Explorer</Tab>
                        <Tab>Room Explorer</Tab>
                        <Tab>Course Scheduler</Tab>
                    </TabList>
                    <TabPanel>
                       <CourseExplorer compiler="TypeScript" framework="React" />
                    </TabPanel>
                    <TabPanel>
                        <RoomExplorer compiler="TypeScript" framework="React"/>
                    </TabPanel>
                    <TabPanel>
                        <CourseScheduler compiler="TypeScript" framework="React" />
                    </TabPanel>
                </Tabs>
            </div>
        );
    }
}
// Probably what I need to do... is to pass down a handler function to AjaxRoomDropDown
// NEed to pass the result of that to roomform?
// or.... I need to use jquery and do some updating schenan