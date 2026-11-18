import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemail from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemail.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemail.createTransport({
      host: config.get<string>('EMAIL_HOST'),
      port: config.get<number>('EMAIL_PORT'),
      secure: config.get<string>('EMAIL_SECURE') === 'true',
      auth: {
        user: config.get<string>('EMAIL_USER'),
        pass: config.get<string>('EMAIL_PASS'),
      },
    });
  }

  sendMail(
    email: string,
    subject: string,
    html?: string,
  ): Promise<{ code: string } & Record<string, unknown>> {
    const code = Math.random().toString().slice(-6);
    const mailOptions = {
      from: this.config.get<string>('EMAIL_USER'),
      to: email,
      text: `用户验证码为：${code}，有效期为 5 分钟，请及时使用`,
      subject,
      html,
    };

    console.log(`用户验证码为：${code}，有效期为 5 分钟，请及时使用`);

    return new Promise((resolve, reject) => {
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(
            new HttpException(
              `发送邮件失败:${error}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        } else {
          resolve({
            code,
            ...info.envelope,
          });
        }
      });
    });
  }
}
