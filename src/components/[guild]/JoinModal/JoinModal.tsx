import {
  Collapse,
  Divider,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  StackProps,
  VStack,
} from "@chakra-ui/react"
import useGuild from "components/[guild]/hooks/useGuild"
import useWeb3ConnectionManager from "components/_app/Web3ConnectionManager/hooks/useWeb3ConnectionManager"
import { Error } from "components/common/Error"
import { Modal } from "components/common/Modal"
import ModalButton from "components/common/ModalButton"
import DynamicDevTool from "components/create-guild/DynamicDevTool"
import useShowErrorToast from "hooks/useShowErrorToast"
import dynamic from "next/dynamic"
import platforms from "platforms/platforms"
import { ComponentType } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { PlatformName, RequirementType } from "types"
import ConnectPlatform from "./components/ConnectPlatform"
import SatisfyRequirementsJoinStep, {
  ProgressJoinStep,
} from "./components/SatisfyRequirementsJoinStep"
import ShareSocialsCheckbox from "./components/ShareSocialsCheckbox"
import WalletAuthButton from "./components/WalletAuthButton"
import useJoin from "./hooks/useJoin"
import processJoinPlatformError from "./utils/processJoinPlatformError"

type Props = {
  isOpen: boolean
  onClose: () => void
}

type ExtractPrefix<T> = T extends `${infer Prefix}_${string}` ? Prefix : T
type Joinable = PlatformName | ExtractPrefix<RequirementType>

const JOIN_STEP_VSTACK_PROPS: StackProps = {
  spacing: "3",
  alignItems: "stretch",
  w: "full",
  divider: <Divider />,
  mb: "3",
}

const customJoinStep: Partial<Record<Joinable, ComponentType<unknown>>> = {
  POLYGON: dynamic(() => import("./components/ConnectPolygonIDJoinStep")),
  CAPTCHA: dynamic(() => import("./components/CompleteCaptchaJoinStep")),
}

const JoinModal = ({ isOpen, onClose }: Props): JSX.Element => {
  const { isWeb3Connected } = useWeb3ConnectionManager()
  const { name, requiredPlatforms, featureFlags } = useGuild()

  const methods = useForm({
    mode: "all",
    defaultValues: {
      platforms: {},
      ...(featureFlags.includes("CRM") ? { shareSocials: true } : {}),
    },
  })
  const { handleSubmit } = methods

  const renderedSteps = (requiredPlatforms ?? []).map((platform) => {
    if (!platforms[platform] || platform === "POINTS" || platform === "POLYGON_ID")
      return null

    if (platform in customJoinStep) {
      const ConnectComponent = customJoinStep[platform]
      return <ConnectComponent key={platform} />
    }

    return <ConnectPlatform key={platform} platform={platform as PlatformName} />
  })

  const errorToast = useShowErrorToast()

  const {
    isLoading,
    onSubmit,
    error: joinError,
    response,
    joinProgress,
    reset,
  } = useJoin(
    (res) => {
      methods.setValue("platforms", {})
      if (res.success) onClose()
    },
    (err) => {
      errorToast(err)
      reset()
    }
  )

  const isManagingRolesOrRewards =
    response?.success !== false &&
    (joinProgress?.state === "MANAGING_ROLES" ||
      joinProgress?.state === "MANAGING_REWARDS" ||
      joinProgress?.state === "FINISHED")

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <FormProvider {...methods}>
          <ModalHeader>Join {name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Error error={joinError} processError={processJoinPlatformError} />

            <Collapse in={!isManagingRolesOrRewards}>
              <VStack {...JOIN_STEP_VSTACK_PROPS}>
                <WalletAuthButton />
                {renderedSteps}
              </VStack>
            </Collapse>

            {!isManagingRolesOrRewards && <Divider mb={3} />}

            <SatisfyRequirementsJoinStep
              mb={isManagingRolesOrRewards ? "2.5" : "8"}
              spacing={isManagingRolesOrRewards ? "2.5" : "2"}
              isLoading={isLoading}
              hasNoAccessResponse={response?.success === false}
              onClose={onClose}
              joinState={joinProgress}
            />

            {isManagingRolesOrRewards && <Divider my={2.5} />}

            <Collapse in={isManagingRolesOrRewards}>
              <VStack {...JOIN_STEP_VSTACK_PROPS} spacing={2.5} mb={6}>
                <ProgressJoinStep
                  entity="role"
                  joinState={joinProgress}
                  shouldShowSubtitle={joinProgress?.state === "MANAGING_ROLES"}
                />

                <ProgressJoinStep
                  entity="reward"
                  joinState={joinProgress}
                  shouldShowSubtitle={
                    !joinProgress?.rewards &&
                    joinProgress?.state === "MANAGING_REWARDS"
                  }
                />
              </VStack>
            </Collapse>

            <Collapse in={!isLoading}>
              {featureFlags.includes("CRM") && <ShareSocialsCheckbox />}
            </Collapse>

            <ModalButton
              mt="2"
              onClick={handleSubmit(onSubmit)}
              colorScheme="green"
              isLoading={isLoading}
              loadingText={
                joinProgress?.state === "FINISHED"
                  ? "Finalizing results"
                  : !!joinProgress
                  ? "See status above"
                  : "Checking access"
              }
              isDisabled={!isWeb3Connected}
            >
              Check access to join
            </ModalButton>
          </ModalBody>
        </FormProvider>
      </ModalContent>
      <DynamicDevTool control={methods.control} />
    </Modal>
  )
}

export default JoinModal
