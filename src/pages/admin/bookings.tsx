import { CalendarIcon, EmailIcon } from "@chakra-ui/icons";
import {
  Heading,
  HStack,
  Link,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { type NextPage } from "next";
import Head from "next/head";
import type { FC } from "react";
import type { BookingEntity } from "../../server/db";
import { api } from "../../utils/api";
import { formatDateOnly, formatTime } from "../../utils/date.utils";

interface Props {}

const Booking: FC<{ booking: BookingEntity }> = ({ booking }) => {
  return (
    <VStack
      key={booking.start.toISOString()}
      alignItems={"flex-start"}
      minW={"md"}
    >
      <Heading size="sm">
        {booking.contact.name}: {booking.meetingType.displayName}
      </Heading>
      <VStack alignItems={"flex-start"} minW={"md"} pl={8}>
        <HStack>
          <CalendarIcon />
          <Text>
            {`${formatDateOnly(booking.start)} at ${formatTime(
              booking.start
            )} - ${formatTime(booking.end)}`}
          </Text>
        </HStack>
        <HStack>
          <EmailIcon />
          <Link
            href={`mailto:${booking.contact.email}`}
            isExternal
            referrerPolicy={"no-referrer"}
            target={"_blank"}
          >
            {booking.contact.email}
          </Link>
        </HStack>
      </VStack>
    </VStack>
  );
};

const BookingsAdmin: NextPage<Props> = (props) => {
  const bookings = api.bookingsAdmin.getAll.useQuery();
  const upcomingMeetings =
    bookings.data?.filter((b) => b.end > new Date()) || [];
  const pastMeetings = bookings.data?.filter((b) => b.end <= new Date()) || [];

  return (
    <>
      <Head>
        <title>Admin MeetMeCal - Bookings</title>
      </Head>
      <VStack as="main" pt={20} gap={4} mb={16}>
        <Skeleton
          isLoaded={!bookings.isLoading}
          minH="200px"
          rounded={"lg"}
          minW={"md"}
        >
          <Heading mt={8} mb={8} textAlign="center">
            Upcoming Meetings
          </Heading>
          <VStack gap={4}>
            {upcomingMeetings.map((booking) => (
              <Booking booking={booking} key={booking.start.getTime()} />
            ))}
          </VStack>

          <Heading mt={8} mb={8} textAlign="center">
            Past Meetings
          </Heading>
          <VStack gap={4}>
            {pastMeetings.map((booking) => (
              <Booking booking={booking} key={booking.start.getTime()} />
            ))}
          </VStack>
        </Skeleton>
      </VStack>
    </>
  );
};

export default BookingsAdmin;
