import { Tooltip } from "@chakra-ui/react"
import useGuild from "components/[guild]/hooks/useGuild"
import Button from "components/common/Button"
import { GuildPlatform, PlatformType, RolePlatformStatus } from "types"
import {
  getRolePlatformStatus,
  getRolePlatformTimeframeInfo,
} from "utils/rolePlatformHelpers"
import { useClaimedReward } from "../../hooks/useClaimedReward"
import useClaimText, { ClaimTextModal } from "./hooks/useClaimText"

type Props = {
  platform: GuildPlatform
}

export const claimTextButtonTooltipLabel: Record<
  RolePlatformStatus,
  string | undefined
> = {
  ALL_CLAIMED: "All available rewards have already been claimed",
  NOT_STARTED: "Claim hasn't started yet",
  ENDED: "Claim already ended",
  ACTIVE: undefined,
}

const TextCardButton = ({ platform }: Props) => {
  const { roles } = useGuild()

  const rolePlatform = roles
    ?.find((r) => r.rolePlatforms.some((rp) => rp.guildPlatformId === platform.id))
    ?.rolePlatforms?.find((rp) => rp.guildPlatformId === platform?.id)
  const {
    onSubmit,
    isLoading,
    error,
    response,
    modalProps: { isOpen, onOpen, onClose },
  } = useClaimText(rolePlatform?.id)
  const { claimed } = useClaimedReward(rolePlatform.id)

  const { inActiveTimeframe: isButtonDisabled } = getRolePlatformTimeframeInfo(
    rolePlatform,
    !claimed
  )

  return (
    <>
      <Tooltip
        isDisabled={!isButtonDisabled}
        label={claimTextButtonTooltipLabel[getRolePlatformStatus(rolePlatform)]}
        hasArrow
        shouldWrapChildren
      >
        <Button
          onClick={() => {
            onOpen()
            if (!response) onSubmit()
          }}
          isLoading={isLoading}
          loadingText="Claiming secret..."
          isDisabled={isButtonDisabled}
          w="full"
        >
          {platform.platformId === PlatformType.UNIQUE_TEXT
            ? "Claim"
            : "Reveal secret"}
        </Button>
      </Tooltip>

      <ClaimTextModal
        title={platform.platformGuildData.name}
        isOpen={isOpen}
        onClose={onClose}
        isLoading={isLoading}
        error={error}
        response={response}
      />
    </>
  )
}

export default TextCardButton
