import {
  Collapse,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Img,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import Button from "components/common/Button"
import FormErrorMessage from "components/common/FormErrorMessage"
import Link from "components/common/Link"
import { Question } from "phosphor-react"
import platforms from "platforms/platforms"
import { useEffect } from "react"
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form"
import usePoapById from "requirements/Poap/hooks/usePoapById"
import { Visibility } from "types"
import UploadMintLinks from "./components/UploadMintLinks"

type Props = {
  onSuccess: () => void
}

export type ImportPoapForm = {
  eventId: string
  fancyId: string
  name: string
  imageUrl: string
  startTime: string
  endTime: string
  texts: string[]
}

const defaultValues: ImportPoapForm = {
  eventId: null,
  fancyId: "",
  name: "",
  imageUrl: "",
  startTime: null,
  endTime: null,
  texts: [],
}

const AddPoapPanel = ({ onSuccess }: Props) => {
  const methods = useForm<ImportPoapForm>({
    defaultValues,
  })
  const {
    control,
    register,
    setValue,
    reset,
    formState: { errors },
    setError,
    clearErrors,
    handleSubmit,
  } = methods

  const eventId = useWatch({ control, name: "eventId" })
  const name = useWatch({ control, name: "name" })
  const texts = useWatch({ control, name: "texts" })

  const { isPoapByIdLoading, poap, error } = usePoapById(eventId)

  useEffect(() => {
    clearErrors("eventId")
    if (poap) return
    if (error) {
      setError("eventId", {
        type: "validate",
        message: "POAP not found",
      })
    }
  }, [poap, error])

  useEffect(() => {
    if (!poap) {
      reset({ ...defaultValues, eventId, texts })
      return
    }

    setValue("name", poap.name)
    setValue("fancyId", poap.fancy_id)
    setValue("imageUrl", poap.image_url)
    setValue("startTime", new Date(poap.start_date).toISOString())
    setValue("endTime", new Date(poap.expiry_date).toISOString())
  }, [poap])

  const roleVisibility: Visibility = useWatch({ name: ".visibility" })
  const { append } = useFieldArray({
    name: "rolePlatforms",
  })

  const onContinue = (data: ImportPoapForm) => {
    append({
      guildPlatform: {
        platformName: "POAP",
        platformGuildId: `poap-${data.eventId}`,
        platformGuildData: {
          texts: data.texts?.filter(Boolean) ?? [],
          name: data.name,
          eventId: +data.eventId,
          fancyId: data.fancyId,
          imageUrl: data.imageUrl,
        },
      },
      startTime: data.startTime,
      endTime: data.endTime,
      isNew: true,
      visibility: roleVisibility,
    })
    onSuccess()
  }

  return (
    <FormProvider {...methods}>
      <Stack spacing={6}>
        <Text colorScheme="gray" fontWeight="semibold">
          Please create a new drop and request mint links on{" "}
          <Link
            href="https://drops.poap.xyz/en-GB/drop/create"
            isExternal
            colorScheme={platforms.POAP.colorScheme}
          >
            POAP.xyz
          </Link>
          , then import it below to distribute it with Guild!
        </Text>

        <FormControl isInvalid={!!errors?.eventId}>
          <FormLabel>
            <HStack>
              <Text as="span">Event ID:</Text>
              <Tooltip
                label="You can find the event ID next to the POAP drop image in the confirmation email"
                placement="top"
                hasArrow
              >
                <Icon as={Question} color="GrayText" />
              </Tooltip>
            </HStack>
          </FormLabel>
          <HStack>
            <InputGroup maxW={{ base: 40, sm: 52 }}>
              <Input {...register("eventId")} placeholder="149863" />
              {isPoapByIdLoading && (
                <InputRightElement>
                  <Spinner size="sm" />
                </InputRightElement>
              )}
            </InputGroup>
          </HStack>

          <FormErrorMessage>{errors?.eventId?.message}</FormErrorMessage>

          <Collapse in={!!poap && !isPoapByIdLoading}>
            <HStack pt={2}>
              <Img
                src={`${poap?.image_url}?size=small`}
                alt={poap?.name}
                boxSize={6}
                rounded="full"
              />
              <Text as="span" fontSize="sm" fontWeight="semibold" color="gray">
                {poap?.name}
              </Text>
            </HStack>
          </Collapse>
        </FormControl>

        <UploadMintLinks isOptional />

        <Button
          colorScheme="indigo"
          isDisabled={!eventId || !name?.length}
          w="max-content"
          ml="auto"
          onClick={handleSubmit(onContinue)}
        >
          Continue
        </Button>
      </Stack>
    </FormProvider>
  )
}

export default AddPoapPanel
