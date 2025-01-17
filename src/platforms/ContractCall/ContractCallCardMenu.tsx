import EditRewardAvailabilityMenuItem from "components/[guild]/AccessHub/components/EditRewardAvailabilityMenuItem"
import RemovePlatformMenuItem from "components/[guild]/AccessHub/components/RemovePlatformMenuItem"
import useGuild from "components/[guild]/hooks/useGuild"
import PlatformCardMenu from "components/[guild]/RolePlatforms/components/PlatformCard/components/PlatformCardMenu"
import EditNFTDescriptionModal from "components/[guild]/RoleCard/components/EditNFTDescriptionModal"
import { MenuItem, useDisclosure } from "@chakra-ui/react"
import { PencilSimple } from "phosphor-react"

type Props = {
  platformGuildId: string
}

const ContractCallCardMenu = ({ platformGuildId }: Props): JSX.Element => {
  const { guildPlatforms } = useGuild()
  const guildPlatform = guildPlatforms?.find(
    (gp) => gp.platformGuildId === platformGuildId
  )

  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <PlatformCardMenu>
        <MenuItem icon={<PencilSimple />} onClick={onOpen}>
          Edit NFT description
        </MenuItem>
        <EditRewardAvailabilityMenuItem platformGuildId={platformGuildId} />
        <RemovePlatformMenuItem platformGuildId={platformGuildId} />
      </PlatformCardMenu>

      <EditNFTDescriptionModal
        isOpen={isOpen}
        onClose={onClose}
        guildPlatform={guildPlatform}
      />
    </>
  )
}

export default ContractCallCardMenu
