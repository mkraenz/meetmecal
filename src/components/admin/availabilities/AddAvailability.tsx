import { CalendarIcon } from "@chakra-ui/icons";
import { Button, Heading, HStack, VStack } from "@chakra-ui/react";
import type { FC } from "react";
import { useState } from "react";
import { api } from "../../../utils/api";

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

interface Props {}

const AddAvailability: FC<Props> = () => {
  const availabilities = api.availabilitiesAdmin.getAll.useQuery();
  const create = api.availabilitiesAdmin.create.useMutation();
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());

  const onSubmit = () => {
    create.mutate(
      {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      {
        onSuccess: () => availabilities.refetch(),
      }
    );
  };

  return (
    <VStack gap={2}>
      <Heading size="md">Add Availability</Heading>
      <DatePicker
        selected={start}
        onChange={(date) => {
          if (date) setStart(date);
        }}
        showTimeSelect
        dateFormat="MMMM d, yyyy h:mm aa"
        minDate={new Date()}
      />
      <DatePicker
        selected={end}
        onChange={(date) => {
          if (!date) return;
          // time-only picker only returns today's date + selected time. need to convert to the
          const endTimeAtStartDate = `${start.toISOString().slice(0, 11)}${date
            .toISOString()
            .slice(11)}`;
          setEnd(new Date(endTimeAtStartDate));
        }}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={30}
        timeFormat="h:mm aa"
        timeCaption="Time"
        dateFormat="h:mm aa"
        minDate={new Date()}
      />

      <HStack mt={8} justifyContent="center">
        <Button
          variant="solid"
          ml={4}
          leftIcon={<CalendarIcon />}
          onClick={onSubmit}
          isLoading={create.isLoading || availabilities.isLoading}
        >
          Add
        </Button>
      </HStack>
    </VStack>
  );
};

export default AddAvailability;
