import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { Trade } from './trade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Trade]),],
  providers: [UserService],
  controllers: [],
  exports: [UserService],
})
export class UserModule {}
