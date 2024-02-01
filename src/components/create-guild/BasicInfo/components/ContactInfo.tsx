import {
  Box,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react"
import Button from "components/common/Button"
import FormErrorMessage from "components/common/FormErrorMessage"
import StyledSelect from "components/common/StyledSelect"
import { ArrowSquareOut, Plus, TrashSimple } from "phosphor-react"
import { Controller, useFieldArray, useFormContext } from "react-hook-form"
import { GuildFormType, SelectOption } from "types"

const contactTypeOptions: SelectOption[] = [
  { value: "EMAIL", label: "E-mail" },
  { value: "TELEGRAM", label: "Telegram" },
]

type Props = {
  showAddButton?: boolean
}

const ContactInfo = ({ showAddButton = true }: Props): JSX.Element => {
  const {
    control,
    trigger,
    register,
    getValues,
    resetField,
    formState: { errors },
  } = useFormContext<GuildFormType>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
    keyName: "formId",
  })

  return (
    <>
      <Text colorScheme="gray">
        Only visible to the Guild Team to reach you with support and partnership
        initiatives if needed.
      </Text>
      <Stack maxW={{ base: "full", sm: "md" }}>
        <FormControl isInvalid={!!errors?.contacts?.[0]}>
          <FormLabel whiteSpace={"nowrap"}>E-mail</FormLabel>
          <Stack spacing={0}>
            <Input
              id="contact-email-required"
              isInvalid={!!errors?.contacts?.[0]}
              placeholder="E-mail address"
              {...register(`contacts.0.contact`, {
                required: "E-mail is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Invalid e-mail format",
                },
              })}
              size={"lg"}
            />
            <FormErrorMessage>
              {errors?.contacts?.[0]?.contact?.message}
            </FormErrorMessage>
          </Stack>
        </FormControl>

        {fields.length > 1 && <Divider />}

        {fields.slice(1).map((contactField, index) => {
          index += 1
          return (
            <FormControl
              key={contactField.formId}
              isInvalid={!!errors?.contacts?.[index]}
            >
              <HStack alignItems="start">
                <Box maxW="64">
                  <Controller
                    control={control}
                    name={`contacts.${index}.type`}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <StyledSelect
                        ref={ref}
                        options={contactTypeOptions}
                        value={contactTypeOptions.find((ct) => ct.value === value)}
                        onBlur={() => {
                          trigger()
                          onBlur()
                        }}
                        onChange={(newValue: SelectOption) => {
                          onChange(newValue.value)
                          resetField(`contacts.${index}.contact`)
                        }}
                        size="lg"
                        chakraStyles={{
                          container: {
                            minWidth: "max-content",
                          } as any,
                        }}
                      />
                    )}
                  />
                </Box>

                <Stack spacing={0} w="100%">
                  <InputGroup size="lg">
                    <Input
                      isInvalid={!!errors?.contacts?.[index]}
                      placeholder={
                        getValues(`contacts.${index}.type`) === "EMAIL"
                          ? `E-mail address`
                          : "Phone / Telegram username"
                      }
                      {...register(`contacts.${index}.contact`, {
                        required: "This field is required",
                        pattern:
                          getValues(`contacts.${index}.type`) === "EMAIL"
                            ? {
                                value: /\S+@\S+\.\S+/,
                                message: "Invalid e-mail format",
                              }
                            : undefined,
                      })}
                    />
                    {fields?.length > 1 && (
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          icon={<Icon as={TrashSimple} />}
                          size="xs"
                          rounded="full"
                          aria-label="Remove contact"
                          onClick={() => remove(index)}
                        />
                      </InputRightElement>
                    )}
                  </InputGroup>

                  <FormErrorMessage>
                    {errors?.contacts?.[index]?.contact?.message}
                  </FormErrorMessage>
                </Stack>
              </HStack>
            </FormControl>
          )
        })}

        {showAddButton && (
          <Button
            leftIcon={<Icon as={Plus} />}
            onClick={() =>
              append({
                type: "EMAIL",
                contact: "",
              })
            }
          >
            Add contact
          </Button>
        )}

        {!showAddButton && (
          <Text fontSize="sm" colorScheme="gray">
            Or{" "}
            <Link isExternal href="https://discord.gg/guildxyz">
              <Text as="span">join our Discord</Text>
              <Icon ml={1} as={ArrowSquareOut} />
            </Link>
          </Text>
        )}
      </Stack>
    </>
  )
}

export default ContactInfo
