/**
 * Created by Ryan on 11/27/2016.
 */
import Log from "../src/Util";
import {expect} from 'chai';
import ScheduleController from "../src/controller/ScheduleController";

describe("ScheduleController", function () {

    it("Should be able to create a blank Campus Schedule", () => {
        let controller: ScheduleController = new ScheduleController();
        let result = controller.createblankCampusSchedule();
        let expectedResult = {
            "scheduledSections": 0,
            "cost": 0,
            "roomSchedules": {}
        };

        expect(result).to.deep.equal(expectedResult);
    });


    it("Should be able to create a blank Campus Timetable", () => {
        let controller: ScheduleController = new ScheduleController();
        let result = controller.createblankCampusTimetable();

        expect(result["MWF"]).be.undefined;
        expect(result["TTH"]).be.undefined;
        expect(Object.keys(result).length === 2).to.be.true;
    });

    it("Should be able to create a blank RoomsBookedTimes", () => {
        let controller: ScheduleController = new ScheduleController();
        let result = controller.createblankRoomsBookedTimes();
        let expectedResult = {
            "MWF": {},
            "TTH": {}
        };

        expect(result).deep.equal(expectedResult);
    });

    it("Should be able to findBestSchedule", () => {
        let controller: ScheduleController = new ScheduleController();
    });

    it("Should be able to updateScheduleTimetableRoomBookings", () => {
        let controller: ScheduleController = new ScheduleController();
    });

    it("Should be able to addSectionSchedule", () => {
        let controller: ScheduleController = new ScheduleController();
    });

    it("Should be able to addCourseToCampusTimetable", () => {
        let controller: ScheduleController = new ScheduleController();
    });

    it("Should be able to addTimeToRoomsBookings", () => {
        let controller: ScheduleController = new ScheduleController();
    });

    it("Should be able to initializeRoomBookingObject", () => {
        let controller: ScheduleController = new ScheduleController();
    });

    it("Should be able to createTimeSlotsObject", () => {
        let controller: ScheduleController = new ScheduleController();
    });

    it("Should be able to getSchedulingCost", () => {
        let controller: ScheduleController = new ScheduleController();
    });

    it("Should be able to findAvailableRoomTimeslots", () => {
        let controller: ScheduleController = new ScheduleController();
    });

    it("Should be able to scheduleSection", () => {
        let controller: ScheduleController = new ScheduleController();
    });

    it("Should be able to findAllSchedulesRecursively", () => {
        let controller: ScheduleController = new ScheduleController();
    });

    it("Should be able to getBestSchedule", () => {
        let controller: ScheduleController = new ScheduleController();
    });

    it("Should be able to calculateQuality", () => {
        let controller: ScheduleController = new ScheduleController();
    });

});