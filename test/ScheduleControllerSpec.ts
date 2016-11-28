/**
 * Created by Ryan on 11/27/2016.
 */
import Log from "../src/Util";
import {expect} from 'chai';
import ScheduleController from "../src/controller/ScheduleController";
import {CampusSchedule} from "../src/controller/ScheduleController";
import {ISubCourse} from "../src/controller/CourseDataController";
import {CampusTimetable} from "../src/controller/ScheduleController";
import {RoomsBookedTimes} from "../src/controller/ScheduleController";
import {ScheduleResult} from "../src/controller/ScheduleController";
import {IRoom} from "../src/controller/IBuilding";

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
        let expectedResult = {
            "MWF": {},
            "TTH": {}
        };
        expect(result).deep.equal(expectedResult);
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
        let subcourse: ISubCourse = { "tier_eighty_five": 6, "tier_ninety": 4, "Title": "geotech eng prac", "Section": "101", "Detail": "", "tier_seventy_two": 6, "Other": 1, "Low": 30, "tier_sixty_four": 3, "id": 68164, "tier_sixty_eight": 3, "tier_zero": 0, "tier_seventy_six": 7, "tier_thirty": 1, "tier_fifty": 2, "Professor": "eberhardt, erik", "Audit": 0, "tier_g_fifty": 1, "tier_forty": 0, "Withdrew": 0, "Year": "2014", "tier_twenty": 0, "Stddev": 12.76, "Enrolled": 40, "tier_fifty_five": 0, "tier_eighty": 6, "tier_sixty": 1, "tier_ten": 0, "High": 97, "Course": "433", "Session": "w", "Pass": 38, "Fail": 1, "Avg": 76.05, "Campus": "ubc", "Subject": "eosc", "SectionSize": 39, "Size": 39, "SectionsToSchedule": 1 };
        let aroom: IRoom = { "fullname": "Allard Hall (LAW)", "shortname": "ALRD", "number": "105", "name": "ALRD_105", "address": "1822 East Mall", "lat": 49.2699, "lon": -123.25318, "seats": 94, "type": "Case Style", "furniture": "Classroom-Fixed Tables/Movable Chairs", "href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ALRD-105" };
        let result: ScheduleResult;
        let emptyRoomSchedules: CampusSchedule = {
            scheduledSections: 0,
            cost: 0,
            roomSchedules: {}
        };
        let doesNotExist: CampusTimetable = {
            MWF: {},
            TTH: {}
        };
        let dne: RoomsBookedTimes = {
            "MWF": {},
            "TTH": {}
        };
        let expectedResult: ScheduleResult = {
            newSchedule: {scheduledSections: 1,
                cost: 55,
                roomSchedules: {
                    "ALRD_105": {
                        "MWF": {
                            800: undefined,
                            900: undefined,
                            1000: subcourse,
                            1100: undefined,
                            1200: undefined,
                            1300: undefined,
                            1400: undefined,
                            1500: undefined,
                            1600: undefined
                        },
                        "TTH": {
                            800: undefined,
                            930: undefined,
                            1100: undefined,
                            1230: undefined,
                            1400: undefined,
                            1530: undefined
                        }
                    }
                }
            },
            newTimetable: {
                MWF: {
                    68164: ["1000"]
                },
                TTH: {}
            },
            newRoomsBookedTimes: {
                "MWF": {
                    "ALRD_105" : {
                        800: "open",
                        900: "open",
                        1000: "booked",
                        1100: "open",
                        1200: "open",
                        1300: "open",
                        1400: "open",
                        1500: "open",
                        1600: "open"
                    }
                },
                "TTH": {}
            },
            cost: 55
        }
        // all empty initially
        result = controller.updateScheduleTimetableRoomBookings(emptyRoomSchedules, doesNotExist, dne, subcourse, aroom,
            "MWF", "1000", 55)
        expect(result).to.deep.equal(expectedResult);

        // time/room already scheduled
        result = controller.updateScheduleTimetableRoomBookings(expectedResult.newSchedule, expectedResult.newTimetable,
            expectedResult.newRoomsBookedTimes, subcourse, aroom, "MWF", "1000", 55)
        expect(result).to.deep.equal(expectedResult);
    });

    it("Should be able to addSectionToSchedule", () => {
        let controller: ScheduleController = new ScheduleController();
        let result: CampusSchedule;
        let subcourse: ISubCourse = { "tier_eighty_five": 6, "tier_ninety": 4, "Title": "geotech eng prac", "Section": "101", "Detail": "", "tier_seventy_two": 6, "Other": 1, "Low": 30, "tier_sixty_four": 3, "id": 68164, "tier_sixty_eight": 3, "tier_zero": 0, "tier_seventy_six": 7, "tier_thirty": 1, "tier_fifty": 2, "Professor": "eberhardt, erik", "Audit": 0, "tier_g_fifty": 1, "tier_forty": 0, "Withdrew": 0, "Year": "2014", "tier_twenty": 0, "Stddev": 12.76, "Enrolled": 40, "tier_fifty_five": 0, "tier_eighty": 6, "tier_sixty": 1, "tier_ten": 0, "High": 97, "Course": "433", "Session": "w", "Pass": 38, "Fail": 1, "Avg": 76.05, "Campus": "ubc", "Subject": "eosc", "SectionSize": 39, "Size": 39, "SectionsToSchedule": 1 };
        let emptyRoomSchedules: CampusSchedule = {
            scheduledSections: 0,
            cost: 0,
            roomSchedules: {}
        };
        let expectedEmptyRoomSchedules: CampusSchedule = {
            scheduledSections: 1,
            cost: 10,
            roomSchedules: {
                "notfound": {
                    "MWF": {
                        800: undefined,
                        900: undefined,
                        1000: undefined,
                        1100: subcourse,
                        1200: undefined,
                        1300: undefined,
                        1400: undefined,
                        1500: undefined,
                        1600: undefined
                    },
                    "TTH": {
                        800: undefined,
                        930: undefined,
                        1100: undefined,
                        1230: undefined,
                        1400: undefined,
                        1530: undefined
                    }
                }
            }
        };

        let roomExists: CampusSchedule = {
            scheduledSections: 2,
            cost: 1,
            roomSchedules: {
                "room_exists": {
                    "MWF": {
                        800: undefined,
                        900: undefined,
                        1000: {"SomeCourseSection": "asdf"},
                        1100: undefined,
                        1200: undefined,
                        1300: undefined,
                        1400: undefined,
                        1500: undefined,
                        1600: undefined
                    },
                    "TTH": {
                        800: undefined,
                        930: {"SomeCourseSection2": "asdf2"},
                        1100: undefined,
                        1230: undefined,
                        1400: undefined,
                        1530: undefined
                    }
                }
            }
        };

        let expectedroomExists: CampusSchedule = {
            scheduledSections: 3,
            cost: 3,
            roomSchedules: {
                "room_exists": {
                    "MWF": {
                        800: undefined,
                        900: undefined,
                        1000: {"SomeCourseSection": "asdf"},
                        1100: undefined,
                        1200: undefined,
                        1300: undefined,
                        1400: undefined,
                        1500: undefined,
                        1600: undefined
                    },
                    "TTH": {
                        800: undefined,
                        930: {"SomeCourseSection2": "asdf2"},
                        1100: undefined,
                        1230: undefined,
                        1400: undefined,
                        1530: subcourse
                    }
                }
            }
        };

        let errorState: CampusSchedule = {
            scheduledSections: 2,
            cost: 0,
            roomSchedules: {
                "asdf_Room": {
                    "MWF": {
                        800: {"SomeCourseSection": "asdf"},
                        900: {"SomeCourseSection": "asdf"},
                        1000: {"SomeCourseSection": "asdf"},
                        1100: {"SomeCourseSection": "asdf"},
                        1200: {"SomeCourseSection": "asdf"},
                        1300: {"SomeCourseSection": "asdf"},
                        1400: {"SomeCourseSection": "asdf"},
                        1500: {"SomeCourseSection": "asdf"},
                        1600: {"SomeCourseSection": "asdf"}
                    },
                    "TTH": {
                        800: {"SomeCourseSection": "asdf"},
                        930: {"SomeCourseSection2": "asdf2"},
                        1100: {"SomeCourseSection": "asdf"},
                        1230: {"SomeCourseSection": "asdf"},
                        1400: {"SomeCourseSection": "asdf"},
                        1530: {"SomeCourseSection": "asdf"}
                    }
                }
            }
        };

        result = controller.addSectionToSchedule(emptyRoomSchedules, subcourse, "notfound", "MWF", "1100", 10);
        expect(result).to.deep.equal(expectedEmptyRoomSchedules);

        result = controller.addSectionToSchedule(roomExists, subcourse, "room_exists", "TTH", "1530", 2);
        expect(result).to.deep.equal(expectedroomExists);

        result = controller.addSectionToSchedule(errorState, subcourse, "asdf_Room", "TTH", "1530", 2);
        expect(result).to.deep.equal(errorState);
    });

    it("Should be able to addCourseToCampusTimetable", () => {
        let controller: ScheduleController = new ScheduleController();
        let result: CampusTimetable;
        let doesNotExist: CampusTimetable = {
            MWF: {},
            TTH: {}
        };
        let expectedDNE: CampusTimetable = {
            MWF: {
                12345: ["1200"]
            },
            TTH: {}
        };
        let expectedexists: CampusTimetable = {
            MWF: {
                12345: ["1200", "1300"]
            },
            TTH: {}
        }

        result = controller.addCourseToCampusTimetable(doesNotExist, 12345, "MWF", "1200");
        expect(result).to.deep.equal(expectedDNE);

        result = controller.addCourseToCampusTimetable(expectedDNE, 12345, "MWF", "1300");
        expect(result).to.deep.equal(expectedexists);

        result = controller.addCourseToCampusTimetable(expectedexists, 12345, "MWF", "1300");
        expect(result).to.deep.equal(expectedexists);
    });

    it("Should be able to addTimeToRoomsBookings", () => {
        let controller: ScheduleController = new ScheduleController();
        let result: RoomsBookedTimes;
        let dne: RoomsBookedTimes = {
            "MWF": {},
            "TTH": {}
        };

        let expecteddne: RoomsBookedTimes = {
            "MWF": {},
            "TTH": {"asdfroom": {
                800: "booked",
                930: "open",
                1100: "open",
                1230: "open",
                1400: "open",
                1530: "open"
            }}
        };

        let initialized: RoomsBookedTimes = {
            "MWF": {},
            "TTH": {
                "asdfroom": {
                    800: "booked",
                    930: "open",
                    1100: "open",
                    1230: "open",
                    1400: "open",
                    1530: "open"
                },
                "anotherroom": {
                    800: "booked",
                    930: "open",
                    1100: "booked",
                    1230: "open",
                    1400: "open",
                    1530: "booked"
                }
            }
        };

        let expectedinitialized: RoomsBookedTimes = {
            "MWF": {},
            "TTH": {
                "asdfroom": {
                    800: "booked",
                    930: "open",
                    1100: "open",
                    1230: "open",
                    1400: "open",
                    1530: "open"
                },
                "anotherroom": {
                    800: "booked",
                    930: "booked",
                    1100: "booked",
                    1230: "open",
                    1400: "open",
                    1530: "booked"
                }
            }
        };

        let newroom: RoomsBookedTimes = {
            "MWF": {},
            "TTH": {
                "asdfroom": {
                    800: "booked",
                    930: "open",
                    1100: "open",
                    1230: "open",
                    1400: "open",
                    1530: "open"
                },
                "newroom":{
                    800: "open",
                    930: "booked",
                    1100: "open",
                    1230: "open",
                    1400: "open",
                    1530: "open"
                }
            }
        };

        let initMWF: RoomsBookedTimes = {
            "MWF": {
                "mwfroom" : {
                    800: "open",
                    900: "open",
                    1000: "open",
                    1100: "open",
                    1200: "open",
                    1300: "booked",
                    1400: "open",
                    1500: "open",
                    1600: "open"
                }
            },
            "TTH": {
                "asdfroom": {
                    800: "booked",
                    930: "open",
                    1100: "open",
                    1230: "open",
                    1400: "open",
                    1530: "open"
                }
            }
        };

        let expectedMWF: RoomsBookedTimes = {
            "MWF": {
                "mwfroom" : {
                    800: "open",
                    900: "open",
                    1000: "open",
                    1100: "open",
                    1200: "open",
                    1300: "booked",
                    1400: "booked",
                    1500: "open",
                    1600: "open"
                }
            },
            "TTH": {"asdfroom": {
                800: "booked",
                930: "open",
                1100: "open",
                1230: "open",
                1400: "open",
                1530: "open"
            }}
        };

        result = controller.addTimeToRoomsBookings(dne, "asdfroom", "TTH", "800");
        expect(result).to.deep.equal(expecteddne);

        result = controller.addTimeToRoomsBookings(initialized, "anotherroom", "TTH", "930");
        expect(result).to.deep.equal(expectedinitialized);

        //adds new entry
        result = controller.addTimeToRoomsBookings(expectedinitialized, "newroom", "TTH", "930");
        expect(result).to.deep.equal(expectedinitialized);

        result = controller.addTimeToRoomsBookings(expecteddne, "mwfroom", "MWF", "1300");
        expect(result).to.deep.equal(initMWF);

        result = controller.addTimeToRoomsBookings(initMWF, "mwfroom", "MWF", "1400");
        expect(result).to.deep.equal(expectedMWF);

        //error state
        result = controller.addTimeToRoomsBookings(expectedMWF, "mwfroom", "MWF", "1400");
        expect(result).to.deep.equal(expectedMWF);
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