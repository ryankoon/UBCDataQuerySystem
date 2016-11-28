import {IObject} from "./IBuilding";
import {IObject} from "./IObject";
import Log from "../Util";
/**
 * Created by Ryan on 11/27/2016.
 */

export interface CampusSchedule {
    scheduledSections: number;
    cost: number;
    roomSchedules: RoomSchedules;
}

export interface RoomSchedules {
    [index: string]: TimeTable; //unique id of a room
}

export interface TimeTable {
    "MWF": DAYMWF;
    "TTH": DAYTTH;
}

export interface DAYMWF {
    "800": IObject;
    "900": IObject;
    "1000": IObject;
    "1100": IObject;
    "1200": IObject;
    "1300": IObject;
    "1400": IObject;
    "1500": IObject;
    "1600": IObject;
    "1700": IObject;
}

export interface DAYTTH {
    "800": IObject;
    "930": IObject;
    "1100": IObject;
    "1230": IObject;
    "1400": IObject;
    "1530": IObject;
    "1700": IObject;
}

export interface ScheduleResult {
    "newSchedule": CampusSchedule;
    "newTimetable": CampusTimetable;
    "Cost": number;
}

/**
 * IObject: key - course dept and id, value - array of times (e.g ["800", " "1530"]
 * This represents all the times of the scheduled courses across rooms
 * Used to check for concurrent sections
 */
export interface CampusTimetable {
    "MWF": IObject;
    "TTH": IObject;
}

export default class ScheduleController {

    private sections: IObject[];
    private rooms: IObject[];
    private allSchedules: CampusSchedule[];


    constructor() {
        this.sections = [];
        this.rooms = [];
        this.allSchedules = [];
    }

    public findBestSchedule(courseSections: IObject[], rooms: IObject[]): IObject {
        let result: IObject = {};

        // 1. Process Inputs
        this.sections = this.processSections(courseSections);
        this.rooms = this.processRooms(rooms);

        if (this.sections && this.sections.length > 0 && this.rooms && this.rooms.length > 0) {

        // 2. Find all possible schedules.
            let blankCampusSchedule = this.createblankCampusSchedule();
            let blankCampusTimetable = this.createblankCampusTimetable();
            this.findAllSchedules(this.sections, 0, this.rooms, blankCampusSchedule, blankCampusTimetable);

            if (this.allSchedules.length > 0) {

        // 3. Get the best schedule
                let bestSchedule: CampusSchedule = this.getBestSchedule(this.allSchedules);

        // 4. Calculate the quality
                let quality = this.calculateQuality(bestSchedule, this.sections.length);
                result = {"BestSchedule": bestSchedule, "Quality": quality}
            } else {
                Log.error("No schedules were found!");
            }
        }

        return result;
    }


    public processSections(sections: IObject[]): IObject[] {
        let results: IObject[] = [];
        //TODO
        //remove invalid rooms

        //generate correct number of sections for each course based on sectionsToSchedule

        return results;
    }

    public processRooms(rooms: IObject[]): IObject[] {
        let results: IObject[] = [];
        //TODO
        //remove invalid rooms

        //generate correct number of room instances for each day (MWF and TH)

        return results;
    }

    public createblankCampusSchedule(): CampusSchedule {
        return {
            scheduledSections: 0,
            cost: 0,
            roomSchedules: null
        };

    }

    public createblankCampusTimetable(): CampusTimetable {
        return {
            "MWF": null,
            "TTH": null
        };
    }

    public addSectionSchedule(schedule: CampusSchedule, section: IObject, day: string, time: string): CampusSchedule {
        let result: CampusSchedule = schedule;
        //TODO
        return result;
    }

    public addCourseToCampusTimetable(timeTable: CampusTimetable, section: IObject, day: string, time: string): CampusTimetable {
        let result: CampusTimetable = timeTable;
        //TODO
        return result;
    }

    public getSchedulingCost(section: IObject, room: IObject, time: string, schedule: CampusSchedule,
                             timetable: CampusTimetable) {
        //TODO
    }

    /**
     * Schedule course at the next available timeslot
     * Returns the updated schedule and timetable with the cost of scheduling
     * Cost - cannot be scheduled = -1,  scheduled = number >= 0
     * @param section
     * @param room
     */
    public scheduleSection(section: IObject, room: IObject, schedule: CampusSchedule,
                           timetable: CampusTimetable): ScheduleResult {
        let result: ScheduleResult;
        //TODO

        //Find the next available timeslot, does not have to be adjacent to last scheduled course

        return result;
    }


    public findAllSchedules(sections: IObject[], currIndex: number, rooms: IObject[], schedule: CampusSchedule,
                            campusTimetable: CampusTimetable): number {
        let result = 0;
        //TODO
        return 0;
    }

    public getBestSchedule(schedules: CampusSchedule[]): CampusSchedule {
        let result: CampusSchedule;
        //TODO
        return result;
    }

    public calculateQuality(schedule: CampusSchedule, requestedSections: number): number {
        let result: number;
        //TODO

       return result;
    }

}
