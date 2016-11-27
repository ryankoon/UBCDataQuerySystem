import {Datasets, default as DatasetController} from "./DatasetController";
import {IObject} from "./IObject";
import Log from "../Util";
/**
 * Created by Ryan on 11/26/2016.
 */

export default class CourseDataController {

    /**
     * Give the course dataset name,
     * generate new dataset for course scheduling and save to disk
     * returns the response code of saving the new dataset to disk
     * @param datasetName
     */
    public processCourseDataset(datasetName: string): Promise<number> {
        return new Promise((resolve, reject) => {
            let datasetController = new DatasetController;
            let newDataset: IObject;
            datasetController.getDataset(datasetName)
                .then((coursesDataset) => {
                    newDataset = this.generateNewCourseDataset(coursesDataset);
                    return datasetController.save("subcourses", newDataset);
                })
                .then(result => {
                    resolve(newDataset);
                })
                .catch(err => {
                    reject("Error processing course dataset: " + err);
                });
        });
    }

    public generateNewCourseDataset(coursesDataset: IObject) {
        let newDataset: IObject = {};

        if (coursesDataset) {
            let courses = Object.keys(coursesDataset);

            // loop through all course departments
            courses.forEach((course) => {
                if (coursesDataset[course]) {
                    let courseResults = coursesDataset[course]["result"];

                    // skip courses with no history of sections
                    if (courseResults && courseResults.length > 0) {
                        let latestSections = this.getSectionsInLatestYear(courseResults);
                        let transformedResults = this.transformCourseResults(latestSections);
                        // add to new dataset
                        if (transformedResults.length > 0) {
                            let resultObject = {"result": transformedResults}
                            newDataset[course] = resultObject;
                        }
                    }
                }
            });
        }
        return newDataset;
    }

    /**
     * Takes an array of course results
     * Returns sections in the latest year, and is not an "overall" section
     * @param courseResults
     */
    public getSectionsInLatestYear(courseResults: IObject[]): IObject[] {
        let latestSections: IObject[] = [];
        let nonOverallSections: IObject[] = [];
        let years: number[] = [];

        courseResults.forEach(result => {
            if (result["Section"] !== "overall" && result["Year"]) {
                let resultYear = result["Year"];
                if (!isNaN(resultYear)) {
                    resultYear = parseInt(resultYear, 10);
                    years.push(resultYear);
                    nonOverallSections.push(result);
                }
            }
        });

        if (years.length > 0) {
            let latestYear = Math.max.apply(null, years);

            nonOverallSections.forEach(result => {
                let resultYear = result["Year"];
                if (!isNaN(resultYear)) {
                    resultYear = parseInt(resultYear, 10);
                }
                if (resultYear === latestYear) {
                    latestSections.push(result);
                }
            });
        }

        return latestSections;
    }

    /**
     * Given the course results of a course, determine size of the largest section
     * Add size field to each result - size of largest section
     * Add sections to schedule to each result ceiling[size/3]
     * @param courseResults
     */
    public transformCourseResults(courseResults: IObject[]): IObject[] {
        let transformedSections: IObject[] = [];
        let sectionSizes: number[] = [];
        let tempSections: IObject[] = [];

        if (courseResults && courseResults.length > 0) {
            // set size of course
            courseResults.forEach(result => {
                let newCourseResult: IObject = result;
                let sectionSize: number;

                let pass = result["Pass"];
                let fail = result["Fail"];

                if (pass !== null && fail !== null) {
                    sectionSize = pass + fail;
                    result["SectionSize"] = sectionSize;
                    tempSections.push(result);

                    sectionSizes.push(sectionSize);
                } else {
                    Log.error("Pass or fail is not a valid value!");
                }
            });

            //determine max section size
            let maxSize = Math.max.apply(null, sectionSizes);
            let sectionsToSchedule = Math.ceil(courseResults.length / 3)

            tempSections.forEach(tempSection => {
                tempSection["Size"] = maxSize;
                tempSection["SectionsToSchedule"] = sectionsToSchedule;
                transformedSections.push(tempSection);
            });
        }
        return transformedSections;
    }
}
