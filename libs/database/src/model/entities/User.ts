import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Note } from "./Note";
import { Token } from "./Token";

@Index("PK__User__3214EC07CE846B24", ["id"], { unique: true })
@Entity("User", { schema: "dbo" })
export class User {
  @PrimaryGeneratedColumn({ type: "int", name: "Id" })
  id: number;

  @Column("nvarchar", { name: "email", length: 127 })
  email: string;

  @Column("nvarchar", { name: "password", length: 127 })
  password: string;

  @Column("bit", { name: "is_confirmed" })
  isConfirmed: boolean;

  @OneToMany(() => Note, (note) => note.user)
  notes: Note[];

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];
}
