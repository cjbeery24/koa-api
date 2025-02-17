import BaseModel from "@/db/BaseModel";
import { User } from "@/db/models/User";
import {
  Table,
  Column,
  CreatedAt,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";

@Table({
  timestamps: false,
  tableName: "AccessToken",
})
export class AccessToken extends BaseModel {
  hidden: string[] = [];

  @Column({
    primaryKey: true,
    autoIncrement: false,
  })
  id!: string;

  @Column
  ttl!: number;

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
