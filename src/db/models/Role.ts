import BaseModel from "@/db/BaseModel";
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from "sequelize-typescript";

@Table({
  timestamps: false,
  tableName: "ag_roles",
})
export class Role extends BaseModel {
  hidden: string[] = [];

  @Column
  rolename!: string;

  @Column
  defaultRoute!: string;

  @CreatedAt
  @Column
  begintime?: Date;

  @UpdatedAt
  @Column
  updatedate?: Date;

  @DeletedAt
  @Column
  endtime?: Date;
}
