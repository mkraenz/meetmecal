import { Heading, useColorModeValue, VStack } from "@chakra-ui/react";
import { Interval } from "luxon";
import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import Head from "next/head";
import { useMemo } from "react";
import BookingConfirmation from "../components/BookingConfirmation";
import Calendar from "../components/Calendar";
import Contact from "../components/Contact";
import MeetingTypeSelector from "../components/MeetingTypeSelector";
import { env as clientEnv } from "../env/client.mjs";
import { env } from "../env/server.mjs";
import type { AvailabilityEntity, MeetingTypeEntity } from "../server/db";
import { AvailabilityDb, MeetingTypeDb } from "../server/db";
import type { Availability, MeetingType, Slot } from "../state/app.context";
import { useAppState } from "../state/app.context";

const MAX_MEETING_INTERVAL_IN_MINS = 30; // e.g. 90 min meeting slots will be calculated as 16:00-17:30, 16:30-18:00, 17:00-18:30 etc. 15 min meeting slots will use 16:00, 16:15, 16:30 etc

const MAX_WHILE_LOOPS = 50;
interface Props {
  meetingTypes: MeetingType[];
  availabilies: Availability[];
  headTitle: string;
}

const Home: NextPage<Props> = (props) => {
  const subheadingColor = useColorModeValue("gray.300", "gray.300");
  const { state } = useAppState();

  const slots = useMemo<Slot[]>(() => {
    const durationInMins = state.meetingType?.durationInMins ?? 100000;
    const myslots = props.availabilies.flatMap((av) => {
      const baseInterval = Interval.fromISO(`${av.start}/${av.end}`);
      const usedStep = Math.min(MAX_MEETING_INTERVAL_IN_MINS, durationInMins);

      const slotsInInterval = [];
      let counter = 0;
      let restInterval = baseInterval;
      while (
        restInterval.length("minutes") >= durationInMins ||
        counter > MAX_WHILE_LOOPS
      ) {
        counter++;
        const start = restInterval.start;
        const end = start.plus({ minutes: durationInMins });
        slotsInInterval.push(Interval.fromDateTimes(start, end));

        restInterval = Interval.fromDateTimes(
          restInterval.start.plus({ minutes: usedStep }),
          restInterval.end
        );
        console.log(restInterval.toISO());
      }

      return slotsInInterval;
    });
    return myslots.map((s) => ({
      start: s.start.toJSDate(),
      end: s.end.toJSDate(),
    }));
  }, [state.meetingType, props.availabilies]);

  return (
    <>
      <Head>
        {/* TODO Warning: A title element received an array with more than 1 element as children. In browsers title Elements can only have Text Nodes as children. If the children being rendered output more than a single text node in aggregate the browser will display markup and comments as text in the title and hydration will likely fail and fall back to client rendering */}
        <title>{props.headTitle}</title>
        <meta
          name="description"
          content={`Book a meeting with ${clientEnv.NEXT_PUBLIC_MY_FIRST_NAME}`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <VStack as="main" pt={20} gap={4}>
        <VStack pb={10}>
          <Heading as="h1" size={"xl"}>
            {clientEnv.NEXT_PUBLIC_MY_NAME}
          </Heading>
          <Heading as="h2" size={"md"} textColor={subheadingColor}>
            TypeScript Software Product Developer
          </Heading>
        </VStack>
        <MeetingTypeSelector
          types={props.meetingTypes}
          visible={state.step === 0}
        />
        <Calendar slots={slots} visible={state.step === 1} />
        <Contact visible={state.step === 2} />
        <BookingConfirmation visible={state.step === 3} />
      </VStack>
    </>
  );
};

class MeetingTypeDto {
  static from(meetingType: MeetingTypeEntity) {
    return {
      id: meetingType.id,
      displayName: meetingType.displayName,
      durationInMins: meetingType.durationInMins,
    };
  }
}

class AvailabilityDto {
  static from(availability: AvailabilityEntity) {
    return {
      start: availability.start.toISOString(),
      end: availability.end.toISOString(),
    };
  }
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const availabilities = await AvailabilityDb.find({ pk: "availability" });
  const meetingTypes = await MeetingTypeDb.find({ pk: "meetingtype" });
  // const bookerRes = await fetch(`${env.BACKEND_BASE_URL}/booker`);
  // const bookerData = await bookerRes.json();
  const data = {
    meetingTypes: meetingTypes.map(MeetingTypeDto.from),
    availabilies: availabilities.map(AvailabilityDto.from),
  };
  return {
    props: {
      ...data,
      // injecting head title for SSR. Otherwise title flickers + warning in console
      headTitle: `Meet ${env.MY_FIRST_NAME}`,
    },
  };
};

export default Home;
