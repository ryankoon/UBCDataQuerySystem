import {IObject} from "./IObject";
import Log from "../Util";
import {IRoom} from "./IBuilding";
import {ISubCourse} from "./CourseDataController";
import ExplorerController from "./ExplorerController";
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
    MWF: DAYMWF;
    TTH: DAYTTH;
}

export interface DAYMWF {
    800: IObject;
    900: IObject;
    1000: IObject;
    1100: IObject;
    1200: IObject;
    1300: IObject;
    1400: IObject;
    1500: IObject;
    1600: IObject;
    1700: IObject;
}

export interface DAYTTH {
    800: IObject;
    930: IObject;
    1100: IObject;
    1230: IObject;
    1400: IObject;
    1530: IObject;
    1700: IObject;
}

export interface ScheduleResult {
    newSchedule: CampusSchedule;
    newTimetable: CampusTimetable;
    newRoomsBookedTimes: RoomsBookedTimes;
    cost: number;
}

/**
 * IObject: key - course dept and id, value - array of times (e.g ["800", " "1530"]
 * This represents all the times of the scheduled courses across rooms
 * Used to check for concurrent sections
 */
export interface CampusTimetable {
    MWF: IObject;
    TTH: IObject;
}
/**
 * IObject: key - room name, value - Object of times (e.g {"800": "booked", "900": "open",...})
 * This represents all the times that are booked for the room
 * Used to check for concurrent sections
 */
export interface RoomsBookedTimes {
    MWF: IObject;
    TTH: IObject;
}

export interface RoomAvailability {
    MWF: string[];
    TTH: string[];
}

export default class ScheduleController {

    private sections: ISubCourse[];
    private rooms: IRoom[];
    private allSchedules: CampusSchedule[];
    private static MWFTimes: string[] = ["800", "900", "1000", "1100", "1200", "1300", "1400", "1500", "1600", "1700"];
    private static TTHTimes: string[] = ["800", "930", "1100", "1230", "1400", "1530", "1700"];


    constructor() {
        this.sections = [];
        this.rooms = [];
        this.allSchedules = [];
    }

    /**
     * Inputs should be validated already (i.e. required number of sections to schedule)
     * @param courseSections
     * @param rooms
     * @returns {IObject}
     */
    public findBestSchedule(courseSections: ISubCourse[], rooms: IRoom[]): IObject {
        let result: IObject = {};

        if (this.sections && this.sections.length > 0 && this.rooms && this.rooms.length > 0) {

        // 1. Find all possible schedules.
            let blankCampusSchedule = this.createblankCampusSchedule();
            let blankCampusTimetable = this.createblankCampusTimetable();
            let blankRoomsBookedTimes = this.createblankRoomsBookedTimes();
            this.findAllSchedulesRecursively(this.sections, 0, this.rooms, blankCampusSchedule, blankCampusTimetable,
                blankRoomsBookedTimes, 0);

            if (this.allSchedules.length > 0) {

        // 2. Get the best schedule
                let bestSchedule: CampusSchedule = this.getBestSchedule(this.allSchedules);

        // 3. Calculate the quality
                let quality = this.calculateQuality(bestSchedule, this.sections.length);
                result = {"BestSchedule": bestSchedule, "Quality": quality}
            } else {
                Log.error("No schedules were found!");
            }
        }

        return result;
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

    public createblankRoomsBookedTimes(): RoomsBookedTimes {
        return{
            "MWF": {},
            "TTH": {}
        }
    }

    public updateScheduleTimetableRoomBookings(schedule: CampusSchedule, campusTimeTable: CampusTimetable,
                                               roomsTimeTable: RoomsBookedTimes, section: ISubCourse, room: IRoom,
                                               day: string, time: string, cost: number): ScheduleResult {
        let scheduleResult: ScheduleResult;
        let updatedCampusSchedule =  this.addSectionSchedule(schedule, section, room, day, time);
        let updatedCampusTimetable = this.addCourseToCampusTimetable(campusTimeTable, section, day, time);
        let updatedRoomsTimetables =  this.addTimeToRoomsBookings(roomsTimeTable, day, time);

        if (updatedCampusSchedule && updatedCampusTimetable && updatedRoomsTimetables) {
            scheduleResult = {
                newSchedule: updatedCampusSchedule,
                newTimetable: updatedCampusTimetable,
                newRoomsBookedTimes: updatedRoomsTimetables,
                cost: cost
            };

            return scheduleResult;
        } else {

        }
    }

    public addSectionSchedule(schedule: CampusSchedule, section: ISubCourse, room: IRoom, day: string, time: string): CampusSchedule {
        let result: CampusSchedule = schedule;
        //TODO
        return result;
    }

    public addCourseToCampusTimetable(timeTable: CampusTimetable, section: ISubCourse, day: string, time: string): CampusTimetable {
        let result: CampusTimetable = timeTable;
        //TODO
        return result;
    }

    public addTimeToRoomsBookings(timeTable: RoomsBookedTimes, day: string, time: string): RoomsBookedTimes {

    }

    public getSchedulingCost(section: ISubCourse, room: IRoom, time: string, schedule: CampusSchedule,
                             timetable: CampusTimetable): number {
        let cost = -1;
        //TODO

        return cost;
    }

    public findAvailableRoomTimeslots(room: IRoom, roomsBookedTimes: RoomsBookedTimes): RoomAvailability {
        let roomAvailability: RoomAvailability = {
            "MWF": [],
            "TTH": []
        };

        if (room && roomsBookedTimes) {
            let MWFBooked = roomsBookedTimes.MWF;
            let TTHBooked = roomsBookedTimes.TTH;
            let roomName = room.name;

            let roomBookedMWF: IObject = MWFBooked[roomName];
            let roomBookedTTH: IObject = TTHBooked[roomName];

            let availableMWF: string[] = [];
            ScheduleController.MWFTimes.forEach(mwfTime => {
               if (roomBookedMWF === null || roomBookedMWF[mwfTime] === null || roomBookedMWF[mwfTime] === "open") {
                   availableMWF.push(mwfTime);
               }
            });

            let availableTTH: string[] = [];
            ScheduleController.TTHTimes.forEach(tthTime => {
                if (roomBookedTTH === null || roomBookedTTH[tthTime] === null || roomBookedTTH[tthTime] === "open") {
                    availableTTH.push(tthTime);
                }
            });

            roomAvailability.MWF = availableMWF;
            roomAvailability.TTH = availableTTH;
        } else {
            Log.error("Room or roomsbookedtimes is null!");
        }
        return roomAvailability;
    }

    /**
     * Schedule course at the next available timeslot at the least cost room
     * Returns the updated schedule and timetable with the cost of scheduling
     * Cost - cannot be scheduled = -1,  scheduled = number >= 0
     * @param section
     * @param room
     */
    public scheduleSection(section: ISubCourse, rooms: IRoom[], schedule: CampusSchedule,
                           timetable: CampusTimetable, roomsBookedTimes: RoomsBookedTimes): ScheduleResult {
        let result: ScheduleResult;
        let overallCost: number = -1;
        let bestRoom: IRoom;
        let bestDay: string;
        let bestTime: string;

        rooms.some(room => {
            let roomAvailability: RoomAvailability = this.findAvailableRoomTimeslots(room, roomsBookedTimes);
            //Find the next available timeslot, does not have to be adjacent to last scheduled course
            roomAvailability.MWF.some(mwfTime => {
                let cost = this.getSchedulingCost(section, room, mwfTime, schedule, timetable);
                if (overallCost === -1 || overallCost > cost) {
                    overallCost = cost;
                    bestRoom = room;
                    bestDay = "MWF";
                    bestTime = mwfTime;
                }
                if (overallCost === 0) {
                    // stop searching if section can the room without any empty seat at an available time
                    return true;
                }
            });

            roomAvailability.TTH.some(tthTime => {
                let cost = this.getSchedulingCost(section, room, tthTime, schedule, timetable);
                if (overallCost === -1 || overallCost > cost) {
                    overallCost = cost;
                    bestRoom = room;
                    bestDay = "TTH";
                    bestTime = tthTime;
                }
                if (overallCost === 0) {
                    // stop searching if section can the room without any empty seat at an available time
                    return true;
                }
            });

            if (overallCost === 0) {
                return true;
            }
        })

        if (overallCost !== -1 && bestRoom && bestDay && bestTime) {
            result = this.updateScheduleTimetableRoomBookings(schedule, timetable, roomsBookedTimes, section, bestRoom,
                bestDay, bestTime, overallCost)
        } else if (overallCost === -1) {
            // should not have changed
            return result;
        } else {
            Log.error("Error with scheduling a section!");
            return result;
        }
    }

    /**
     * Recursively find all possible schedules and save to global variable allSchedules
     * @param sections
     * @param currIndex
     * @param rooms
     * @param schedule
     * @param campusTimetable
     * @returns {number}
     */
    public findAllSchedulesRecursively(sections: ISubCourse[], currIndex: number, rooms: IRoom[], schedule: CampusSchedule,
                                       campusTimetable: CampusTimetable, roomsBookedTimes: RoomsBookedTimes,
                                       accumulatedCost: number): number {
        if (currIndex > sections.length) {
            this.allSchedules.push(schedule);
            return accumulatedCost;
        } else {
           let scheduleResult = this.scheduleSection(sections[currIndex], rooms, schedule, campusTimetable, roomsBookedTimes);
           if (scheduleResult) {
               if (scheduleResult.cost === -1) {
                   return this.findAllSchedulesRecursively(sections, currIndex + 1, rooms, schedule, campusTimetable,
                       roomsBookedTimes, accumulatedCost);
               } else {
                   let newSchedule = scheduleResult.newSchedule;
                   let newTimetable = scheduleResult.newTimetable;
                   let newRoomsBookedTimes = scheduleResult.newRoomsBookedTimes;
                   let cost = scheduleResult.cost;
                   return Math.min(
                       this.findAllSchedulesRecursively(sections, currIndex + 1, rooms, schedule,
                       campusTimetable, roomsBookedTimes, accumulatedCost),
                       this.findAllSchedulesRecursively(sections, currIndex + 1, rooms, newSchedule,
                       newTimetable, newRoomsBookedTimes, accumulatedCost + cost)
                   );
               }
           }
        }
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
