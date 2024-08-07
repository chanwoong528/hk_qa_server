import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk'
import axios from 'axios';
import * as sharp from 'sharp'

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
  async uploadImageFromTextEditor(base64: string, size?: { w: number, h: number }): Promise<string> {
    AWS.config.update({
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
      },
    });
    try {
      const isEmptySize = Object.keys(size).length === 0;
      const imgFile = await this.base64ToFile(!!isEmptySize ? base64 : await this.resizeBase64GivenWandH(base64, size.w, size.h));

      const upload = await new AWS.S3()
        .upload({
          Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
          Key: this.configService.get('AWS_S3_IMG_FOLDER') + 'default' + Date.now() +
            imgFile.type.replace('image/', '.'),

          Body: imgFile.file
        }).promise();

      return upload.Location;
    } catch (error) {
      console.warn(error)
      throw new Error('upload failed');
    }
  }

  private isValidUrl(str: string): boolean {
    const pattern = /^(https?:\/\/[^\s\/$.?#].[^\s]*\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg|ico)(\?[^\s]*)?)$/i;

    return !!pattern.test(str);
  }
  private getMimeTypeFromUrl(url: string) {
    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      bmp: 'image/bmp',
      webp: 'image/webp',
      tiff: 'image/tiff',
      svg: 'image/svg+xml',
      ico: 'image/x-icon'
    };

    const extensionMatch = url.match(/\.([a-z0-9]+)(\?.*)?$/i);
    if (extensionMatch) {
      const extension = extensionMatch[1].toLowerCase();
      return mimeTypes[extension] || 'application/octet-stream';
    }
    return 'application/octet-stream'; // Default MIME type
  }
  private async base64ToFile(base64String: string): Promise<{ file: Buffer, type: string }> {
    if (!!this.isValidUrl(base64String)) {
      const response = await axios.get(base64String, { responseType: 'arraybuffer' })
      const buffer = Buffer.from(response.data, "utf-8")
      const mimeType = this.getMimeTypeFromUrl(base64String)
      return { file: buffer, type: mimeType }
    }


    if (!base64String.includes('data:image/')) {
      console.error('Invalid base64 image string');
      return null;
    }

    // Extract the MIME type from the base64 string
    const mimeTypeMatch = base64String.match(/data:(image\/\w+);base64,/);
    if (!mimeTypeMatch) {
      console.error('Invalid base64 image string');
      return null;
    }
    const mimeType = mimeTypeMatch[1];
    const base64Data = base64String.split(',')[1];
    const newFile = Buffer.from(base64Data, 'base64');
    return { file: newFile, type: mimeType }
  }

  private async resizeBase64GivenWandH(base64String: string, width: number, height: number) {
    try {
      const mimeType = base64String.match(/data:(image\/\w+);base64,/)[1];

      let base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
      let imgBuffer = Buffer.from(base64Data, 'base64');
      let resizedImgBuffer = await sharp(imgBuffer)
        .resize(width, height)
        .toBuffer();
      let resizedBase64 = resizedImgBuffer.toString('base64');

      return `data:${mimeType};base64,${resizedBase64}`;

    } catch (error) {
      console.warn(error)
      throw new Error('resize failed');
    }
  }
}
