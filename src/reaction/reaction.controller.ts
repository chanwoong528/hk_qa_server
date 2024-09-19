import { Controller, Post, Request, Body, UseGuards } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { CreateReactionDto } from './reaction.dto';
import { Reaction } from './reaction.entity';
import { AuthGuard } from 'src/common/guard/auth.guard';

@Controller('reaction')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createReaction(
    @Body() createReactionDto: CreateReactionDto,
    @Request() req,
  ): Promise<Reaction> {
    const { sub } = req.user;
    return await this.reactionService.createOrUpdateReaction(
      createReactionDto,
      sub,
    );
  }
}
