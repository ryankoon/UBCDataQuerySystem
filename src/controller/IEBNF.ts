
export interface IMComparison {
  [colName: string]: number;
}

export interface ISComparison {
  // value may need to be of type any for wildcard
  [colName: string]: string;
}

export interface ILogicComparison {
  [filter: string]: IFilter;
}

export interface IFilter {
  AND?: IFilter[];
  OR?: IFilter[];
  NOT?: IFilter;
  LT?: IMComparison;
  GT?: IMComparison;
  EQ?: IMComparison;
  IS?: ISComparison;
}
