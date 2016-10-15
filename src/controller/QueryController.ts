/**
 * Created by rtholmes on 2016-06-19.
 */
import {Datasets} from "./DatasetController";
import Log from "../Util";
import {IObject} from "./IObject";
import {IMComparison} from "./IEBNF";
import {ISComparison} from "./IEBNF";
import {ILogicComparison} from "./IEBNF";
import {IFilter} from "./IEBNF";

export interface QueryRequest {
    GET: string[];
    WHERE: IFilter;
    ORDER?: string;
    AS: string;
}

export interface QueryResponse {
  render: string;
  result: IObject[];
}

export default class QueryController {
    private datasets: Datasets;

    constructor(datasets?: Datasets) {
        this.datasets = datasets;
    }

    public setDataset(datasets: Datasets) {
        this.datasets = datasets;
    }

    public isValid(query: QueryRequest): boolean | string {
        if (typeof query === 'undefined') {
          return 'Query is undefined!';
        } else if (query === null) {
          return 'Query is null!';
        } else if (Object.keys(query).length === 0) {
          return 'Query is empty!';
        } else if (!query.GET || query.GET.length === 0) {
          return 'Query GET does not have any keys!'
        } else if (query.ORDER && query.ORDER.length > 0) {
          // order key needs to be among the get keys
            // NOTE: GET should not and cannot be empty here based on the previous checks
            let queryGETArray: string[] = query.GET;

            if (queryGETArray.indexOf(query.ORDER) === -1) {
                return 'The key in ORDER does not exist in GET!';
            }
        } else if (!query.WHERE) {
            return "Query WHERE has not been defined!";
        } else if (!query.AS) {
          return "Query AS has not been defined!";
        } else if (query.AS && query.AS !== 'TABLE') {
          return "Query AS must be 'TABLE'!"
        }

        let whereKeys: string[] = Object.keys(query.WHERE);
        if (!whereKeys || whereKeys.length === 0){
            return "Query WHERE does not contain a comparison or negation key!"
        }

        let invalidFilterKey: boolean = true;
        whereKeys.forEach((key: string) => {
            if (key === "AND" || key === "OR" || key === "LT" || key === "GT" || key === "EQ" || key === "IS" || key === "NOT") {
                invalidFilterKey = false;
            }
        });
        if (invalidFilterKey) {
            return "Query WHERE contains an invalid filter key!";
        }

        return true;
    }

    // returns all the querykeys in WHERE
    public getWhereQueryKeys (query: IFilter): string[] {
        let whereQueryKeys: string[] = [];

        let queryObjectKeys: string[] = Object.keys(query);

            queryObjectKeys.forEach((queryObjectKey) => {
                switch (queryObjectKey) {
                    case "AND":
                        // AND must have at least one filter
                        if (!query.AND || query.AND.length === 0) {
                            throw new Error("AND must have at least one filter!");
                        } else {
                            query.AND.forEach((queryFilter) => {
                               whereQueryKeys = whereQueryKeys.concat(this.getWhereQueryKeys(queryFilter));
                            });

                        }
                        break;

                    case "OR":
                        // OR must have at least one filter
                        if (!query.OR || query.OR.length === 0) {
                            throw new Error("OR must have at least one filter!");
                        } else {
                            query.OR.forEach((queryFilter) => {
                                whereQueryKeys = whereQueryKeys.concat(this.getWhereQueryKeys(queryFilter));
                            });
                        }
                        break;

                    case "NOT":
                        // NOT must have at least one filter
                        if (!query.NOT || Object.keys(query.NOT).length !== 1) {
                            throw new Error("NOT must have exactly one filter!");
                        } else {
                            whereQueryKeys = whereQueryKeys.concat(this.getWhereQueryKeys(query.NOT));
                        }
                        break;

                    case "LT":
                        // Comparator must have exactly one key
                        let ltValueType: string;
                        if (query.LT) {
                            ltValueType = typeof (this.getStringIndexKVByNumber(query.LT, 0)["value"]);
                        }

                        if (!query.LT || Object.keys(query.LT).length !== 1) {
                            throw new Error("LT Comparator must have exactly one key!");
                        } else if (ltValueType !== "number") {
                            throw new Error("LT Comparator value must be a number!");
                        } else {
                            whereQueryKeys.push(this.getStringIndexKVByNumber(query.LT, 0)["key"]);
                        }
                        break;

                    case "GT":
                        // Comparator must have exactly one key
                        let gtValueType: string;
                        if (query.GT) {
                            gtValueType = typeof (this.getStringIndexKVByNumber(query.GT, 0)["value"]);
                        }

                        if (!query.GT || Object.keys(query.GT).length !== 1) {
                            throw new Error("GT Comparator must have exactly one key!");
                        } else if (gtValueType !== "number") {
                            throw new Error("GT Comparator value must be a number!");
                        } else {
                            whereQueryKeys.push(this.getStringIndexKVByNumber(query.GT, 0)["key"]);
                        }
                        break;

                    case "EQ":
                        // Comparator must have exactly one key
                        let eqValueType: string;
                        if (query.EQ) {
                            eqValueType = typeof (this.getStringIndexKVByNumber(query.EQ, 0)["value"]);
                        }

                        if (!query.EQ || Object.keys(query.EQ).length !== 1) {
                            throw new Error("EQ Comparator must have exactly one key!");
                        } else if (eqValueType !== "number") {
                            throw new Error("EQ Comparator value must be a number!");
                        } else {
                           whereQueryKeys.push(this.getStringIndexKVByNumber(query.EQ, 0)["key"]);
                        }
                        break;

                    case "IS":
                        // Comparator must have exactly one key
                        let isValueType: string;
                        if (query.IS) {
                            isValueType = typeof (this.getStringIndexKVByNumber(query.IS, 0)["value"]);
                        }

                        if (!query.IS || Object.keys(query.IS).length !== 1) {
                            throw new Error("IS Comparator must have exactly one key!");
                        } else if (isValueType !== "string") {
                            throw new Error("IS Comparator value must be a string!");
                        } else {
                            whereQueryKeys.push(this.getStringIndexKVByNumber(query.IS, 0)["key"]);
                        }
                        break;

                    default:
                        Log.error("Unknown Key while getting WHERE Query Keys!: " + queryObjectKey);
                        break;
                }
            });
        return whereQueryKeys;
    }

    /**
     * Splits the key (refer to EBNF for definition of key) into two parts:
     * 1. DatasetId   2.QueryKey (e.g. Professor)
     * 'courses_id' will be split into 'courses' and 'id'
     *
     * @param key
     */
    public splitKey(key: string): string[] {
      let parts: string[] = [];
      if (key) {
      parts = key.split('_');
      }
      return parts;
    }

    public getDatasetId(key: string) {
      let datasetId: string = '';
      let keyParts: string[] = this.splitKey(key);
      // make sure key is not null
      if (keyParts.length === 2) {
        datasetId = keyParts[0];
      }
      return datasetId;
    }

    // remove the first part of key to get the column name
    // e.g. courses_avg -> avg
    public getQueryKey(key: string) {
      let queryKey: string = '';
      let keyParts: string[] = this.splitKey(key);
      // make sure key is not null
      if (keyParts.length === 2) {
        queryKey = keyParts[1];
      }
      return queryKey;
    }

    public query(query: QueryRequest): QueryResponse {
      Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');
      let isValidQuery: boolean | string = this.isValid(query);
      if (isValidQuery === true) {

        // 1. FILTER
        let courses: string[] = Object.keys(this.getStringIndexKVByNumber(this.datasets, 0)["value"]);
        let allCourseResults: IObject[] = [];
        let filteredResults: IObject[];

        courses.forEach((course) => {
          // combine results of all courses
          let courseResults: IObject;
          courseResults = this.getStringIndexKVByNumber(this.datasets, 0)["value"][course]["result"];
          if (courseResults) {
              allCourseResults = allCourseResults.concat(courseResults);
          }
        });

        filteredResults = this.filterCourseResults(query.WHERE, allCourseResults);

        // 2. ORDER (from A-Z, from 0, 1, 2,...)
        let orderQueryKey: string = this.getQueryKey(query.ORDER);

        //translate queryKey
        orderQueryKey = this.translateKey(orderQueryKey);
        let orderedResults: IObject[] = this.orderResults(filteredResults, orderQueryKey);

        // 3. BUILD
        let finalResults: IObject[] = this.buildResults(orderedResults, query);

        return {render: query.AS, result: finalResults};
      }  else {
        throw new Error(<string> isValidQuery);
      }
    }

    public filterCourseResults(queryFilter: IFilter, allCourseResults: IObject[]): IObject[] {
      // for each courseResult, add to results array if it matches
      // query conditions
      // translatekey as needed
      let queryFilterMatches: IObject[] = [];

      allCourseResults.forEach((courseResult: IObject) => {
        let queryResult: boolean = this.queryACourseResult(queryFilter, courseResult);

        if (queryResult !== null) {
          if(queryResult) {
          // add courseResult to matches collection
          queryFilterMatches.push(courseResult);
          }
        } else {
          throw new Error('No match result returned from queryResult on courseResult!')
        }
      });

      return queryFilterMatches;
    }

    public queryACourseResult(queryFilter: IFilter, courseResult: IObject): boolean {
      // apply query on a result in a Course
      // return true if it matches the query

      let result: boolean = false;
      let queryKeys: string[] = Object.keys(queryFilter);

      queryKeys.forEach((queryKey) => {
        switch(queryKey) {
          case "AND":
          let ANDResult: boolean = true;
          queryFilter.AND.forEach((filter) => {
            ANDResult = ANDResult && this.queryACourseResult(filter, courseResult);
          });
          result = ANDResult;
          break;

          case "OR":
          let ORResult: boolean = false;
          queryFilter.OR.forEach((filter) => {
            ORResult = ORResult || this.queryACourseResult(filter, courseResult);
          });
          result = ORResult;
          break;

          case "NOT":
          result = !this.queryACourseResult(queryFilter.NOT, courseResult);
          break;

          case "LT":
          result = this.numberCompare(queryFilter.LT, "LT", courseResult);
          break;

          case "GT":
          result = this.numberCompare(queryFilter.GT, "GT", courseResult);
          break;

          case "EQ":
          result = this.numberCompare(queryFilter.EQ, "EQ", courseResult);
          break;

          case "IS":
          result = this.stringCompare(queryFilter.IS, "IS", courseResult);
          break;

          default:
          result = false;
          break;
        }
      });
      return result;
    }

    public numberCompare(queryKeyWithDatasetIDAndValue: IMComparison, operation: string, courseResult: IObject): boolean {
      let queryKeyWithDatasetID: string = this.getStringIndexKVByNumber(queryKeyWithDatasetIDAndValue, 0)["key"];

      let queryKey: string = this.getQueryKey(queryKeyWithDatasetID);
      let queryKeyValue: number = this.getStringIndexKVByNumber(queryKeyWithDatasetIDAndValue, 0)["value"];
      // translate querykey to corresponding datasetkey
      let dataKeyValue: number = courseResult[this.translateKey(queryKey)];
      switch(operation) {

        case "LT":
        return dataKeyValue < queryKeyValue;

        case "GT":
        return dataKeyValue > queryKeyValue;

        case "EQ":
        return dataKeyValue === queryKeyValue;

        default:
        return false;
      }
    }

    public stringCompare(queryKeyWithDatasetIDAndValue: ISComparison, operation: string, courseResult: IObject): boolean {
      let queryKeyWithDatasetID: string = this.getStringIndexKVByNumber(queryKeyWithDatasetIDAndValue, 0)["key"];

      let queryKey: string = this.getQueryKey(queryKeyWithDatasetID);
      let queryKeyValue: string = this.getStringIndexKVByNumber(queryKeyWithDatasetIDAndValue, 0)["value"];
      // translate querykey to corresponding datasetkey
      let dataKeyValue: string = courseResult[this.translateKey(queryKey)];
      switch(operation) {

        case "IS":

            if (!queryKeyValue || !dataKeyValue) {
                return false;
            }
            // check for empty strings
            else if ((queryKeyValue.length === 0 && dataKeyValue.length > 0) || (queryKeyValue.length > 0 && dataKeyValue.length === 0)) {
                return false;
            } else if (queryKeyValue === "" && dataKeyValue === "") {
                return true;
            }
            // use wildcard matching if query contains asterisk
            else if (queryKeyValue.indexOf("*") > -1 && this.validStringComparison(queryKeyValue)) {
                return this.wildcardMatching(queryKeyValue, dataKeyValue);
            } else if (queryKeyValue.indexOf("*") === -1) {
                return dataKeyValue === queryKeyValue;
            } else {
                return false;
            }

        default:
        return false;
      }
    }

    public validStringComparison(str: string): boolean {
        // checks if string has an asterisk at the beginning and/or at the end or has no asterisk
        let stringWithoutWildcard = str.split("*").join("");
        let regExpStr: string = "^(\\*)?(" + stringWithoutWildcard + ")(\\*)?$";

        return new RegExp(regExpStr).test(str);
    }

    //converts asterisks/wildcard characters to regexp string
    // returns true if compareToString satisfy regexp
    public wildcardMatching(queryWithWildcard: string, compareToString: string) {
        // replace all asterisks with '.*'
        // '.*' means: match any character 0+ times
        return new RegExp("^" + queryWithWildcard.split("*").join(".*") + "$").test(compareToString);
    }

    public orderResults(filteredResults: IObject[], order: string): IObject[] {
      // implement sort method and pass in method to be able to compare letters
      let orderedResults: IObject[] = filteredResults;
      //check if querykey exists
      if (filteredResults && filteredResults.length > 1 && order && filteredResults[0][order] !== 'undefined') {
        // sort filtered results
        let sortByQueryKey = ((queryKey: string, unsortedResults: IObject[]): IObject[] => {
          return unsortedResults.sort((a: IObject, b: IObject) => {
            let aValue = a[queryKey];
            let bValue = b[queryKey];

              // turn null values to empty string
              aValue = (aValue) ? aValue : "";
              bValue = (bValue) ? bValue : "";

              if (aValue < bValue) {
                  return -1;
              } else if (aValue > bValue) {
                  return 1;
              } else {
                  return 0;
              }
          });
        });

        orderedResults = sortByQueryKey(order, orderedResults);
      }
      return orderedResults;
    }

    public buildResults(orderedResults: IObject[], query: QueryRequest): IObject[] {
      let finalResults: IObject[] = [];
      //create new objects based on given columns and return format.
        let translatedQueryKeys: string[] = [];
        let datasetId: string;
        let getQueryKeysStringArray: string[] = query.GET;

        datasetId = this.getDatasetId(getQueryKeysStringArray[0]);
        getQueryKeysStringArray.forEach((key: string) => {
          // strip out datasetID
          key = this.getQueryKey(key);
          translatedQueryKeys.push(this.translateKey(key));

        });

      if (query.AS === 'TABLE') {
        orderedResults.forEach((result: IObject) => {
          let resultObject: IObject = {};
          translatedQueryKeys.forEach((querykey: string) => {
            // copy over keys and values defined in GET
              // reverse the translation (use queryKeys instead of datasetKeys) and reattach dataset id to querykey)
            resultObject[datasetId + "_" + this.reverseKeyTranslation(querykey)] = result[querykey];
          });

          finalResults.push(resultObject);
        });
      }

      return finalResults;
    }

    public getStringIndexKVByNumber(object: IObject, index: number): IObject {
      let keys: string[] = Object.keys(object);
      if (keys && keys.length > index){
        return {
          key: keys[index],
          value: object[keys[index]]
        };
      } else {
        return {key: "", value: ""};
      }
    }

    /**
     * Translates the keys in the query to the corresponding keys in the dataset
     * parses department and course id given the key of the current iteration in dataset
     *
     * @param queryKey
     */
    public translateKey(queryKey: string): string {
      let result: string;

      switch(queryKey) {
        case 'dept':
          result = 'Subject';
          break;

        case 'id':
          result = 'Course';
          break;

        case 'avg':
          result = 'Avg';
          break;

        case 'instructor':
          result = 'Professor';
          break;

        case 'title':
          result = 'Title';
          break;

        case 'pass':
          result = 'Pass';
          break;

        case 'fail':
          result = 'Fail';
          break;

        case 'audit':
          result = 'Audit';
          break;

        default:
          result = 'unknownKey';
          break;
      }

      return result;
    }

    public reverseKeyTranslation(queryKey: string): string {
        let result: string;

        switch(queryKey) {
            case 'Subject':
                result = 'dept';
                break;

            case 'Course':
                result = 'id';
                break;

            case 'Avg':
                result = 'avg';
                break;

            case 'Professor':
                result = 'instructor';
                break;

            case 'Title':
                result = 'title';
                break;

            case 'Pass':
                result = 'pass';
                break;

            case 'Fail':
                result = 'fail';
                break;

            case 'Audit':
                result = 'audit';
                break;

            default:
                result = 'unknownKey';
                break
        }

        return result;
    }
}
