import {ISubCourse} from "../src/controller/CourseDataController";
import {IRoom} from "../src/controller/IBuilding";
import ScheduleUtility from "../src/controller/ScheduleUtilty";
import {expect} from 'chai';
/**
 * Created by Ryan on 2016-12-01.
 */

describe('ScheduleUtility', function () {

    it ("Should generate schedulecoursesRooms object", () => {
        let controller: ScheduleUtility = new ScheduleUtility();
        let courses: ISubCourse[] = [
            { "tier_eighty_five": 19, "tier_ninety": 41, "Title": "comptn, progrmng", "Section": "101", "Detail": "", "tier_seventy_two": 20, "Other": 7, "Low": 14, "tier_sixty_four": 17, "id": 7882, "tier_sixty_eight": 17, "tier_zero": 0, "tier_seventy_six": 27, "tier_thirty": 7, "tier_fifty": 3, "Professor": "kiczales, gregor", "Audit": 0, "tier_g_fifty": 38, "tier_forty": 21, "Withdrew": 19, "Year": "2014", "tier_twenty": 6, "Stddev": 19.39, "Enrolled": 245, "tier_fifty_five": 5, "tier_eighty": 21, "tier_sixty": 10, "tier_ten": 4, "High": 100, "Course": "110", "Session": "w", "Pass": 180, "Fail": 38, "Avg": 71.07, "Campus": "ubc", "Subject": "cpsc", "SectionSize": 218, "Size": 218, "SectionsToSchedule": 3 }
            ];
        let resultcourses: ISubCourse[] = [
            { "tier_eighty_five": 19, "tier_ninety": 41, "Title": "comptn, progrmng", "Section": "101", "Detail": "Section0", "tier_seventy_two": 20, "Other": 7, "Low": 14, "tier_sixty_four": 17, "id": 7882, "tier_sixty_eight": 17, "tier_zero": 0, "tier_seventy_six": 27, "tier_thirty": 7, "tier_fifty": 3, "Professor": "kiczales, gregor", "Audit": 0, "tier_g_fifty": 38, "tier_forty": 21, "Withdrew": 19, "Year": "2014", "tier_twenty": 6, "Stddev": 19.39, "Enrolled": 245, "tier_fifty_five": 5, "tier_eighty": 21, "tier_sixty": 10, "tier_ten": 4, "High": 100, "Course": "110", "Session": "w", "Pass": 180, "Fail": 38, "Avg": 71.07, "Campus": "ubc", "Subject": "cpsc", "SectionSize": 218, "Size": 218, "SectionsToSchedule": 3 },
            { "tier_eighty_five": 19, "tier_ninety": 41, "Title": "comptn, progrmng", "Section": "101", "Detail": "Section1", "tier_seventy_two": 20, "Other": 7, "Low": 14, "tier_sixty_four": 17, "id": 7882, "tier_sixty_eight": 17, "tier_zero": 0, "tier_seventy_six": 27, "tier_thirty": 7, "tier_fifty": 3, "Professor": "kiczales, gregor", "Audit": 0, "tier_g_fifty": 38, "tier_forty": 21, "Withdrew": 19, "Year": "2014", "tier_twenty": 6, "Stddev": 19.39, "Enrolled": 245, "tier_fifty_five": 5, "tier_eighty": 21, "tier_sixty": 10, "tier_ten": 4, "High": 100, "Course": "110", "Session": "w", "Pass": 180, "Fail": 38, "Avg": 71.07, "Campus": "ubc", "Subject": "cpsc", "SectionSize": 218, "Size": 218, "SectionsToSchedule": 3 },
            { "tier_eighty_five": 19, "tier_ninety": 41, "Title": "comptn, progrmng", "Section": "101", "Detail": "Section2", "tier_seventy_two": 20, "Other": 7, "Low": 14, "tier_sixty_four": 17, "id": 7882, "tier_sixty_eight": 17, "tier_zero": 0, "tier_seventy_six": 27, "tier_thirty": 7, "tier_fifty": 3, "Professor": "kiczales, gregor", "Audit": 0, "tier_g_fifty": 38, "tier_forty": 21, "Withdrew": 19, "Year": "2014", "tier_twenty": 6, "Stddev": 19.39, "Enrolled": 245, "tier_fifty_five": 5, "tier_eighty": 21, "tier_sixty": 10, "tier_ten": 4, "High": 100, "Course": "110", "Session": "w", "Pass": 180, "Fail": 38, "Avg": 71.07, "Campus": "ubc", "Subject": "cpsc", "SectionSize": 218, "Size": 218, "SectionsToSchedule": 3 }
        ];
        let rooms: IRoom[] = [
            { "fullname": "Buchanan", "shortname": "BUCH", "number": "A103", "name": "BUCH_A103", "address": "1866 Main Mall", "lat": 49.26826, "lon": -123.25468, "seats": 131, "type": "Tiered Large Group", "furniture": "Classroom-Fixed Tablets", "href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-A103" }
            ];

        let result = controller.generateScheduleCoursesRooms(courses, rooms);
        expect(result).to.deep.equal({"sectionsToSchedule": resultcourses, "roomsToSchedule": rooms});
    });
});
