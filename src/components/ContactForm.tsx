import { CalendarIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useAppState } from "../state/app.context";
import { api } from "../utils/api";
import BackButton from "./BackButton";

type FormValues = {
  name: string;
  email: string;
};

const ContactForm = () => {
  const { state, dispatch } = useAppState();
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();
  const book = api.bookings.book.useMutation();
  const toast = useToast();

  const { token } = router.query;

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    dispatch({
      type: "setBookerDetails",
      email: values.email,
      name: values.name,
    });
    if (typeof token !== "string")
      throw new Error("Invalid token from query string parameter");

    book.mutate(
      {
        email: values.email,
        name: values.name,
        meetingTypeId: state.meetingType?.id ?? "",
        slot: state.slot?.start?.toISOString() ?? "",
        token,
      },
      {
        onSuccess: () => dispatch({ type: "nextStep" }),
        onError: (err) => {
          console.error(err);
          toast({
            status: "error",
            title: "Something went wrong. Please try again",
          });
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={!!errors.name}>
        <FormLabel htmlFor="name" textColor={"gray.300"} mb={1}>
          Your name
        </FormLabel>
        <Input
          minW={"sm"}
          _focusVisible={{
            borderColor: "brand.500",
          }}
          id="name"
          placeholder="Jane Doe"
          {...register("name", {
            required: "This is required",
            minLength: { value: 4, message: "Minimum length should be 4" },
          })}
        />
        <FormErrorMessage>
          {errors.name && <Text>{errors.name.message?.toString()}</Text>}
        </FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!errors.email} mt={4}>
        <FormLabel htmlFor="email" textColor={"gray.300"} mb={1}>
          Email address
        </FormLabel>
        <Input
          minW={"sm"}
          _focusVisible={{
            borderColor: "brand.500",
          }}
          id="email"
          placeholder="email@example.com"
          {...register("email", {
            required: "This is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Entered value is not an email address",
            },
          })}
          type="email"
        />
        <FormErrorMessage>
          {errors.email && <Text>{errors.email.message?.toString()}</Text>}
        </FormErrorMessage>
      </FormControl>

      <HStack mt={8} justifyContent="center">
        <BackButton />
        <Button
          type="submit"
          isLoading={isSubmitting}
          variant="solid"
          ml={4}
          leftIcon={<CalendarIcon />}
        >
          Book
        </Button>
      </HStack>
    </form>
  );
};

export default ContactForm;
