import { pgEnum } from 'drizzle-orm/pg-core'

export const vehicleTypeEnum = pgEnum('vehicle_type', ['cars', 'motorcycles', 'trucks'])
