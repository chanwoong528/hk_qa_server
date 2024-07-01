import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { SwType } from "../sw-type/sw-type.entity";


@Entity({ name: "users", schema: "public", synchronize: true, })
@Unique(["email"])
export class User {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ default: "tester" })
  role: string;

  @Column({ select: false })
  pw: string;

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date


  @OneToMany(type => SwType, swType => swType.user)
  swTypes: SwType[]
}
