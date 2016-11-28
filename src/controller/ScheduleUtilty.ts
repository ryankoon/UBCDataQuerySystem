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
    public getCoursesRooms(queryBody: any, coursesDataset: ISubCourse[], roomDataset: IRoom[]) : IObject {
        let results: IObject;

        return results;
    }

}