import BaseModel from "@/db/BaseModel";
import { Role } from "@/db/models/Role";
import { User } from "@/db/models/User";
import { Table, Column, ForeignKey } from "sequelize-typescript";

@Table({
  timestamps: false,
  tableName: "RoleMapping",
})
export class UserRole extends BaseModel {
  hidden: string[] = [];

  @ForeignKey(() => User)
  @Column
  principalId!: number;

  @ForeignKey(() => Role)
  @Column
  roleId!: number;
}
