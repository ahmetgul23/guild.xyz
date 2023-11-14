import { ModalBody, ModalCloseButton, ModalHeader } from "@chakra-ui/react"
import CreateNftForm from "components/[guild]/RolePlatforms/components/AddRoleRewardModal/components/AddContractCallPanel/components/CreateNftForm"
import { useCreateGuildContext } from "components/create-guild/CreateGuildContext"
import { useFieldArray, useFormContext } from "react-hook-form"
import CreatePlatformModalWrapper from "./CreatePlatformModalWrapper"

const CreateGuildContractCall = (): JSX.Element => {
  const { control } = useFormContext()
  const { setPlatform } = useCreateGuildContext()
  const { append } = useFieldArray({
    control,
    name: "guildPlatforms",
  })

  return (
    <CreatePlatformModalWrapper size="3xl">
      <ModalHeader>Create NFT</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <CreateNftForm
          onSuccess={(newGuildPlatform) => {
            append(newGuildPlatform)
            setPlatform(null)
          }}
        />
      </ModalBody>
    </CreatePlatformModalWrapper>
  )
}

export default CreateGuildContractCall
