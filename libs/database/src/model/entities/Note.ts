import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Index("PK__Note__3214EC078812B037", ["id"], { unique: true })
@Entity("Note", { schema: "dbo" })
export class Note {
  @PrimaryGeneratedColumn({ type: "int", name: "Id" })
  id: number;

  @Column("nvarchar", { name: "name", length: 127 })
  name: string;

  @Column("nvarchar", { name: "content" })
  content: string;

  @Column("datetime2", { name: "created_at", default: () => "getdate()" })
  createdAt: Date;

  @Column("datetime2", { name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.notes, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
