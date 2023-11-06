import {
    ChainId,
    Currency,
    Ether,
    NativeCurrency,
    Token,
    UNI_ADDRESSES,
    WETH9,
} from '@uniswap/sdk-core';

export const NATIVE_CHAIN_ID = 'NATIVE';

// When decimals are not specified for an ERC20 token
// use default ERC20 token decimals as specified here:
// https://docs.openzeppelin.com/contracts/3.x/erc20
export const DEFAULT_ERC20_DECIMALS = 18;

export const USDC_MAINNET = new Token(
    ChainId.MAINNET,
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    6,
    'USDC',
    'USD//C'
);
const USDC_GOERLI = new Token(
    ChainId.GOERLI,
    '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
    6,
    'USDC',
    'USD//C'
);
const USDC_SEPOLIA = new Token(
    ChainId.SEPOLIA,
    '0x6f14C02Fc1F78322cFd7d707aB90f18baD3B54f5',
    6,
    'USDC',
    'USD//C'
);
export const USDC_OPTIMISM = new Token(
    ChainId.OPTIMISM,
    '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    6,
    'USDC',
    'USD//C'
);
export const USDC_OPTIMISM_GOERLI = new Token(
    ChainId.OPTIMISM_GOERLI,
    '0xe05606174bac4A6364B31bd0eCA4bf4dD368f8C6',
    6,
    'USDC',
    'USD//C'
);
export const USDC_ARBITRUM = new Token(
    ChainId.ARBITRUM_ONE,
    '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    6,
    'USDC',
    'USD//C'
);
export const USDC_ARBITRUM_GOERLI = new Token(
    ChainId.ARBITRUM_GOERLI,
    '0x8FB1E3fC51F3b789dED7557E680551d93Ea9d892',
    6,
    'USDC',
    'USD//C'
);
export const USDC_POLYGON = new Token(
    ChainId.POLYGON,
    '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
    6,
    'USDC',
    'USD Coin'
);
export const USDC_POLYGON_MUMBAI = new Token(
    ChainId.POLYGON_MUMBAI,
    '0x0fa8781a83e46826621b3bc094ea2a0212e71b23',
    6,
    'USDC',
    'USD Coin'
);
export const PORTAL_USDC_CELO = new Token(
    ChainId.CELO,
    '0x37f750B7cC259A2f741AF45294f6a16572CF5cAd',
    6,
    'USDCet',
    'USDC (Portal from Ethereum)'
);
export const USDC_BASE = new Token(
    ChainId.BASE,
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    6,
    'USDC',
    'USD Coin'
);

export const DAI = new Token(
    ChainId.MAINNET,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    18,
    'DAI',
    'Dai Stablecoin'
);
export const DAI_ARBITRUM_ONE = new Token(
    ChainId.ARBITRUM_ONE,
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    18,
    'DAI',
    'Dai stable coin'
);
export const DAI_OPTIMISM = new Token(
    ChainId.OPTIMISM,
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    18,
    'DAI',
    'Dai stable coin'
);
export const MATIC_MAINNET = new Token(
    ChainId.MAINNET,
    '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    18,
    'MATIC',
    'Polygon Matic'
);
const MATIC_POLYGON = new Token(
    ChainId.POLYGON,
    '0x0000000000000000000000000000000000001010',
    18,
    'MATIC',
    'Matic'
);
export const DAI_POLYGON = new Token(
    ChainId.POLYGON,
    '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    18,
    'DAI',
    'Dai Stablecoin'
);

export const USDT_POLYGON = new Token(
    ChainId.POLYGON,
    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    6,
    'USDT',
    'Tether USD'
);
export const WBTC_POLYGON = new Token(
    ChainId.POLYGON,
    '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
    8,
    'WBTC',
    'Wrapped BTC'
);
export const USDT = new Token(
    ChainId.MAINNET,
    '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    6,
    'USDT',
    'Tether USD'
);
export const USDT_ARBITRUM_ONE = new Token(
    ChainId.ARBITRUM_ONE,
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    6,
    'USDT',
    'Tether USD'
);
export const USDT_OPTIMISM = new Token(
    ChainId.OPTIMISM,
    '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    6,
    'USDT',
    'Tether USD'
);
export const WBTC = new Token(
    ChainId.MAINNET,
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    8,
    'WBTC',
    'Wrapped BTC'
);
export const WBTC_ARBITRUM_ONE = new Token(
    ChainId.ARBITRUM_ONE,
    '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    8,
    'WBTC',
    'Wrapped BTC'
);
export const WBTC_OPTIMISM = new Token(
    ChainId.OPTIMISM,
    '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
    8,
    'WBTC',
    'Wrapped BTC'
);
const MATIC_POLYGON_MUMBAI = new Token(
    ChainId.POLYGON_MUMBAI,
    '0x0000000000000000000000000000000000001010',
    18,
    'MATIC',
    'Matic'
);
export const WETH_POLYGON_MUMBAI = new Token(
    ChainId.POLYGON_MUMBAI,
    '0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa',
    18,
    'WETH',
    'Wrapped Ether'
);

export const WETH_POLYGON = new Token(
    ChainId.POLYGON,
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    18,
    'WETH',
    'Wrapped Ether'
);
const CELO_CELO = new Token(
    ChainId.CELO,
    '0x471EcE3750Da237f93B8E339c536989b8978a438',
    18,
    'CELO',
    'Celo'
);
export const CUSD_CELO = new Token(
    ChainId.CELO,
    '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    18,
    'cUSD',
    'Celo Dollar'
);
export const CEUR_CELO = new Token(
    ChainId.CELO,
    '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
    18,
    'cEUR',
    'Celo Euro Stablecoin'
);
export const PORTAL_ETH_CELO = new Token(
    ChainId.CELO,
    '0x66803FB87aBd4aaC3cbB3fAd7C3aa01f6F3FB207',
    18,
    'ETH',
    'Portal Ether'
);
export const WBTC_CELO = new Token(
    ChainId.CELO,
    '0xd71Ffd0940c920786eC4DbB5A12306669b5b81EF',
    18,
    'WBTC',
    'Wrapped BTC'
);
const CELO_CELO_ALFAJORES = new Token(
    ChainId.CELO_ALFAJORES,
    '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
    18,
    'CELO',
    'Celo'
);
export const CUSD_CELO_ALFAJORES = new Token(
    ChainId.CELO_ALFAJORES,
    '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
    18,
    'CUSD',
    'Celo Dollar'
);
export const CEUR_CELO_ALFAJORES = new Token(
    ChainId.CELO_ALFAJORES,
    '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
    18,
    'CEUR',
    'Celo Euro Stablecoin'
);

export const USDC_BSC = new Token(
    ChainId.BNB,
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    18,
    'USDC',
    'USDC'
);
export const USDT_BSC = new Token(
    ChainId.BNB,
    '0x55d398326f99059fF775485246999027B3197955',
    18,
    'USDT',
    'USDT'
);
export const ETH_BSC = new Token(
    ChainId.BNB,
    '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    18,
    'ETH',
    'Ethereum'
);
export const BTC_BSC = new Token(
    ChainId.BNB,
    '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    18,
    'BTCB',
    'BTCB'
);
export const BUSD_BSC = new Token(
    ChainId.BNB,
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    18,
    'BUSD',
    'BUSD'
);
export const DAI_BSC = new Token(
    ChainId.BNB,
    '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    18,
    'DAI',
    'DAI'
);

export const USDC_AVALANCHE = new Token(
    ChainId.AVALANCHE,
    '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    6,
    'USDC',
    'USDC Token'
);
export const USDT_AVALANCHE = new Token(
    ChainId.AVALANCHE,
    '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    6,
    'USDT',
    'Tether USD'
);
export const WETH_AVALANCHE = new Token(
    ChainId.AVALANCHE,
    '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
    18,
    'WETH',
    'Wrapped Ether'
);
export const DAI_AVALANCHE = new Token(
    ChainId.AVALANCHE,
    '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
    18,
    'DAI.e',
    'Dai.e Token'
);

export const UNI: { [chainId: number]: Token } = {
    [ChainId.MAINNET]: new Token(
        ChainId.MAINNET,
        UNI_ADDRESSES[ChainId.MAINNET],
        18,
        'UNI',
        'Uniswap'
    ),
    [ChainId.GOERLI]: new Token(
        ChainId.GOERLI,
        UNI_ADDRESSES[ChainId.GOERLI],
        18,
        'UNI',
        'Uniswap'
    ),
    [ChainId.SEPOLIA]: new Token(
        ChainId.SEPOLIA,
        UNI_ADDRESSES[ChainId.SEPOLIA],
        18,
        'UNI',
        'Uniswap'
    ),
};

export const ARB = new Token(
    ChainId.ARBITRUM_ONE,
    '0x912CE59144191C1204E64559FE8253a0e49E6548',
    18,
    'ARB',
    'Arbitrum'
);

export const OP = new Token(
    ChainId.OPTIMISM,
    '0x4200000000000000000000000000000000000042',
    18,
    'OP',
    'Optimism'
);

export const LDO = new Token(
    ChainId.MAINNET,
    '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
    18,
    'LDO',
    'Lido DAO Token'
);

export const WRAPPED_NATIVE_CURRENCY: Record<ChainId, Token> = {
    ...(WETH9 as Record<ChainId, Token>),
    [ChainId.OPTIMISM]: new Token(
        ChainId.OPTIMISM,
        '0x4200000000000000000000000000000000000006',
        18,
        'WETH',
        'Wrapped Ether'
    ),
    [ChainId.OPTIMISM_GOERLI]: new Token(
        ChainId.OPTIMISM_GOERLI,
        '0x4200000000000000000000000000000000000006',
        18,
        'WETH',
        'Wrapped Ether'
    ),
    [ChainId.BASE]: new Token(
        ChainId.BASE,
        '0x4200000000000000000000000000000000000006',
        18,
        'WETH',
        'Wrapped Ether'
    ),
    [ChainId.ARBITRUM_ONE]: new Token(
        ChainId.ARBITRUM_ONE,
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        18,
        'WETH',
        'Wrapped Ether'
    ),
    [ChainId.ARBITRUM_GOERLI]: new Token(
        ChainId.ARBITRUM_GOERLI,
        '0xe39Ab88f8A4777030A534146A9Ca3B52bd5D43A3',
        18,
        'WETH',
        'Wrapped Ether'
    ),
    [ChainId.SEPOLIA]: new Token(
        ChainId.SEPOLIA,
        '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
        18,
        'WETH',
        'Wrapped Ether'
    ),
    [ChainId.POLYGON]: new Token(
        ChainId.POLYGON,
        '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        18,
        'WMATIC',
        'Wrapped MATIC'
    ),
    [ChainId.POLYGON_MUMBAI]: new Token(
        ChainId.POLYGON_MUMBAI,
        '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
        18,
        'WMATIC',
        'Wrapped MATIC'
    ),
    [ChainId.CELO]: new Token(
        ChainId.CELO,
        '0x471ece3750da237f93b8e339c536989b8978a438',
        18,
        'CELO',
        'Celo native asset'
    ),
    [ChainId.CELO_ALFAJORES]: new Token(
        ChainId.CELO_ALFAJORES,
        '0xf194afdf50b03e69bd7d057c1aa9e10c9954e4c9',
        18,
        'CELO',
        'Celo native asset'
    ),
    [ChainId.BNB]: new Token(
        ChainId.BNB,
        '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        18,
        'WBNB',
        'Wrapped BNB'
    ),
    [ChainId.AVALANCHE]: new Token(
        ChainId.AVALANCHE,
        '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
        18,
        'WAVAX',
        'Wrapped AVAX'
    ),
};

const STABLES = ['USDC', 'USDT', 'DAI'] as const;

export const TOKEN_SHORTHANDS: Record<
    (typeof STABLES)[number],
    Record<ChainId, Token | undefined>
> = {
    USDC: {
        [ChainId.MAINNET]: USDC_MAINNET,
        [ChainId.ARBITRUM_ONE]: USDC_ARBITRUM,
        [ChainId.ARBITRUM_GOERLI]: USDC_ARBITRUM_GOERLI,
        [ChainId.OPTIMISM]: USDC_OPTIMISM,
        [ChainId.OPTIMISM_GOERLI]: USDC_OPTIMISM_GOERLI,
        [ChainId.POLYGON]: USDC_POLYGON,
        [ChainId.POLYGON_MUMBAI]: USDC_POLYGON_MUMBAI,
        [ChainId.BNB]: USDC_BSC,
        [ChainId.BASE]: USDC_BASE,
        [ChainId.CELO]: PORTAL_USDC_CELO,
        [ChainId.CELO_ALFAJORES]: PORTAL_USDC_CELO,
        [ChainId.GOERLI]: USDC_GOERLI,
        [ChainId.SEPOLIA]: USDC_SEPOLIA,
        [ChainId.AVALANCHE]: USDC_AVALANCHE,
        [ChainId.GNOSIS]: undefined,
        [ChainId.MOONBEAM]: undefined,
        [ChainId.BASE_GOERLI]: undefined,
    },
    DAI: {
        [ChainId.MAINNET]: DAI,
        [ChainId.GOERLI]: undefined,
        [ChainId.SEPOLIA]: undefined,
        [ChainId.OPTIMISM]: DAI_OPTIMISM,
        [ChainId.OPTIMISM_GOERLI]: undefined,
        [ChainId.ARBITRUM_ONE]: DAI_ARBITRUM_ONE,
        [ChainId.ARBITRUM_GOERLI]: undefined,
        [ChainId.POLYGON]: DAI_POLYGON,
        [ChainId.POLYGON_MUMBAI]: undefined,
        [ChainId.CELO]: undefined,
        [ChainId.CELO_ALFAJORES]: undefined,
        [ChainId.GNOSIS]: undefined,
        [ChainId.MOONBEAM]: undefined,
        [ChainId.BNB]: DAI_BSC,
        [ChainId.AVALANCHE]: DAI_AVALANCHE,
        [ChainId.BASE_GOERLI]: undefined,
        [ChainId.BASE]: undefined,
    },
    USDT: {
        [ChainId.MAINNET]: USDT,
        [ChainId.GOERLI]: undefined,
        [ChainId.SEPOLIA]: undefined,
        [ChainId.OPTIMISM]: USDT_OPTIMISM,
        [ChainId.OPTIMISM_GOERLI]: undefined,
        [ChainId.ARBITRUM_ONE]: USDT_ARBITRUM_ONE,
        [ChainId.ARBITRUM_GOERLI]: undefined,
        [ChainId.POLYGON]: USDT_POLYGON,
        [ChainId.POLYGON_MUMBAI]: undefined,
        [ChainId.CELO]: undefined,
        [ChainId.CELO_ALFAJORES]: undefined,
        [ChainId.GNOSIS]: undefined,
        [ChainId.MOONBEAM]: undefined,
        [ChainId.BNB]: USDT_BSC,
        [ChainId.AVALANCHE]: USDT_AVALANCHE,
        [ChainId.BASE_GOERLI]: undefined,
        [ChainId.BASE]: undefined,
    },
};

export const STABLECOINS = [
    ...Object.values(TOKEN_SHORTHANDS.USDC),
    ...Object.values(TOKEN_SHORTHANDS.USDT),
    ...Object.values(TOKEN_SHORTHANDS.DAI),
].filter((t): t is Token => Boolean(t));