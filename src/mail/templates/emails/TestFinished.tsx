import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Text,
  Button,
} from '@react-email/components';

import * as React from 'react';

interface AddedAsTesterProps {
  username: string;
  swInfo: any;
  homepageUrl: string;
}

const AddedAsTester = ({ username, swInfo, homepageUrl }) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`https://hk-qa-bucket.s3.ap-northeast-2.amazonaws.com/hiq_logo.png`}
          width="120"
          height="72"
          style={logo}
        />
        <br />
        <br />
        <Heading style={secondary}>
          안녕하세요 {username}님,
          <br />
          소프트웨어 [{swInfo.swType.typeTitle}]에 대한
          <br /> 모든 테스터가 통과로 표시되었습니다.
        </Heading>
        <Text>아래 소프트웨어 버전을 배포해주세요.</Text>
        <Text style={Paralink}> {swInfo.swType.typeTitle}</Text>
        <Button
          style={button}
          href={`${homepageUrl}/sw-type/${swInfo.swType.swTypeId}`}
        >
          큐잉 홈페이지로 이동
        </Button>

        <Text style={paragraph}>
          문의 사항이 있으시면
          <Link href="mailto:mooncw@hankookilbo.com" style={link}>
            mooncw@hankookilbo.com
          </Link>
          <br />로 연락해주세요.
        </Text>
      </Container>
    </Body>
  </Html>
);

AddedAsTester.PreviewProps = {
  username: 'test',
  swInfo: {
    swType: {
      typeTitle: 'test sw type',
    },
  },
  homepageUrl: 'http://localhost:4321',
} as AddedAsTesterProps;

export default AddedAsTester;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #eee',
  borderRadius: '5px',
  boxShadow: '0 5px 10px rgba(20,50,70,.2)',
  marginTop: '20px',
  maxWidth: '360px',
  margin: '0 auto',
  padding: '68px 0 130px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const button = {
  margin: '20px auto',
  background: '#000000',
  color: '#fff',
  borderRadius: '4px',
  width: '280px',
  padding: '12px 20px',
  textAlign: 'center' as const,
};

const tertiary = {
  color: '#0a85ea',
  fontSize: '11px',
  fontWeight: 700,
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  height: '16px',
  letterSpacing: '0',
  lineHeight: '16px',
  margin: '16px 8px 8px 8px',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
};

const secondary = {
  color: '#000',
  display: 'inline-block',
  fontFamily: 'HelveticaNeue-Medium,Helvetica,Arial,sans-serif',
  fontSize: '20px',
  fontWeight: 500,
  lineHeight: '24px',
  marginBottom: '0',
  marginTop: '0',
  textAlign: 'center' as const,
};

const paragraph = {
  color: '#444',
  fontSize: '15px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  letterSpacing: '0',
  lineHeight: '23px',
  padding: '0 40px',
  margin: '0',
  textAlign: 'center' as const,
};

const link = {
  textDecoration: 'underline',
};
const Paralink = {
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  fontSize: '20px',
  lineHeight: '25px',
  fontWeight: 800,
  textDecoration: 'underline',
};

const footer = {
  color: '#000',
  fontSize: '12px',
  fontWeight: 800,
  letterSpacing: '0',
  lineHeight: '23px',
  margin: '0',
  marginTop: '20px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
};
