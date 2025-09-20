import { Types } from 'mongoose';

export interface ILocation {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
  address?: string;
  geohash?: string;
}

export interface ILocationHistory {
  id: Types.ObjectId;
  rideId: Types.ObjectId;
  driverId: Types.ObjectId;
  location: ILocation;
  createdAt: Date;
}

export interface IRoute {
  id: Types.ObjectId;
  rideId: Types.ObjectId;
  geometry: {
    type: string;
    coordinates: number[][];
  };
  duration: number;
  distance: number;
  instructions: IRouteInstruction[];
  waypoints: ILocation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IRouteInstruction {
  text: string;
  distance: number;
  duration: number;
  type: 'turn' | 'straight' | 'arrive';
}

export interface IDriverLocation {
  id: Types.ObjectId;
  driverId: Types.ObjectId;
  location: ILocation;
  isOnline: boolean;
  lastUpdated: Date;
  rideId?: Types.ObjectId;
}

export interface IGeocodingResult {
  placeName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: {
    street?: string;
    city?: string;
    district?: string;
    country?: string;
    postcode?: string;
  };
  relevance: number;
}

export interface IReverseGeocodingResult {
  coordinates: {
    lat: number;
    lng: number;
  };
  address: {
    placeName: string;
    street?: string;
    city?: string;
    district?: string;
    country?: string;
    postcode?: string;
  };
}



export interface ILocationUpdateRequest {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

export interface IRouteCalculationRequest {
  profile?: 'driving' | 'driving-traffic' | 'walking' | 'cycling';
  alternatives?: boolean;
  steps?: boolean;
}

export interface IETACalculationRequest {
  currentLocation: {
    lat: number;
    lng: number;
  };
}