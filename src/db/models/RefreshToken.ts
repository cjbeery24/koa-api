import BaseModel from "@/db/BaseModel";
import { User } from "@/db/models/User";
import {
  Table,
  Column,
  CreatedAt,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";

@Table({
  timestamps: false,
  tableName: "RefreshToken",
})
export class RefreshToken extends BaseModel {
  hidden: string[] = [];

  @Column({
    primaryKey: true,
    autoIncrement: false,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column
  userId!: number;

  @Column
  facility_id?: number;

  @CreatedAt
  @Column
  created?: Date;

  @BelongsTo(() => User)
  user: User | undefined;
}
