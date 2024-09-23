import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface DropboxResetPasswordEmailProps {
  userFirstname?: string;
  resetPasswordLink?: string;
}

export const ForGotPassword = ({ username, token, homepageUrl }) => {
  return (
    <Html>
      <Head />
      <Preview> 비밀번호를 초기화하세요</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`https://hk-qa-bucket.s3.ap-northeast-2.amazonaws.com/hiq_logo.png`}
            width="120"
            height="72"
          />
          <Section>
            <Text style={text}>{username}님,</Text>
            <Button
              style={button}
              href={`${homepageUrl}/reset-password?token=${token}`}
            >
              비밀번호 초기화
            </Button>
            <Text style={text}>
              비밀번호를 변경하고 싶지 않거나 이 요청을 하지 않았다면, 이
              메시지를 무시하고 삭제하세요.
            </Text>
          </Section>
          <Text style={paragraph}>
            비밀번호 초기화에 문제가 있거나 도움이 필요하시면 아래 이메일로
            <Link href="mailto:mooncw@hankookilbo.com" style={link}>
              mooncw@hankookilbo.com
            </Link>{' '}
            로 연락하세요.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

ForGotPassword.PreviewProps = {
  username: 'test',
  token: 'test::token',
  homepageUrl: 'http://localhost:4321',
} as DropboxResetPasswordEmailProps;

export default ForGotPassword;

const main = {
  backgroundColor: '#f6f9fc',
  padding: '10px 0',
};
const link = {
  textDecoration: 'underline',
};
const paragraph = {
  color: '#444',
  fontSize: '15px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  letterSpacing: '0',
  lineHeight: '23px',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  padding: '45px',
};

const text = {
  fontSize: '16px',
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: '300',
  color: '#404040',
  lineHeight: '26px',
};

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '4px',
  color: '#fff',
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '210px',
  padding: '14px 7px',
};

const anchor = {
  textDecoration: 'underline',
};
