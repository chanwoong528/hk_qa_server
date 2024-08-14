import { E_ReactionParentType, E_ReactionType } from "src/enum";

export interface CreateReactionDto {
  parentType: E_ReactionParentType;
  reactionType: E_ReactionType;

  parentCommentId?: string;
  parentTestUnitId?: string;
}