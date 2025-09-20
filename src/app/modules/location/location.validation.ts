import z from "zod";

const locationUpdateZodSchema = z.object({
  body: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    accuracy: z.number().min(0).optional(),
    heading: z.number().min(0).max(360).optional(),
    speed: z.number().min(0).optional(),
  }),
});

const routeCalculationZodSchema = z.object({
  body: z.object({
    profile: z
      .enum(["driving", "driving-traffic", "walking", "cycling"])
      .optional(),
    alternatives: z.boolean().optional(),
    steps: z.boolean().optional(),
  }),
});

const etaCalculationZodSchema = z.object({
  body: z.object({
    currentLocation: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
  }),
});

const geocodingZodSchema = z.object({
  query: z
    .object({
      query: z.string().min(1),
      limit: z
        .string()
        .transform((val) => parseInt(val))
        .refine((val) => val > 0 && val <= 10)
        .optional(),
      country: z.string().optional(),
      bbox: z.string().optional(),
    })
    .optional(),
});

const reverseGeocodingZodSchema = z.object({
  query: z.object({
    lat: z
      .string()
      .transform((val) => parseFloat(val))
      .refine((val) => val >= -90 && val <= 90),
    lng: z
      .string()
      .transform((val) => parseFloat(val))
      .refine((val) => val >= -180 && val <= 180),
  }),
});

const locationHistoryZodSchema = z.object({
  query: z.object({
    startTime: z.iso.datetime().optional(),
    endTime: z.iso.datetime().optional(),
    limit: z
      .string()
      .transform((val) => parseInt(val))
      .refine((val) => val > 0 && val <= 1000)
      .optional(),
  }),
});

const driverLocationZodSchema = z.object({
  params: z.object({
    driverId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid driver ID"),
  }),
  query: z.object({
    rideId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid ride ID")
      .optional(),
  }),
});

const rideLocationHistoryZodSchema = z.object({
  params: z.object({
    rideId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ride ID"),
  }),
  query: z.object({
    startTime: z.iso.datetime().optional(),
    endTime: z.iso.datetime().optional(),
    limit: z
      .string()
      .transform((val) => parseInt(val))
      .refine((val) => val > 0 && val <= 1000)
      .optional(),
  }),
});

const rideRouteZodSchema = z.object({
  params: z.object({
    rideId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ride ID"),
  }),
});

export const LocationValidation = {
  locationUpdateZodSchema,
  routeCalculationZodSchema,
  etaCalculationZodSchema,
  geocodingZodSchema,
  reverseGeocodingZodSchema,
  locationHistoryZodSchema,
  driverLocationZodSchema,
  rideLocationHistoryZodSchema,
  rideRouteZodSchema,
};
