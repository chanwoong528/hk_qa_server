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
} from "@react-email/components";
import * as React from "react";

interface DropboxResetPasswordEmailProps {
  userFirstname?: string;
  resetPasswordLink?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const ForGotPassword = ({

  username,
  token,
  homepageUrl,

}) => {
  return (
    <Html>
      <Head />
      <Preview>Dropbox reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`https://hk-qa-bucket.s3.ap-northeast-2.amazonaws.com/hiq_logo.png`}
            width="212"
            height="88"

          />
          <Section>
            <Text style={text}>Hi {username},</Text>
            <Button style={button} href={`${homepageUrl}/reset-password?token=${token}`}>
              Reset password
            </Button>
            <Text style={text}>
              If you don&apos;t want to change your password or didn&apos;t
              request this, just ignore and delete this message.
            </Text>
          </Section>
          <Text style={paragraph}>
            Contact{" "}
            <Link href="mailto:mooncw@hankookilbo.com" style={link}>
              mooncw@hankookilbo.com
            </Link>{" "}
            if you did not request this code.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

ForGotPassword.PreviewProps = {
  username: "test",
  token: "test::token",
  homepageUrl: "http://localhost:4321",
} as DropboxResetPasswordEmailProps;

export default ForGotPassword;

const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
};
const link = {
  textDecoration: "underline",
};
const paragraph = {
  color: "#444",
  fontSize: "15px",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  letterSpacing: "0",
  lineHeight: "23px",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  padding: "45px",
};

const text = {
  fontSize: "16px",
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: "300",
  color: "#404040",
  lineHeight: "26px",
};

const button = {
  backgroundColor: "#007ee6",
  borderRadius: "4px",
  color: "#fff",
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "210px",
  padding: "14px 7px",
};

const anchor = {
  textDecoration: "underline",
};