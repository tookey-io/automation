import {
    createAction,
    createPiece,
    PieceAuth,
    Property,
    Validators,
} from '@activepieces/pieces-framework';
import {
    ChainId,
    CurrencyAmount,
    NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
    Price,
    SUPPORTED_CHAINS,
    Token,
    V3_CORE_FACTORY_ADDRESSES,
} from '@uniswap/sdk-core';
import { computePoolAddress, Pool, Position } from '@uniswap/v3-sdk';
import JSBI from 'jsbi';
import { Address, Chain, createPublicClient, http, isAddress, maxUint128 } from 'viem';
import { arbitrum, arbitrumGoerli, avalanche, base, baseGoerli, bsc, celo, celoAlfajores, gnosis, goerli, mainnet, moonbeam, optimism, optimismGoerli, polygon, polygonMumbai, sepolia } from 'viem/chains';
import {
    COLLECT_ABI,
    ERC20_ABI,
    OWNER_ABI,
    POOL_STATE_ABI,
    POSITIONS_ABI
} from './abis';
import {
    STABLECOINS,
    TOKEN_SHORTHANDS,
    WBTC,
    WBTC_ARBITRUM_ONE,
    WBTC_CELO,
    WBTC_OPTIMISM,
    WBTC_POLYGON,
    WRAPPED_NATIVE_CURRENCY,
} from './tokens';

(JSBI.prototype as any).toJSON = function () {
    return this.toString(10);
};

(BigInt.prototype as any).toJSON = function () {
    return this.toString(10);
};

function getRatio(
    lower: Price<Token, Token>,
    current: Price<Token, Token>,
    upper: Price<Token, Token>
) {
    try {
        if (!current.greaterThan(lower)) {
            return 100;
        } else if (!current.lessThan(upper)) {
            return 0;
        }

        const a = Number.parseFloat(lower.toSignificant(15));
        const b = Number.parseFloat(upper.toSignificant(15));
        const c = Number.parseFloat(current.toSignificant(15));

        const ratio = Math.floor(
            (1 /
                ((Math.sqrt(a * b) - Math.sqrt(b * c)) /
                    (c - Math.sqrt(b * c)) +
                    1)) *
                100
        );

        if (ratio < 0 || ratio > 100) {
            throw Error('Out of range');
        }

        return ratio;
    } catch {
        return undefined;
    }
}

function getPriceOrderingFromPositionForUI(
    chain: ChainId,
    position: Position
) {
    const token0 = position.amount0.currency;
    const token1 = position.amount1.currency;

    // if token0 is a dollar-stable asset, set it as the quote token
    const stables = [
        TOKEN_SHORTHANDS.USDT[chain],
        TOKEN_SHORTHANDS.USDC[chain],
        TOKEN_SHORTHANDS.DAI[chain],
    ].filter((token): token is Token => typeof token !== 'undefined');

    if (stables.some((stable) => stable.equals(token0))) {
        return {
            priceLower: position.token0PriceUpper.invert(),
            priceUpper: position.token0PriceLower.invert(),
            quote: token0,
            base: token1,
        };
    }

    // if token1 is an ETH-/BTC-stable asset, set it as the base token
    const bases = [
        ...Object.values(WRAPPED_NATIVE_CURRENCY),
        WBTC,
        WBTC_ARBITRUM_ONE,
        WBTC_OPTIMISM,
        WBTC_CELO,
        WBTC_POLYGON,
    ];
    if (bases.some((base) => base && base.equals(token1))) {
        return {
            priceLower: position.token0PriceUpper.invert(),
            priceUpper: position.token0PriceLower.invert(),
            quote: token0,
            base: token1,
        };
    }

    // if both prices are below 1, invert
    if (position.token0PriceUpper.lessThan(1)) {
        return {
            priceLower: position.token0PriceUpper.invert(),
            priceUpper: position.token0PriceLower.invert(),
            quote: token0,
            base: token1,
        };
    }

    // otherwise, just return the default
    return {
        priceLower: position.token0PriceLower,
        priceUpper: position.token0PriceUpper,
        quote: token1,
        base: token0,
    };
}



export const UniswapV3Connection = PieceAuth.CustomAuth({
    description: `
UniswapV3 hosted among many networks (Ethereum mainnet, Goerli and Sepolia testnets, Optimism, Arbitrum, Polygon, Celo, Gnosis, Base, Binance Smart Chain, Avalanche, Moonbeam). 

You can use [public nodes](https://chainlist.org/) (without garanties on reliability), [run your own node](https://ethereum.org/en/developers/docs/nodes-and-clients/run-a-node/) or use any Node as Service providers ([Infura](https://www.infura.io/), [Alchemy](https://www.alchemy.com/), [QuickNode](https://www.quicknode.com/)). 

Node RPC is critical to run piece, but addresses are optional (we use default of the network or override with custom).
`,
    required: true,
    props: {
        rpc: Property.ShortText({
            displayName: 'RPC URL',
            description: 'URL of the RPC endpoint',
            required: true,
            validators: [Validators.url],
        }),
        chain: Property.StaticDropdown({
            displayName: 'Chain',
            description: 'Chain',
            required: true,
            options: {
                disabled: false,
                options: SUPPORTED_CHAINS.map((value) => ({
                    value,
                    label: ChainId[value],
                })),
            },
        }),
        factoryAddress: Property.ShortText({
            displayName: 'Factory address',
            description: 'Factory address',
            required: false,
        }),
        positionManager: Property.ShortText({
            displayName: 'Position manager',
            description: 'Non-fungible position manager address',
            required: false,
        }),
    },
});

const chainIdToChainDef: Record<ChainId, Chain> = {
    [ChainId.MAINNET]: mainnet,
    [ChainId.GOERLI]: goerli,
    [ChainId.SEPOLIA]: sepolia,
    [ChainId.OPTIMISM]: optimism,
    [ChainId.OPTIMISM_GOERLI]: optimismGoerli,
    [ChainId.ARBITRUM_ONE]: arbitrum,
    [ChainId.ARBITRUM_GOERLI]: arbitrumGoerli,
    [ChainId.POLYGON]: polygon,
    [ChainId.POLYGON_MUMBAI]: polygonMumbai,
    [ChainId.CELO]: celo,
    [ChainId.CELO_ALFAJORES]: celoAlfajores,
    [ChainId.GNOSIS]: gnosis,
    [ChainId.MOONBEAM]: moonbeam,
    [ChainId.BNB]: bsc,
    [ChainId.AVALANCHE]: avalanche,
    [ChainId.BASE_GOERLI]: baseGoerli,
    [ChainId.BASE]: base,
} 

const fetchPosition = createAction({
    auth: UniswapV3Connection,
    requireAuth: true,
    name: 'fetch-position',
    displayName: 'Fetch position',
    description: 'Fetch position from Uniswap v3',
    props: {
        tokenId: Property.Number({
            displayName: 'Token ID',
            description: 'Token ID',
            required: true,
        }),
        fetchCollectedFees: Property.Checkbox({
            displayName: 'Fetch collected fees',
            description: 'Fetch collected fees',
            required: false,
            defaultValue: false,
        }),
    },
    async run({ propsValue: { tokenId, fetchCollectedFees }, auth }) {
        console.log('create client');
        const client = createPublicClient({
            chain: {
                ...chainIdToChainDef[auth.chain],
                rpcUrls: {
                    public: {
                        http: [auth.rpc]
                    },
                    default: {
                        http: [auth.rpc]
                    },
                }
            },
            transport: http(),
        });
        
        const positionManager = auth.positionManager || NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[auth.chain]

        if (!isAddress(positionManager)) {
            throw new Error('Invalid position manager address');
        }

        const factoryAddress = auth.factoryAddress || V3_CORE_FACTORY_ADDRESSES[auth.chain]
        if (!isAddress(factoryAddress)) {
            throw new Error('Invalid factory address');
        }

        console.log('fetch position');
        const [
            [
                nonce,
                operator,
                token0,
                token1,
                fee,
                tickLower,
                tickUpper,
                liquidity,
                feeGrowthInside0LastX128,
                feeGrowthInside1LastX128,
                tokensOwed0,
                tokensOwed1,
            ],
            owner,
        ] = await client.multicall({
            allowFailure: false,
            contracts: [
                {
                    address: positionManager,
                    abi: [POSITIONS_ABI],
                    functionName: 'positions',
                    args: [BigInt(tokenId)],
                },
                {
                    address: positionManager,
                    abi: [OWNER_ABI],
                    functionName: 'ownerOf',
                    args: [BigInt(tokenId)],
                },
            ],
        });

        console.log({
            nonce,
            operator,
            token0,
            token1,
            fee,
            tickLower,
            tickUpper,
            liquidity,
            feeGrowthInside0LastX128,
            feeGrowthInside1LastX128,
            tokensOwed0,
            tokensOwed1,
            owner,
        });

        console.log('fetch tokens');

        const [
            token0Name,
            token0Symbol,
            token0Decimals,
            token1Name,
            token1Symbol,
            token1Decimals,
        ] = await client.multicall({
            allowFailure: false,
            contracts: [
                {
                    address: token0,
                    abi: ERC20_ABI,
                    functionName: 'name',
                },
                {
                    address: token0,
                    abi: ERC20_ABI,
                    functionName: 'symbol',
                },
                {
                    address: token0,
                    abi: ERC20_ABI,
                    functionName: 'decimals',
                },
                {
                    address: token1,
                    abi: ERC20_ABI,
                    functionName: 'name',
                },
                {
                    address: token1,
                    abi: ERC20_ABI,
                    functionName: 'symbol',
                },
                {
                    address: token1,
                    abi: ERC20_ABI,
                    functionName: 'decimals',
                },
            ],
        });

        const tokenA = new Token(
            auth.chain,
            token0,
            token0Decimals,
            token0Symbol,
            token0Name
        );
        const tokenB = new Token(
            auth.chain,
            token1,
            token1Decimals,
            token1Symbol,
            token1Name
        );

        const poolAddress = computePoolAddress({
            factoryAddress,
            tokenA,
            tokenB,
            fee: fee,
        });

        if (!isAddress(poolAddress)) {
            throw new Error('Invalid pool address');
        }

        const [
            [
                sqrtPriceX96,
                tick,
                observationIndex,
                observationCardinality,
                observationCardinalityNext,
                feeProtocol,
                unlocked,
            ],
            poolLiquidity,
        ] = await client.multicall({
            allowFailure: false,
            contracts: [
                {
                    address: poolAddress,
                    abi: POOL_STATE_ABI,
                    functionName: 'slot0',
                },
                {
                    address: poolAddress,
                    abi: POOL_STATE_ABI,
                    functionName: 'liquidity',
                },
            ],
        });

        const pool = new Pool(
            tokenA,
            tokenB,
            fee,
            sqrtPriceX96.toString(10),
            poolLiquidity.toString(10),
            tick
        );

        const position = new Position({
            pool,
            liquidity: liquidity.toString(10),
            tickLower,
            tickUpper,
        });

        const { priceLower, priceUpper, quote, base } =
            getPriceOrderingFromPositionForUI(auth.chain, position);

        const inverted = base.equals(tokenA);

        const ratio = getRatio(
            inverted ? priceUpper.invert() : priceLower,
            pool.token0Price,
            inverted ? priceLower.invert() : priceUpper
        );

        let feeValue0: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(tokenA, 0)
        let feeValue1: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(tokenB, 0)

        if (fetchCollectedFees) {
            const [feeValue0Raw, feeValue1Raw] = await client.readContract({
                address: positionManager,
                abi: [
                    {
                        ...COLLECT_ABI,
                        // HACK: this is a bug of viem
                        stateMutability: 'view',
                    },
                ],
                functionName: 'collect',
                args: [
                    {
                        tokenId: BigInt(tokenId),
                        recipient: owner,
                        amount0Max: maxUint128,
                        amount1Max: maxUint128,
                    },
                ],
                account: owner,
            });

            feeValue0 = CurrencyAmount.fromRawAmount(
                tokenA,
                feeValue0Raw.toString(10)
            );
            feeValue1 = CurrencyAmount.fromRawAmount(
                tokenB,
                feeValue1Raw.toString(10)
            );
        }

        const below = pool.tickCurrent < tickLower;
        const above = pool.tickCurrent >= tickUpper;
        const inRange = !below && !above;

        const quoteIsStable = STABLECOINS.some(t => t.equals(quote))

        return { 
          owner,
          base: {
            address: base.address,
            name: base.name,
            symbol: base.symbol,
            decimals: base.decimals,
            liquidity: inverted ? position.amount1.toExact() : position.amount0.toExact(),
            feesCollected: inverted ? feeValue0.toExact() : feeValue1.toExact(),
          },
          quote: {
            address: quote.address,
            name: quote.name,
            symbol: quote.symbol,
            decimals: quote.decimals,
            liquidity: inverted ? position.amount0.toExact() : position.amount1.toExact(),
            feesCollected: inverted ? feeValue1.toExact() : feeValue0.toExact(),
            isUsd: STABLECOINS.some(t => t.equals(base))
          },
          prices: {
            min: priceLower.toSignificant(15),
            max: priceUpper.toSignificant(15),
            current: pool.priceOf(base).toSignificant(15),
            inRange,
            below,
            above,
          }
        }
    },
});

export const uniswapV3 = createPiece({
    displayName: 'Uniswap v3',
    auth: UniswapV3Connection,
    minimumSupportedRelease: '0.9.0',
    logoUrl:
        'https://raw.githubusercontent.com/tookey-io/icons/main/piece-uniswap.png',
    authors: [],
    actions: [fetchPosition],
    triggers: [],
});
