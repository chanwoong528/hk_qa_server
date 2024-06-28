import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  username: string; 

  @Column("email")
  email: string; 

  @Column()
  role: string; 

  @Column()
  pw: string; 

}
