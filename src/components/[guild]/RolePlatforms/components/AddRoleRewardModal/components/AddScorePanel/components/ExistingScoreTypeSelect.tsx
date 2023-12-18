import {
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react"
import ControlledSelect from "components/common/ControlledSelect"
import FormErrorMessage from "components/common/FormErrorMessage"
import OptionImage from "components/common/StyledSelect/components/CustomSelectOption/components/OptionImage"
import { useFormContext } from "react-hook-form"
import Star from "static/icons/star.svg"

const ExistingScoreTypeSelect = ({ existingScoreRewards, selectedExistingId }) => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext()

  const options = existingScoreRewards
    .map((gp) => ({
      label: gp.platformGuildData.name || "points",
      value: gp.id,
      img: gp.platformGuildData.imageUrl ?? <Star />,
    }))
    .concat({
      label: "Create new",
      value: null,
    })

  const selectedScoreImage = options.find(
    (option) => option.value === selectedExistingId
  )?.img

  return (
    <FormControl isInvalid={!!errors?.guildPlatformId} mb="5">
      <FormLabel>Score type</FormLabel>
      <InputGroup w={{ md: "230px" }}>
        {selectedScoreImage && (
          <InputLeftElement>
            {typeof selectedScoreImage === "string" ? (
              <OptionImage img={selectedScoreImage} alt="Score icon" />
            ) : (
              selectedScoreImage
            )}
          </InputLeftElement>
        )}
        <ControlledSelect
          name={`guildPlatformId`}
          control={control}
          options={options}
          beforeOnChange={(newValue) => {
            setValue("guildPlatformId", newValue?.label, {
              shouldDirty: false,
            })
          }}
        />
      </InputGroup>
      <FormErrorMessage>
        {errors?.guildPlatformId?.message as string}
      </FormErrorMessage>
    </FormControl>
  )
}

export default ExistingScoreTypeSelect
