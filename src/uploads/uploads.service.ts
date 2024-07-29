import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk'


@Injectable()
export class UploadsService {
  constructor(
    private configService: ConfigService
  ) { }

  async uploadFileSwVersion(file: Express.Multer.File): Promise<string> {
    AWS.config.update({
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
      },
    });
    try {
      const upload = await new AWS.S3()
        .upload({
          Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
          Key: !!file.originalname ? file.originalname : 'default' + Date.now(),
          Body: file.buffer
        }).promise();

      return upload.Location;
    } catch (error) {
      throw new Error('upload failed');
    }
  }
}
