import { Button } from "@chakra-ui/react"
import useUser from "components/[guild]/hooks/useUser"
import { useCreateGuildContext } from "components/create-guild/CreateGuildContext"
import UniqueTextDataForm, {
  UniqueTextRewardForm,
} from "platforms/UniqueText/UniqueTextDataForm"
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form"
import { GuildFormType } from "types"
import CreatePlatformModalWrapper from "./CreatePlatformModalWrapper"

const CreateGuildUniqueText = () => {
  const { id: userId } = useUser()

  const { nextStep } = useCreateGuildContext()

  const { setValue } = useFormContext<GuildFormType>()
  const methods = useForm<UniqueTextRewardForm>({ mode: "all" })

  const name = useWatch({ control: methods.control, name: "name" })
  const texts = useWatch({ control: methods.control, name: "texts" })
  const imageUrl = useWatch({ control: methods.control, name: "imageUrl" })

  return (
    <CreatePlatformModalWrapper>
      <FormProvider {...methods}>
        <UniqueTextDataForm />
      </FormProvider>
      <Button
        colorScheme="green"
        isDisabled={!name?.length}
        onClick={() => {
          setValue("guildPlatforms.0", {
            platformName: "UNIQUE_TEXT",
            platformGuildId: `unique-text-${userId}-${Date.now()}`,
            platformGuildData: {
              texts: texts?.filter(Boolean) ?? [],
              name,
              imageUrl,
            },
          })
          nextStep()
        }}
      >
        Add{/*nextStepText*/}
      </Button>
    </CreatePlatformModalWrapper>
  )
}
export default CreateGuildUniqueText
