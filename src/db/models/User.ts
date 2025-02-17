import BaseModel from "@/db/BaseModel";
import { Role } from "@/db/models/Role";
import { UserRole } from "@/db/models/UserRole";
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  BelongsToMany,
} from "sequelize-typescript";

@Table({
  timestamps: false,
  tableName: "users",
})
export class User extends BaseModel {
  hidden: string[] = ["password"];

  @Column
  email!: string;

  @Column
  name?: string;

  @Column
  firstname?: string;

  @Column
  lastname?: string;

  @Column
  password!: string;

  @CreatedAt
  @Column
  begintime?: Date;

  @UpdatedAt
  @Column
  updatedate?: Date;

  @DeletedAt
  @Column
  endtime?: Date;

  @BelongsToMany(() => Role, () => UserRole, "principalId", "roleId")
  roles: Role[] | undefined;
}
