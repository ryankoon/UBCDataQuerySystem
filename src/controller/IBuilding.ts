/**
 * Created by Ryan on 11/7/2016.
 */
export interface IBuilding {
    result: IRoom[];
}

export interface IRoom {
    fullname: string;
    shortname: string;
    number: string;
    name: string;
    address: string;
    lat: number;
    lon: number;
    seats: number;
    type: string;
    furniture: string;
    href: string;
    traveldistance?: number;
}
