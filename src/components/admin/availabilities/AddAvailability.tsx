import { CalendarIcon } from "@chakra-ui/icons";
import { Button, Heading, HStack, VStack } from "@chakra-ui/react";
import type { FC } from "react";
import { useState } from "react";
import { api } from "../../../utils/api";

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

interface Props {}

type FormValues = {
  start: string;
  end: string;
};

const AddAvailability: FC<Props> = (props) => {
  const create = api.availabilitiesAdmin.create.useMutation();
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());

  const onSubmit = async () => {
    await create.mutateAsync({
      start: start.toISOString(),
      end: end.toISOString(),
    });
  };

  return (
    <VStack gap={2}>
      <Heading size="md">Add Availability</Heading>
      <DatePicker
        selected={start}
        onChange={(x) => {
          if (x) setStart(x);
        }}
        showTimeSelect
        dateFormat="MMMM d, yyyy h:mm aa"
        minDate={new Date()}
      />
      <DatePicker
        selected={end}
        onChange={(x) => {
          if (x) setEnd(x);
        }}
        showTimeSelect
        dateFormat="MMMM d, yyyy h:mm aa"
        minDate={new Date()}
      />

      <HStack mt={8} justifyContent="center">
        <Button
          variant="solid"
          ml={4}
          leftIcon={<CalendarIcon />}
          onClick={onSubmit}
        >
          Add
        </Button>
      </HStack>
    </VStack>
  );
};

export default AddAvailability;
