import { CheckIcon } from "@chakra-ui/icons";
import {
  Divider,
  Heading,
  SlideFade,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tr,
  VStack,
} from "@chakra-ui/react";
import type { FC, ReactNode } from "react";
import { env } from "../env/client.mjs";
import { useAppState } from "../state/app.context";
import {
  formatDateOnly,
  formatTime,
  formatTimezone,
} from "../utils/date.utils";

interface Props {
  visible: boolean;
}

const SecondaryText: FC<{ children: ReactNode; inline?: boolean }> = ({
  children,
  inline = false,
}) => (
  <Text
    color="gray.300"
    as={inline ? "span" : undefined}
    display={inline ? "inline" : undefined}
  >
    {children}
  </Text>
);

const TableHeaderColumn: FC<{ children?: ReactNode }> = ({ children }) => (
  <Td fontWeight={"bold"} verticalAlign="text-top">
    {children}
  </Td>
);

const BookingConfirmation: FC<Props> = ({ visible }) => {
  const { state } = useAppState();
  return (
    <SlideFade
      in={visible}
      offsetX={"200px"}
      hidden={!visible}
      transition={{ enter: { duration: 0.3 } }}
    >
      <VStack gap={2}>
        <CheckIcon
          color="brand.500"
          boxSize={40}
          p={5}
          border={"4px"}
          borderRadius={"50%"}
        />
        <Heading as="h2" size="md">
          Meeting scheduled successfully.
        </Heading>

        <Text>We emailed you a calendar invitation with the details.</Text>
        <Divider />
        <TableContainer>
          <Table variant="unstyled">
            <Tbody>
              <Tr>
                <TableHeaderColumn>What</TableHeaderColumn>
                <Td>{state.meetingType?.displayName}</Td>
              </Tr>
              <Tr>
                <TableHeaderColumn>Who</TableHeaderColumn>
                <Td wordBreak={"break-all"}>
                  {state.bookerName}{" "}
                  <SecondaryText>({state.bookerEmail})</SecondaryText>
                </Td>
              </Tr>
              <Tr>
                <TableHeaderColumn />
                <Td wordBreak={"break-all"}>
                  {env.NEXT_PUBLIC_MY_NAME}{" "}
                  <SecondaryText>
                    ({env.NEXT_PUBLIC_MY_COMPANY_EMAIL})
                  </SecondaryText>
                </Td>
              </Tr>
              <Tr>
                <TableHeaderColumn>When</TableHeaderColumn>
                {state.slot && (
                  <Td>
                    {formatDateOnly(state.slot.start)}
                    <Text>
                      {`${formatTime(state.slot.start)} - ${formatTime(
                        state.slot.end
                      )}`}{" "}
                      <SecondaryText inline={true}>
                        ({formatTimezone()})
                      </SecondaryText>
                    </Text>
                  </Td>
                )}
              </Tr>
              <Tr>
                <TableHeaderColumn>Where</TableHeaderColumn>
                <Td>Via phone. See email for details.</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>
    </SlideFade>
  );
};

export default BookingConfirmation;
