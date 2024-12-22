import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Trade } from './trade.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Trade)
    private tradeRepository: Repository<Trade>,
  ) {}

  async saveUsers(users: any[]): Promise<User[]> {
    const userEntities = users.map(({user}) => {
      const newUser = new User();
      newUser.address = user.address;
      newUser.fullDomain = user.fullDomain || '';
      newUser.avatar = user.avatar;
      newUser.description = user.description || '';

      return newUser;
    });

    return await this.userRepository.save(userEntities);
  }

  async getUsers(): Promise<User[]> {
	return await this.userRepository.find();
  }

  async saveTrades(user: User, trades: any[]): Promise<void> {
    for (const trade of trades) {
      try {
        // Check if trade already exists (based on token address and user ID)
        const existingTrade = await this.tradeRepository.findOne({
          where: {
            tokenAddress: trade.token.address,
            userId: user.id,
          },
        });

        // Skip if trade already exists
        if (existingTrade) {
          console.log(`Trade already exists for token ${trade.token.address}, skipping.`);
          continue;
        }

        // Create and save new trade
        const newTrade = new Trade();
        newTrade.tokenAddress = trade.token.address;
        newTrade.chainId = trade.token.chainId;
        newTrade.decimals = trade.token.decimals;
        newTrade.name = trade.token.name;
        newTrade.symbol = trade.token.symbol;
        newTrade.imageUrl = trade.token.imageUrl;
        newTrade.totalSupply = trade.token.totalSupply;

        // Map stats fields
        newTrade.boughtCount = trade.stats.boughtCount;
        newTrade.boughtAmount = trade.stats.boughtAmount;
        newTrade.soldCount = trade.stats.soldCount;
        newTrade.soldAmount = trade.stats.soldAmount;
        newTrade.totalCount = trade.stats.totalCount;
        newTrade.pnlAmount = trade.stats.pnlAmount;
        newTrade.pnlPercent = trade.stats.pnlPercent;

        newTrade.user = user;

        await this.tradeRepository.save(newTrade);
        console.log(`Trade saved for token ${trade.token.address}.`);
      } catch (error) {
        console.error(`Failed to save trade for token ${trade.token.address}: ${error.message}`);
        continue;
      }
    }
  }
}
