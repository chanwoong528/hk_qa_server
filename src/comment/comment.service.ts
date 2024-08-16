import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as jsdom from 'jsdom';

import { CreateCommentDto } from './comment.dto';
import { Comment } from './comment.entity';

import { UserService } from 'src/user/user.service';
import { SwVersionService } from 'src/sw-version/sw-version.service';
import { UploadsService } from 'src/uploads/uploads.service';
import { SseService } from 'src/sse/sse.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly userService: UserService,
    private readonly swVersionService: SwVersionService,
    private readonly uploadsService: UploadsService,
    private readonly sseService: SseService,
  ) { }

  async createComment(commentInfo: CreateCommentDto): Promise<Comment> {
    const author = await this.userService.findOneById(commentInfo.userId);

    if (!author) {
      throw new NotFoundException('User not found');
    }
    const swVersion = await this.swVersionService.getSwVersionById(
      commentInfo.swVersionId,
    );
    if (!swVersion) {
      throw new NotFoundException('SwVersion not found');
    }

    const { JSDOM } = jsdom;
    const dom = new JSDOM(commentInfo.content, {
      contentType: 'text/html',
      includeNodeLocations: true,
    });
    const document = dom.window.document;
    const imgElements = document.querySelectorAll('img');
    const allPElements = document.querySelectorAll('p');
    allPElements.forEach((pTag) => {
      // Trim the innerHTML to remove unnecessary whitespace
      const trimmedContent = pTag.innerHTML.trim();
      // Check if the <p> is empty or only contains <br> tags
      if (trimmedContent === '' || /^<br\s*\/?>$/.test(trimmedContent)) {
        // Remove the <p> element if the condition is true
        pTag.remove();
      }
    });
    for (const editorImg of imgElements) {
      let imgSize = {
        ...(editorImg.style.width && {
          w: Number(editorImg.style.width.replace(/px$/, '')),
        }),
        ...(editorImg.style.height && {
          h: Number(editorImg.style.height.replace(/px$/, '')),
        }),
      };
      const uploadedImg = await this.uploadsService.uploadImageFromTextEditor(
        editorImg.src,
        imgSize,
      );
      editorImg.src = uploadedImg;
    }
    const updatedHtmlContent = document.body.innerHTML;
    let newComment = new Comment(commentInfo);

    newComment.content = updatedHtmlContent;

    if (commentInfo.parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { commentId: commentInfo.parentId },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent Comment not found');
      }
      newComment.parentComment = parentComment;
    }

    newComment.user = author;
    newComment.swVersion = swVersion;
    const newComm = await this.commentRepository.save(newComment)

    this.sseService.emitCommentPostedEvent(newComm.commentId);
    return newComm;
  }

  async getCommentsBySwVersionId(swVersionId: string): Promise<Comment[]> {
    return await this.commentRepository.find({
      relations: [
        'user',
        'swVersion',
        'childComments',
        'childComments.user',
        'childComments.reactions',
        'childComments.reactions.user',
        'parentComment',
        'reactions',
        'reactions.user',
      ],
      where: {
        swVersion: {
          swVersionId: swVersionId,
        },
        parentComment: IsNull(),
      },
      order: { createdAt: 'DESC' },
    });
  }
  async getCommentById(commentId: string): Promise<Comment> {
    if (!commentId) throw new NotFoundException('Comment not found');

    return await this.commentRepository.findOne({
      relations: [
        'user',
        'swVersion',
        'childComments',
        'childComments.user',
        'childComments.reactions',
        'childComments.reactions.user',
        'parentComment',
        'reactions',
        'reactions.user',
      ],
      where: {
        commentId: commentId,
      },
    });
  }

  async getChildCommentsByParentId(parentId: string): Promise<Comment[]> {
    return await this.commentRepository.find({
      relations: [
        'user',
        'swVersion',
        'childComments',
        'childComments.user',
        'childComments.reactions',
        'childComments.reactions.user',
        'parentComment',
        'reactions',
        'reactions.user',
      ],
      where: {
        parentComment: {
          commentId: parentId,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }
}
