/**
 * Created by rtholmes on 2016-06-19.
 */
import {Datasets} from "./DatasetController";
import Log from "../Util";
import {IObject} from "./IObject";
import {IFilter, IOrderObject, IApplyObject, IMComparison, ISComparison, IApplyTokenToKey} from "./IEBNF";
import QueryUtility from "./QueryUtility";


export interface QueryRequest {
    GET: string[];
    WHERE: IFilter;
    GROUP?: string[];
    APPLY?: IApplyObject[];
    ORDER?: string | IOrderObject;
    AS: string;
}

export interface QueryResponse {
  render: string;
  result: IObject[];
}

let queryUtility = new QueryUtility();

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
            return 'Query GET does not have any keys!';
        } else if (!query.WHERE) {
            return "Query WHERE has not been defined!";
        } else if (query.GROUP && query.GROUP.length === 0) {
            return "Query GROUP must have at least one key!";
        } else if (query.GROUP && !query.APPLY || !query.GROUP && query.APPLY) {
            return "Query GROUP and APPLY must both be defined/undefined";
        } else if (query.APPLY && query.APPLY.length === 0) {
            return "Query APPLY cannot be empty!";
        } else if (!query.AS) {
          return "Query AS has not been defined!";
        } else if (query.AS && query.AS !== 'TABLE') {
          return "Query AS must be 'TABLE'!";
        }

        /**
         * If there are keys without "_", GROUP and APPLY must be defined.
         * Keys with "_" must be found in GROUP.
         * Key without "_" (CustomKeys) must be found in APPLY;
         */
        if (query.GET) {
            let containsCustomKeys = false;
            let queryKeys: string[] = []
            let customKeys: string[] = [];
            let errorMessage: string;

            query.GET.forEach((getKey) => {
               if (getKey.indexOf("_") === -1) {
                   customKeys.push(getKey);
               } else {
                   queryKeys.push(getKey);
               }

               if (customKeys.length > 0){
                   // 1. Are queryKeys (keys with "_") found in GROUP?
                   queryKeys.forEach((queryKey: string) => {
                       if (errorMessage) {
                           return;
                       } else if (query.GROUP.indexOf(queryKey) === -1) {
                            errorMessage = "Query key (key with '_') not found in GROUP!";
                       }
                   });


                   // 2. Are customKeys (keys without "_") found in APPLY?
                   let applyObjectKeys: string[] = [];
                   // get apply object keys (not the query key, the one without "_")
                   query.APPLY.forEach((applyObject: IApplyObject) => {
                       let applyObjectKey = this.getStringIndexKVByNumber(applyObject, 0)["key"];
                       applyObjectKeys.push(applyObjectKey);
                   });

                    customKeys.forEach((cKey) => {
                       if (errorMessage) {
                           return;
                       } else if (applyObjectKeys.indexOf(cKey) === -1) {
                           errorMessage = "Custom key (key without '_') not found in APPLY Object!";
                       }
                    });
               }
            });
            if (errorMessage) {
                return errorMessage;
            }

        }

        if (query.ORDER) {
            //Check if ORDER is string(D1) or object(D2)
            let orderType: string = typeof(query.ORDER);
            let orderKeys: string[];
            let errorMessage: string;

            // store order keys in an array
            if (orderType === "string") {
                // cast to string
                let orderString: string = <string>query.ORDER;
                if (orderString.length > 0) {
                    orderKeys = [<string>query.ORDER];
                }
            } else if (orderType === "object") {
                // cast to IOrderObject
                let orderObject: IOrderObject = <IOrderObject>query.ORDER;
                orderKeys = orderObject.keys;
            }

            if (orderKeys.length === 0) {
                errorMessage = "Order must have at least one key!"
            } else if (orderKeys && orderKeys.length > 0) {
                // order key needs to be among the get keys
                // NOTE: GET should not and cannot be empty here based on the previous checks
                let queryGETArray: string[] = query.GET;
                orderKeys.forEach((key) => {
                    if (errorMessage) {
                        return;
                    } else if (queryGETArray.indexOf(key) === -1) {
                        errorMessage = 'The key in ORDER does not exist in GET!';
                    }
                });
            }

            if (errorMessage) {
                return errorMessage;
            }
        }

        let whereKeys: string[] = Object.keys(query.WHERE);
        if (whereKeys.length > 0) {
            let invalidFilterKey: boolean = true;
            whereKeys.forEach((key: string) => {
                //TODO: double-check logic here
                if (key === "AND" || key === "OR" || key === "LT" || key === "GT" || key === "EQ" || key === "IS" || key === "NOT") {
                    invalidFilterKey = false;
                }
            });
            if (invalidFilterKey) {
                return "Query WHERE contains an invalid filter key!";
            }
        }

        if (query.APPLY) {
            let validApplyToken: boolean = true;
            // iterate through all the apply Object key definitions

            // check for duplicates.
            // if no duplicates execute belows, otherwise validApplyToken is false.

            let hasDuplicateKey: boolean = queryUtility.targetHasDuplicate(query.APPLY);
            if (hasDuplicateKey === false) {
                query.APPLY.forEach((applyObject: IApplyObject) => {
                    let applyObjectKeys = Object.keys(applyObject);
                    if (applyObjectKeys) {
                        // there should only be one key
                        let applyObjectKey = this.getStringIndexKVByNumber(applyObject, 0)["value"];
                        let applyObjectToken = this.getStringIndexKVByNumber(applyObjectKey, 0)["key"];
                        validApplyToken = validApplyToken && (applyObjectToken === "MAX" || applyObjectToken === "MIN"
                            || applyObjectToken === "AVG" || applyObjectToken === "COUNT");
                    }
                });
            }
            if (!validApplyToken || hasDuplicateKey) {
                return "Query APPLY contains an invalid APPLYTOKEN!";
            }
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
          //TODO: handle D2 version of ORDER
        let orderQueryKey: string = this.getQueryKey(<string>query.ORDER);

        //translate queryKey
        orderQueryKey = this.translateKey(orderQueryKey);
        let orderedResults: IObject[] = this.orderResults(filteredResults, orderQueryKey);

        // lets get the APPLY key.
        // let applyKey = this.translateKey(applyQueryKey);
        // !!! need to know which APPLY im doing. therefore will have to update based on APPLYTOKEN
        //  should be similar to the LT GT etc case.
        // let appliedResults: IObject[] = this.applyResults(orderedResults, appliedKey);

        // 3. APPLY
    //    let applyResults : IObject[] = this.executeApplyTokenOnResults(orderedResults, query.APPLY);

        // 4. BUILD
        let finalResults: IObject[] = this.buildResults(orderedResults, query);

        return {render: query.AS, result: finalResults};
    }

    public filterCourseResults(queryFilter: IFilter, allCourseResults: IObject[]): IObject[] {
      // for each courseResult, add to results array if it matches
      // query conditions
      // translatekey as needed
      let queryFilterMatches: IObject[] = [];

        if (queryFilter && Object.keys(queryFilter) && Object.keys(queryFilter).length === 0) {
            // if query.WHERE is an empty object, return all course results
            queryFilterMatches = queryFilterMatches.concat(allCourseResults);
        } else {
            allCourseResults.forEach((courseResult: IObject) => {
                let queryResult: boolean = this.queryACourseResult(queryFilter, courseResult);

                if (queryResult !== null) {
                    if (queryResult) {
                        // add courseResult to matches collection
                        queryFilterMatches.push(courseResult);
                    }
                } else {
                    throw new Error('No match result returned from queryResult on courseResult!')
                }
            });
        }

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


    public findMaximumValueInDataSet(valueToSearch : string, resultSet : IObject[]) : number {
        let translatedValueToSearch = this.translateKey(valueToSearch);
        let currentMaxValue: number = 0;
        resultSet.forEach( (item : any, index : number) => {
            let resultSetsKeyArray =  Object.keys(item);
            // this always grabs the first one.... but we  really just need to check if its there or not among any keys.

            if (resultSetsKeyArray.indexOf(translatedValueToSearch) > -1 && ((typeof item[translatedValueToSearch]) === "number"))
            {
                let currentNumber = item[translatedValueToSearch];
                if (currentMaxValue === 0){
                    currentMaxValue = currentNumber;
                }
               else if( currentNumber > currentMaxValue ){
                   currentMaxValue = currentNumber;
               }
            }
        });
        return currentMaxValue;
    }
    public findMinimumValueInDataSet(valueToSearch : string, resultSet : IObject[]) : number {
        let translatedValueToSearch = this.translateKey(valueToSearch);
        let currentMinValue: number = 0;
        resultSet.forEach( (item, index) => {
            let resultSetsKey =  Object.keys(item);
            if (resultSetsKey.indexOf(translatedValueToSearch) > -1 && ((typeof item[translatedValueToSearch]) === "number")) {
                    let currentNumber = item[translatedValueToSearch];
                    if (currentMinValue === 0){
                        currentMinValue = currentNumber;
                    }
                    else if(currentNumber < currentMinValue ){
                        currentMinValue = currentNumber;
                    }
            }
        });
        return currentMinValue;
    }
    public findAverageValueInDataSet(valueToSearch : string, resultSet : IObject[]) : number {
        let translatedValueToSearch = this.translateKey(valueToSearch);
        var count : number = 0;
        let sum : number = 0;
        let averageValueCalculated : number;
        resultSet.forEach( (item, index) => {
            let resultSetsKey =  Object.keys(item);
            if (resultSetsKey.indexOf(translatedValueToSearch) > -1 && ((typeof item[translatedValueToSearch]) === "number")) {
                let currentNumber = item[translatedValueToSearch];
                sum += currentNumber;
                count += 1;
            }
        });
        averageValueCalculated = parseFloat((sum/count).toFixed(2));
        return averageValueCalculated;
    }
    /*
    Find every unique set of elemnents in a data-set.
     */
    public findCountSearchedInDataSet(valueToSearch : string, resultSet : IObject[]) : number {
        let translatedValueToSearch = this.translateKey(valueToSearch);
        var count = 0;
        let viewedElements : Array<IObject> = [];
        resultSet.forEach( (item, index) => {
            let resultSetsKey =  Object.keys(item);
            if (resultSetsKey.indexOf(translatedValueToSearch) > -1){
                if (viewedElements.indexOf(item[translatedValueToSearch]) === -1) {
                    viewedElements.push(item[translatedValueToSearch]);
                    count += 1;
                }
            }
        });
        return count;
    }
   /*
   Calls the appropriate function based on the current APPLY key being examined.(e.g. max, min etc).
   Returns the value from the calculation.
    */
   public applyActionOnDataSet(item : string, valueToSearch : string, resultSet : IObject[]) : number {
        switch(item) {
            case 'MAX' :
                return this.findMaximumValueInDataSet(valueToSearch, resultSet);
            case 'MIN' :
                return this.findMinimumValueInDataSet(valueToSearch, resultSet);
            case 'AVG' :
                return this.findAverageValueInDataSet(valueToSearch, resultSet);
            case 'COUNT' :
                return this.findCountSearchedInDataSet(valueToSearch, resultSet);
            default:
                Log.trace('Apply is invalid here and should be dealt with');
                break;
        }
   }

    /*
    Expect an array of results to be given.
    Return the expected output resulting from this.
     */
    public executeApplyTokenOnResults(resultSet : IObject[], applyQuery : Array<Object> ) : IObject[]  {

        let resultArray : Array<IObject> = [];
        applyQuery.forEach( (item : IApplyObject) => {

            let customKeyToStore : string = Object.keys(item)[0];
            let action = Object.keys(item[customKeyToStore])[0];
            let actionObject : IObject = item[customKeyToStore];

            let valueOfAction : IObject = Object.keys(actionObject).map((key) => {
                return actionObject[key];
            });
            let actionsOutcome = this.applyActionOnDataSet(action, valueOfAction[0], resultSet);


            let tempObject : IObject = {
                [customKeyToStore] : actionsOutcome
            }
            resultArray.push(tempObject);
        });
        return resultArray;
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

    /*
    Given an object, return the key value pair.
     */
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

        case 'uuid':
          result = 'id';
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

            case 'id':
                result = 'uuid';
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

    /**
     * Given a customKey (key without "_") and APPLY Array return the ApplyTokenToKeyObject
     * Return an empty object if not found
     * @param customKey
     */
    public getApplyTokenToKeyObject(applyArray: IApplyObject[], customKey: string): IApplyTokenToKey {
        let applyTokenToKeyObject: IApplyTokenToKey = {};

        applyArray.forEach((applyObject: IApplyObject) => {
            if (Object.keys(applyTokenToKeyObject).length === 1) {
                // Stop iterating, we found the key in the applyArray already!
                return;
            } else if (this.getStringIndexKVByNumber(applyObject, 0)["key"] === customKey) {
                applyTokenToKeyObject = this.getStringIndexKVByNumber(applyObject, 0)["value"];
            }
        });

        return applyTokenToKeyObject;
    }

}
