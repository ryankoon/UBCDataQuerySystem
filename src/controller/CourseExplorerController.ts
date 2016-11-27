import {QueryRequest} from "./QueryController";
/**
 * Created by Ryan on 11/26/2016.
 */

export default class CourseExplorerController {

    public buildQuery(request: string): QueryRequest {
        let courseQuery : QueryRequest =
            {
                "GET": ["subcourses_instructor", "subcourses_dept", "subcourses_uuid", "subcourses_title", "subcourses_Size", "subcourses_SectionsToSchedule", "subcourses_Section"],
                "WHERE": {},
                "AS" : "TABLE"
            };

        return courseQuery;
    }
}