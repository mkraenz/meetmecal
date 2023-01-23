import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/popover";
import { Button, Text, useOutsideClick } from "@chakra-ui/react";
import type { FC } from "react";
import React, { useRef } from "react";

interface Props {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement> | undefined;
  popperPos: {
    top: number;
    left: number;
  };
  eventType: "availability" | "booking";
  onAvailabilityEventDelete: () => void;
  availabilityDeleteIsLoading: boolean;
}

const EventPopper: FC<Props> = ({
  isOpen,
  onOpen,
  onClose,
  buttonRef,
  popperPos,
  eventType,
  onAvailabilityEventDelete,
  availabilityDeleteIsLoading,
}) => {
  const ref = useRef(null);
  useOutsideClick({ ref, handler: onClose });
  return (
    <Popover placement="top-start" isOpen={isOpen}>
      <PopoverTrigger>
        {/* dirty WORKAROUND: we need some PopoverTrigger as anchor. So we just set this invisible button to the click position, and then programmatically click the button. */}
        <Button
          onClick={onOpen}
          ref={buttonRef}
          position={"absolute"}
          top={popperPos.top}
          left={popperPos.left}
          visibility="hidden"
        ></Button>
      </PopoverTrigger>
      <PopoverContent ref={ref}>
        <PopoverHeader fontWeight="semibold" textColor={"alternateText"}>
          {eventType === "availability" ? "Delete availability?" : "Booking"}
        </PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton onClick={onClose} />
        <PopoverBody>
          {eventType === "availability" ? (
            <Button
              onClick={onAvailabilityEventDelete}
              isLoading={availabilityDeleteIsLoading}
              bgColor="brand.500"
            >
              Delete
            </Button>
          ) : (
            <Text textColor={"alternateText"}>No actions available</Text>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default EventPopper;
