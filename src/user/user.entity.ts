import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"
import { UserRO } from './user.dto'

@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @CreateDateColumn()
    created: Date

    @Column({ type: 'text', unique: true })
    username: string

    @Column('text')
    password: string

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10)
    }

    async comparePassword(attempt: string) {
        return await bcrypt.compare(attempt, this.password)
    }

    toResponseObject(showToken: boolean = true): UserRO {
        const { id, created, username, token } = this
        const responseObject: UserRO = { id, created, username }
        if (showToken) responseObject.token = token
        return responseObject
    }

    private get token() {
        const { id, username } = this
        return jwt.sign({ id, username }, process.env.SECRET, { expiresIn: '7d' })
    }

}