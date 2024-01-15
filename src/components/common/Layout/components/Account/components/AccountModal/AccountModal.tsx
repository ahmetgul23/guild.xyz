import {
  Center,
  Circle,
  Divider,
  HStack,
  Icon,
  IconButton,
  Img,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react"
import { CHAIN_CONFIG, Chains } from "chains"
import useUser from "components/[guild]/hooks/useUser"
import { deleteKeyPairFromIdb } from "components/_app/KeyPairProvider"
import useConnectorNameAndIcon from "components/_app/Web3ConnectionManager/hooks/useConnectorNameAndIcon"
import useWeb3ConnectionManager from "components/_app/Web3ConnectionManager/hooks/useWeb3ConnectionManager"
import Button from "components/common/Button"
import CopyableAddress from "components/common/CopyableAddress"
import GuildAvatar from "components/common/GuildAvatar"
import { Modal } from "components/common/Modal"
import useCoinbasePay from "hooks/useCoinbasePay"
import useCoinbasePayStatus from "hooks/useCoinbasePayStatus"
import useResolveAddress from "hooks/useResolveAddress"
import { Check, LinkBreak, SignOut, UploadSimple } from "phosphor-react"
import { useSWRConfig } from "swr"
import { useAccount, useChainId } from "wagmi"
import NetworkModal from "../NetworkModal"
import AccountConnections from "./components/AccountConnections"
import PrimaryAddressTag from "./components/PrimaryAddressTag"
import UsersGuildPins from "./components/UsersGuildCredentials"

const isRecent = (date: Date, differenceMs = 1000 * 60 * 15) => {
  const diff = Date.now() - +date
  return diff < differenceMs
}

const txStatuses = new Set<string>()

const AccountModal = () => {
  const {
    address,
    type,
    setIsDelegateConnection,
    isAccountModalOpen: isOpen,
    closeAccountModal: onClose,
    disconnect,
  } = useWeb3ConnectionManager()

  const { address: evmAddress } = useAccount()

  const chainId = useChainId()

  const {
    isOpen: isNetworkModalOpen,
    onOpen: openNetworkModal,
    onClose: closeNetworkModal,
  } = useDisclosure()
  const { id, addresses } = useUser()

  const { mutate } = useSWRConfig()

  const handleLogout = () => {
    const keysToRemove = Object.keys({ ...window.localStorage }).filter((key) =>
      /^dc_auth_[a-z]*$/.test(key)
    )

    keysToRemove.forEach((key) => {
      window.localStorage.removeItem(key)
    })

    deleteKeyPairFromIdb(id)
      ?.catch(() => {})
      .finally(() => {
        setIsDelegateConnection(false)
        onClose()
        disconnect()
        mutate(["keyPair", id])
      })
  }

  const domain = useResolveAddress(evmAddress)

  const avatarBg = useColorModeValue("gray.100", "blackAlpha.200")

  const { connectorName } = useConnectorNameAndIcon()

  const { onOpen, isLoading } = useCoinbasePay()
  const payTx = useCoinbasePayStatus()

  const isTxRecent =
    !!payTx.data?.createdAt && isRecent(new Date(payTx.data.createdAt))

  const recentPayTx = isTxRecent ? payTx : null

  txStatuses.add(recentPayTx.data?.status)

  const freshSuccess =
    recentPayTx?.data?.status === "SUCCESS" && txStatuses.has("IN_PROGRESS")

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      colorScheme="duotone"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader pb="6">Account</ModalHeader>
        <ModalCloseButton />
        {address ? (
          <>
            <ModalBody>
              <HStack spacing="3" alignItems="center" mb="8">
                <Circle size={12} bg={avatarBg}>
                  <GuildAvatar address={address} size={5} />
                </Circle>
                <Stack w="full" alignItems={"flex-start"} spacing="1">
                  <HStack>
                    <CopyableAddress
                      address={address}
                      domain={domain}
                      decimals={5}
                      fontWeight="bold"
                    />
                    {(typeof addresses?.[0] === "string"
                      ? (addresses as any)?.indexOf(address.toLowerCase())
                      : addresses?.findIndex(
                          ({ address: a }) => a === address.toLowerCase()
                        )) === 0 && addresses.length > 1 ? (
                      <PrimaryAddressTag size="sm" />
                    ) : null}
                  </HStack>
                  <HStack spacing="1">
                    <Text
                      colorScheme="gray"
                      fontSize="sm"
                      fontWeight="medium"
                      noOfLines={1}
                    >
                      {`Connected with ${connectorName} on`}
                    </Text>
                    {type === "EVM" ? (
                      <Button
                        variant="ghost"
                        p="0"
                        onClick={openNetworkModal}
                        size="xs"
                        mt="-2px"
                      >
                        <Center>
                          {CHAIN_CONFIG[Chains[chainId]] ? (
                            <Img
                              src={CHAIN_CONFIG[Chains[chainId]].iconUrl}
                              boxSize={4}
                            />
                          ) : (
                            <Icon as={LinkBreak} />
                          )}
                        </Center>
                      </Button>
                    ) : (
                      <Center ml={1}>
                        <Img src="/walletLogos/fuel.svg" boxSize={4} />
                      </Center>
                    )}
                  </HStack>
                  <NetworkModal
                    isOpen={isNetworkModalOpen}
                    onClose={closeNetworkModal}
                  />
                </Stack>
                <Tooltip
                  label={
                    type !== "EVM"
                      ? "Please switch to an EVM wallet"
                      : recentPayTx?.data?.status === "IN_PROGRESS"
                      ? "Transaction in progress"
                      : freshSuccess
                      ? "Transaction successful"
                      : "Top up wallet"
                  }
                >
                  <IconButton
                    isDisabled={type !== "EVM" || freshSuccess}
                    size="sm"
                    colorScheme={
                      {
                        IN_PROGRESS: "orange",
                        SUCCESS: "green",
                        _: undefined,
                      }[recentPayTx?.data?.status ?? "_"]
                    }
                    variant="outline"
                    isLoading={
                      isLoading || recentPayTx?.data?.status === "IN_PROGRESS"
                    }
                    onClick={() => onOpen(address)}
                    icon={<Icon as={freshSuccess ? Check : UploadSimple} p="1px" />}
                    aria-label="Top up wallet"
                  />
                </Tooltip>

                <Tooltip label="Disconnect">
                  <IconButton
                    size="sm"
                    variant="outline"
                    onClick={handleLogout}
                    icon={<Icon as={SignOut} p="1px" />}
                    aria-label="Disconnect"
                  />
                </Tooltip>
              </HStack>

              <AccountConnections />
              <Divider my="7" />
              <UsersGuildPins />
            </ModalBody>
          </>
        ) : (
          <ModalBody>
            <Text mb="6" fontSize={"2xl"} fontWeight="semibold">
              Not connected
            </Text>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  )
}

export default AccountModal
