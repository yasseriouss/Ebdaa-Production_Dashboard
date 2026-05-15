import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { departmentsTable, factoriesTable } from "./factoryCapacity";

export const employeesTable = sqliteTable("employees", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  jobTitle: text("job_title").notNull(),
  standardizedRole: text("standardized_role").notNull(),
  hireDate: text("hire_date"),
  departmentId: text("department_id").references(() => departmentsTable.id),
  factoryId: text("factory_id").notNull().references(() => factoriesTable.id),
});

export type Employee = typeof employeesTable.$inferSelect;
export type NewEmployee = typeof employeesTable.$inferInsert;
