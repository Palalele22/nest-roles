import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthDto, SignInDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async signin(signInDto: SignInDto) {
    //find user by email
    const user = await this.userRepository.findOne({
      where: {
        email: signInDto.email,
      },
    });

    //if user doesnt exist throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect');

    //else, compare passwords
    const pwMatches = await argon.verify(user.passwordHash, signInDto.password);

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    return this.signToken(user.id, user.email, user.name);
  }

  async signup(signUpDto: AuthDto) {
    //generate password hash
    const passHash = await argon.hash(signUpDto.password);

    //create new user
    try {
      const newUser = this.userRepository.create({
        name: signUpDto.name,
        email: signUpDto.email,
        passwordHash: passHash,
        role: signUpDto.role,
      });
      const user = await this.userRepository.save(newUser);
      return this.signToken(user.id, user.email, user.name);
    } catch (error) {
      if (error.code === '23505')
        throw new ForbiddenException('Credentials taken');
      throw error;
    }
  }

  async signToken(
    userId: number,
    email: string,
    name: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      name: name,
      email,
    };
    const secret = this.configService.get('JWT_SECRET');

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '30m',
      secret: secret,
    });

    return { access_token: token };
  }
}
