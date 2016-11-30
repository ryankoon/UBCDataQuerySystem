import {IObject} from "./IObject";
import {IRoom} from "./IBuilding";
import {ISubCourse} from "./CourseDataController";
import {CampusSchedule, RoomSchedules, TimeTable, DAYMWF, DAYTTH} from "./ScheduleController";
import Log from "../Util";
/**
 * Created by Ryan on 2016-11-28.
 */

export interface ISmallSubCourse {
    Id: number;
    Day: string;
    Time: string;
    CourseDept: string;
    CourseId: string;
    RoomName: string;
    CourseSize: number;
}

export default class ScheduleUtility {

    private idCount = 0;

    /**
     * remove courses that do not have valid dept, courseid, size
     * remove rooms without seats defined
     * collapse courses by dept and course id
     * generate minimum courses to schedule according to sectionsToSchedule
     * @param courses
     * @param rooms
     */
    public generateScheduleCoursesRooms(courses: ISubCourse[], rooms: IRoom[]): IObject {

        let sectionsToSchedule: ISubCourse[] = this.generateScheduleCourses(courses);

        return {"sectionsToSchedule": sectionsToSchedule, "roomsToSchedule": rooms};
    }

    /*
    Remove invalid courses and collapse into one section
     */
    public validCourse (course: ISubCourse): boolean {

        return (course.Subject && course.Subject.length > 0
            && course.Course && course.Course.length > 0
            && course.Size && course.Size > 0
            && course.SectionsToSchedule && course.SectionsToSchedule > 0);
    }

    /*
    Remove rooms without seats
     */
    public validRoom (room: IRoom): boolean {
        return (room.name && room.name.length > 0
            && room.seats && room.seats > 0);
    }

    /*
    Create course objects according to sectionsTo schedule
     */
    public generateScheduleCourses (courses: ISubCourse[]): ISubCourse[] {
        let result: ISubCourse[] = [];
        let uniqueCourses: IObject = {};

        // collapse courses into one instance
        courses.forEach((course: ISubCourse) => {
            let hash = course.Subject + course.Course;
            if (uniqueCourses[hash] === undefined) {
                uniqueCourses[hash] = course;
            }
        });

        // recreate based on sectionsToSchedule field
        let uniqueCoursesKeys = Object.keys(uniqueCourses);
        uniqueCoursesKeys.forEach((courseKey: string) => {
            let courseSection: ISubCourse = uniqueCourses[courseKey];
            let sectionsToSchedule: number = courseSection.SectionsToSchedule;
            for(let i = 0; i < sectionsToSchedule; i++) {
                let newSectionObject: ISubCourse = (JSON.parse(JSON.stringify(courseSection)));
                newSectionObject.Detail = "Section" + i;
                result.push(newSectionObject);
            }
        });

        return result;
    }

    /*
    gets courses by uuids in queryBody - key: 'courses'
    gets rooms by name in queryBody - key: 'rooms'
     */
    public getCoursesRooms(queryBody: any, coursesDataset: any, roomDataset: any) : IObject {
        let results: IObject = {"courses": [], "rooms": []};

        try {
            let allSubcourses: ISubCourse[] = [];
            let courseKeys: string[] = Object.keys(coursesDataset);

            // Put all subcourses into an array
            courseKeys.forEach((key: string) => {
                let courseResults: ISubCourse[] = coursesDataset[key]["result"];
                allSubcourses = allSubcourses.concat(courseResults);
            });

            let requestedCourses: ISubCourse[] = [];
            let jsonObj = JSON.parse(queryBody);

            //Find the ones requested
            if (jsonObj["courses"]) {
                allSubcourses.forEach(subcourse => {
                    jsonObj["courses"].forEach((courseid: string) => {
                        let courseIdNum = parseInt(courseid);
                        if (!isNaN(courseIdNum) && subcourse.id === courseIdNum && this.validCourse(subcourse)) {
                            requestedCourses.push(subcourse);
                        }
                    });
                });
            }

            // Get rooms requested
            let requestedRooms: IRoom[] = [];
            let roomsNames: string[] = jsonObj["rooms"];
            if (roomsNames) {
                roomsNames.forEach((roomName: string) => {
                    if (roomName.indexOf("_") !== -1) {
                        let buildingCode: string = roomName.split("_")[0];

                        if (roomDataset[buildingCode]) {
                            let roomsInBuilding: IRoom[] = roomDataset[buildingCode]["result"];
                            roomsInBuilding.some(room => {
                                if (room.name === roomName && this.validRoom(room)) {
                                    requestedRooms.push(room);
                                    return true;
                                }
                            });
                        }
                    }
                })
            }
            results["courses"] = requestedCourses;
            results["rooms"] = requestedRooms;
            return results;
        } catch (err) {
            Log.error("Error getting CourseRooms!");
            return results;
        }
    }

    /**
     * Transform best schedule into a format that can easily display in a table
     * @param roomSchedules
     */
    public transformRoomSchedules (roomSchedules: RoomSchedules): IObject[] {
        let transformedSchedule: IObject[] = [];

        if (roomSchedules && roomSchedules !== undefined) {
            let roomNames = Object.keys(roomSchedules);

            roomNames.forEach((roomName: string) => {
                let roomTimetable: TimeTable = roomSchedules[roomName];

                let MWFTimetable: DAYMWF = roomTimetable.MWF;
                let TTHTimetable: DAYTTH = roomTimetable.TTH;

                let MWFScheduledTimes = Object.keys(MWFTimetable);
                let TTHScheduledTimes = Object.keys(TTHTimetable);

                MWFScheduledTimes.forEach(mwfTime => {
                    let courseSection: ISubCourse = MWFTimetable[mwfTime];
                    if (courseSection && courseSection !== undefined) {
                        let transformedSubCourse: IObject = this.transformSubCourse(courseSection,
                            "MWF", mwfTime, roomName);
                        if (Object.keys(transformedSubCourse) && Object.keys(transformedSubCourse).length > 0){
                            transformedSchedule.push(transformedSubCourse);
                        }

                    }
                });

                TTHScheduledTimes.forEach(tthTime => {
                    let courseSection: ISubCourse = TTHTimetable[tthTime];
                    if (courseSection && courseSection !== undefined) {
                        let transformedSubCourse: IObject = this.transformSubCourse(courseSection,
                            "TTH", tthTime, roomName);
                        if (Object.keys(transformedSubCourse) && Object.keys(transformedSubCourse).length > 0){
                            transformedSchedule.push(transformedSubCourse);
                        }
                    }
                });

            });
        }

        return transformedSchedule;
    }

    // return a subset of fields in ISubCourse
    public transformSubCourse(subcourse: ISubCourse, day: string, time: string, roomname: string): ISmallSubCourse {
        let transformedSubcourse: ISmallSubCourse;

        if (subcourse && subcourse !== undefined && Object.keys(subcourse) && Object.keys(subcourse).length > 0) {
            let id = this.idCount;
            let coursedept = subcourse.Subject.toUpperCase();
            let courseid = subcourse.Course;
            let coursesize = subcourse.Size;

            transformedSubcourse = {
                Id: id,
                Day: day,
                Time: time,
                CourseDept: coursedept,
                CourseId: courseid,
                RoomName: roomname,
                CourseSize: coursesize
            }

            this.idCount += 1;
        }

        return transformedSubcourse;
    }

}