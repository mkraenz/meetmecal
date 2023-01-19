import { Skeleton, VStack } from "@chakra-ui/react";
import { type NextPage } from "next";
import Head from "next/head";
import AddAvailability from "../../components/admin/availabilities/AddAvailability";
import { api } from "../../utils/api";

interface Props {}

const BookingsAdmin: NextPage<Props> = (props) => {
  const bookings = api.bookingsAdmin.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Admin MeetMeCal - Bookings</title>
      </Head>
      <VStack as="main" pt={20} gap={4}>
        <Skeleton
          isLoaded={!bookings.isLoading}
          minH="200px"
          rounded={"lg"}
          minW={"md"}
        >
          <pre>{JSON.stringify(bookings.data, null, 2)}</pre>
          {/* <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>From</Th>
                  <Th>To</Th>
                  <Th>Delete</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(availabilities.data || []).map(({ start, end }) => (
                  <Tr key={start}>
                    <Td>{formatDateOnly(start)}</Td>
                    <Td>{formatTime(start)}</Td>
                    <Td>{formatTime(end)}</Td>
                    <Td>
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label="Delete availability"
                        onClick={() => deleteAvailability(end)}
                      ></IconButton>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer> */}
        </Skeleton>
        <AddAvailability />
      </VStack>
    </>
  );
};

export default BookingsAdmin;
