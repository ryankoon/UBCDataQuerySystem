import {IObject} from "./IObject";
import {IRoom} from "./IBuilding";
import {ISubCourse} from "./CourseDataController";
/**
 * Created by Ryan on 2016-11-28.
 */

export default class ScheduleUtility {

    /**
     * remove courses that do not have valid dept, courseid, size
     * remove rooms without seats defined
     * collapse courses by dept and course id
     * generate minimum courses to schedule according to sectionsToSchedule
     * @param courses
     * @param rooms
     */
    public generateScheduleCoursesRooms(courses: ISubCourse[], rooms: IRoom[]): IObject {
        let processedCourses = this.validateCourses(courses);
        let processedRooms = this.validateRooms(rooms);

        let sectionsToSchedule = this.generateScheduleCourses(courses);

        return {"sectionsToSchedule": sectionsToSchedule, "roomsToSchedule": processedRooms};
    }

    /*
    Remove invalid courses and collapse into one section
     */
    public validateCourses (courses: IObject[]): IObject[] {
        let results: IObject[];

        return results;
    }

    /*
    Remove rooms without seats
     */
    public validateRooms (courses: IRoom[]): IRoom[] {
        let results: IRoom[];

        return results;
    }

    /*
    Create course objects according to sectionsTo schedule
     */
    public generateScheduleCourses (courses: IObject[]): IObject[] {
        let results: IObject[];

        return results;
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
                    jsonObj["courses"].for((courseid: string) => {
                        let courseIdNum = parseInt(courseid);
                        if (!isNaN(courseIdNum) && subcourse.id === courseIdNum) {
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
                            let roomsInBuilding: IRoom[] = roomDataset[buildingCode];
                            roomsInBuilding.some((room: IRoom): boolean => {
                                if (room.name === roomName) {
                                    requestedRooms.push(room);
                                    return true;
                                }
                            });
                        }
                    }
                })
            }
        } catch (err) {

        }
        return results;
    }
}