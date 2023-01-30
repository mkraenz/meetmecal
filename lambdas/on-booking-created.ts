import { unmarshall } from "@aws-sdk/util-dynamodb";
import { createTransport } from "nodemailer";
import type { EmailConfig } from "./email-config.dto";
import { getEmailConfig } from "./email-config.dto";

type Booking = {
  contact: {
    name: string;
    email: string;
  };
  start: Date;
  end: Date;
  meetingType: {
    displayName: string;
  };
};

export const lambdaHandler = async (
  rawEvent: {
    dynamodb: { NewImage: Record<string, any> };
  }[]
): Promise<void> => {
  try {
    const event = rawEvent[0];
    // @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_util_dynamodb.html
    const booking = unmarshall(event.dynamodb.NewImage) as Booking; // TODO validate that its a Booking

    const cfg = await getEmailConfig();
    const emailToGuest = getEmail(booking, cfg, booking.contact.email);
    const mailer = getTransport(cfg);
    const sendEmailResult = await mailer.sendMail(emailToGuest);
    console.log({ msg: "email sent", sendEmailResult });

    const emailToMe = getEmail(booking, cfg, cfg.myEmail);
    const sendEmailToMeResult = await mailer.sendMail(emailToMe);
    console.log({ msg: "email sent", sendEmailToMeResult });
  } catch (err: unknown) {
    console.error(err);
  }
};

const getTransport = ({ host, port, useSsl, user, password }: EmailConfig) => {
  return createTransport({
    host,
    port,
    secure: useSsl,
    auth: {
      user,
      pass: password,
    },
  });
};

const getEmail = (booking: Booking, mailCfg: EmailConfig, to: string) => {
  return {
    from: {
      name: mailCfg.myName,
      address: mailCfg.fromAddress,
    },
    to,
    subject: `${booking.meetingType.displayName}: ${mailCfg.myName} and ${booking.contact.name}`,
    text: `Hi ${
      booking.contact.name
    }. Our meeting is scheduled.\n\n\From: ${booking.start.toLocaleString()}\nTo: ${booking.end.toLocaleString()}\n\nLooking forward to meet you.\n\n${
      mailCfg.myName
    }`,
  };
};
