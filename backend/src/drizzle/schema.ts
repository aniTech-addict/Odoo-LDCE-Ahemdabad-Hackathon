import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const UserTable = pgTable("userTable", {
    id: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username", { length: 255 }),
})