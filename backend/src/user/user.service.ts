import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './user.schema';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class UserService {
  private readonly saltRounds = 10;

  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async register(registerDto: RegisterDto): Promise<{ status: number, message: string }> {
    const { email, password } = registerDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email is already in use.');
    }

    const hashedPassword = await this.hashPassword(password);
    const newUser = new this.userModel({ email, password: hashedPassword });
    await newUser.save();

    return { status: 201, message: 'User registered successfully.' };
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }
}
