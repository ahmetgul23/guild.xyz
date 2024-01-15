import { NextApiHandler } from "next"

const CoinbasePayChains = {
  ethereum: 1,
  arbitrum: 42161,
  "avalanche-c-chain": 43114,
  celo: 42220,
  kava: 2222,
  optimism: 10,
  gnosis: 100,
  base: 8453,
  polygon: 137,
}

const COINBASE_PAY_API_HEADERS = {
  "CBPAY-APP-ID": process.env.NEXT_PUBLIC_COINBASE_PAY_APPID,
  "CBPAY-API-KEY": process.env.COINBASE_PAY_API_KEY,
}

function getPayStatusUrl(userId: number) {
  return `https://pay.coinbase.com/api/v1/buy/user/${userId}/transactions?page_size=10`
}

const handler: NextApiHandler = async (req, res) => {
  const response = await fetch(getPayStatusUrl(+req.query.userId), {
    headers: COINBASE_PAY_API_HEADERS,
  })

  const data = await response.json()

  const txStatus = data?.transactions?.[0]

  const chainName: keyof typeof CoinbasePayChains = txStatus?.purchase_network

  const mapped = {
    status: txStatus.status.replace("ONRAMP_TRANSACTION_STATUS_", ""),
    currency: txStatus?.purchase_currency,
    txHash: txStatus?.tx_hash,
    amount: (txStatus?.purchase_amount?.value as string)?.replace(/0+$/, ""),
    chainId: txStatus?.purchase_network ? CoinbasePayChains[chainName] : undefined,
    createdAt: txStatus?.created_at,
  }

  res.status(200).json(mapped)
}

export default handler
