import { RideStatusEnum } from '../ride/ride.interface';

export interface IAnalyticsQuery {
  startDate?: string;
  endDate?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface IAnalyticsResponse {
  statusDistribution: Array<{
    _id: RideStatusEnum;
    count: number;
  }>;
  revenueAnalytics: {
    totalRevenue: number;
    totalRides: number;
    averageRidePrice: number;
  };
  trendData: Array<{
    _id: {
      year: number;
      month?: number;
      day?: number;
      week?: number;
    };
    totalRides: number;
    completedRides: number;
    cancelledRides: number;
    totalRevenue: number;
  }>;
  topDrivers: Array<{
    totalRides: number;
    completedRides: number;
    totalEarnings: number;
    completionRate: number;
    driverName: string;
    driverEmail: string;
  }>;
}

// Rider Analytics Interfaces
export interface IRiderAnalyticsQuery {
  startDate?: string;
  endDate?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface IRiderAnalyticsResponse {
  overview: {
    totalRides: number;
    completedRides: number;
    cancelledRides: number;
    totalSpent: number;
    averageRideCost: number;
    completionRate: number;
  };
  spendingTrends: Array<{
    _id: {
      year: number;
      month?: number;
      day?: number;
      week?: number;
    };
    totalSpent: number;
    rideCount: number;
    averageCost: number;
  }>;
  favoriteLocations: {
    pickupLocations: Array<{
      location: {
        lat: string;
        lng: string;
      };
      count: number;
      address?: string;
    }>;
    destinationLocations: Array<{
      location: {
        lat: string;
        lng: string;
      };
      count: number;
      address?: string;
    }>;
  };
  driverRatings: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    recentReviews: Array<{
      driverName: string;
      rating: number;
      comment?: string;
      createdAt: Date;
    }>;
  };
  rideHistory: Array<{
    _id: string;
    status: string;
    price: number;
    pickupLocation: {
      lat: string;
      lng: string;
    };
    destination: {
      lat: string;
      lng: string;
    };
    driverName?: string;
    createdAt: Date;
    completedAt?: Date;
  }>;
}

// Driver Analytics Interfaces
export interface IDriverAnalyticsQuery {
  startDate?: string;
  endDate?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface IDriverAnalyticsResponse {
  overview: {
    totalRides: number;
    completedRides: number;
    cancelledRides: number;
    totalEarnings: number;
    averageRideEarnings: number;
    completionRate: number;
  };
  earningsTrends: Array<{
    _id: {
      year: number;
      month?: number;
      day?: number;
      week?: number;
    };
    totalEarnings: number;
    rideCount: number;
    averageEarnings: number;
  }>;
  riderRatings: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    recentReviews: Array<{
      riderName: string;
      rating: number;
      comment?: string;
      createdAt: Date;
    }>;
  };
  rideHistory: Array<{
    _id: string;
    status: string;
    price: number;
    pickupLocation: {
      lat: string;
      lng: string;
    };
    destination: {
      lat: string;
      lng: string;
    };
    riderName?: string;
    createdAt: Date;
    completedAt?: Date;
  }>;
}

// Admin Analytics Interfaces
export interface IAdminOverviewResponse {
  totalUsers: number;
  totalDrivers: number;
  totalRides: number;
  totalRevenue: number;
  activeDrivers: number;
  completedRides: number;
  pendingRides: number;
  cancelledRides: number;
}

export interface IAdminDriversResponse {
  driversByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  driversByAvailability: {
    online: number;
    offline: number;
  };
  topDriversByRides: Array<{
    driverId: string;
    driverName: string;
    totalRides: number;
    earnings: number;
  }>;
}

export interface IAdminRidesResponse {
  ridesByStatus: {
    requested: number;
    accepted: number;
    in_transit: number;
    completed: number;
    cancelled: number;
  };
  ridesByTimeOfDay: Array<{
    hour: number;
    count: number;
  }>;
  averageRidePrice: number;
  totalDistance: number;
}

export interface IAdminRevenueTrendQuery {
  period?: 'daily' | 'weekly' | 'monthly';
  days?: number;
}

export interface IAdminRevenueTrendResponse {
  daily: Array<{
    date: string;
    value: number;
  }>;
  weekly: Array<{
    date: string;
    value: number;
  }>;
  monthly: Array<{
    date: string;
    value: number;
  }>;
}