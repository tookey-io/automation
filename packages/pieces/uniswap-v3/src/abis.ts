export const POSITIONS_ABI = {
    name: 'positions',
    type: 'function',
    inputs: [
        {
            name: 'tokenId',
            type: 'uint256',
            internalType: 'uint256',
        },
    ],
    outputs: [
        {
            name: 'nonce',
            type: 'uint96',
            internalType: 'uint96',
        },
        {
            name: 'operator',
            type: 'address',
            internalType: 'address',
        },
        {
            name: 'token0',
            type: 'address',
            internalType: 'address',
        },
        {
            name: 'token1',
            type: 'address',
            internalType: 'address',
        },
        {
            name: 'fee',
            type: 'uint24',
            internalType: 'uint24',
        },
        {
            name: 'tickLower',
            type: 'int24',
            internalType: 'int24',
        },
        {
            name: 'tickUpper',
            type: 'int24',
            internalType: 'int24',
        },
        {
            name: 'liquidity',
            type: 'uint128',
            internalType: 'uint128',
        },
        {
            name: 'feeGrowthInside0LastX128',
            type: 'uint256',
            internalType: 'uint256',
        },
        {
            name: 'feeGrowthInside1LastX128',
            type: 'uint256',
            internalType: 'uint256',
        },
        {
            name: 'tokensOwed0',
            type: 'uint128',
            internalType: 'uint128',
        },
        {
            name: 'tokensOwed1',
            type: 'uint128',
            internalType: 'uint128',
        },
    ],
    stateMutability: 'view',
} as const;

export const COLLECT_ABI = {
    name: 'collect',
    type: 'function',
    inputs: [
        {
            name: 'params',
            type: 'tuple',
            components: [
                {
                    name: 'tokenId',
                    type: 'uint256',
                    internalType: 'uint256',
                },
                {
                    name: 'recipient',
                    type: 'address',
                    internalType: 'address',
                },
                {
                    name: 'amount0Max',
                    type: 'uint128',
                    internalType: 'uint128',
                },
                {
                    name: 'amount1Max',
                    type: 'uint128',
                    internalType: 'uint128',
                },
            ],
            internalType: 'struct INonfungiblePositionManager.CollectParams',
        },
    ],
    outputs: [
        {
            name: 'amount0',
            type: 'uint256',
            internalType: 'uint256',
        },
        {
            name: 'amount1',
            type: 'uint256',
            internalType: 'uint256',
        },
    ],
    stateMutability: 'payable',
} as const;

export const OWNER_ABI = {
    name: 'ownerOf',
    type: 'function',
    inputs: [
        {
            name: 'tokenId',
            type: 'uint256',
            internalType: 'uint256',
        },
    ],
    outputs: [
        {
            name: '',
            type: 'address',
            internalType: 'address',
        },
    ],
    stateMutability: 'view',
} as const;

export const ERC20_NAME = {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
        {
            name: '',
            type: 'string',
        },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
} as const;

export const ERC20_DECIMALS = {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
        {
            name: '',
            type: 'uint8',
        },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
} as const;

export const ERC20_SYMBOL = {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
        {
            name: '',
            type: 'string',
        },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
} as const;

export const ERC20_ABI = [
    {
        constant: true,
        inputs: [],
        name: 'name',
        outputs: [
            {
                name: '',
                type: 'string',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                name: '_spender',
                type: 'address',
            },
            {
                name: '_value',
                type: 'uint256',
            },
        ],
        name: 'approve',
        outputs: [
            {
                name: '',
                type: 'bool',
            },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                name: '_from',
                type: 'address',
            },
            {
                name: '_to',
                type: 'address',
            },
            {
                name: '_value',
                type: 'uint256',
            },
        ],
        name: 'transferFrom',
        outputs: [
            {
                name: '',
                type: 'bool',
            },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [
            {
                name: '',
                type: 'uint8',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [
            {
                name: '_owner',
                type: 'address',
            },
        ],
        name: 'balanceOf',
        outputs: [
            {
                name: 'balance',
                type: 'uint256',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'symbol',
        outputs: [
            {
                name: '',
                type: 'string',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                name: '_to',
                type: 'address',
            },
            {
                name: '_value',
                type: 'uint256',
            },
        ],
        name: 'transfer',
        outputs: [
            {
                name: '',
                type: 'bool',
            },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [
            {
                name: '_owner',
                type: 'address',
            },
            {
                name: '_spender',
                type: 'address',
            },
        ],
        name: 'allowance',
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        payable: true,
        stateMutability: 'payable',
        type: 'fallback',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                name: 'spender',
                type: 'address',
            },
            {
                indexed: false,
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'Approval',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: 'from',
                type: 'address',
            },
            {
                indexed: true,
                name: 'to',
                type: 'address',
            },
            {
                indexed: false,
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'Transfer',
        type: 'event',
    },
] as const;

export const POOL_STATE_ABI = [
    {
        inputs: [],
        name: 'feeGrowthGlobal0X128',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'feeGrowthGlobal1X128',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'liquidity',
        outputs: [
            {
                internalType: 'uint128',
                name: '',
                type: 'uint128',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'index',
                type: 'uint256',
            },
        ],
        name: 'observations',
        outputs: [
            {
                internalType: 'uint32',
                name: 'blockTimestamp',
                type: 'uint32',
            },
            {
                internalType: 'int56',
                name: 'tickCumulative',
                type: 'int56',
            },
            {
                internalType: 'uint160',
                name: 'secondsPerLiquidityCumulativeX128',
                type: 'uint160',
            },
            {
                internalType: 'bool',
                name: 'initialized',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: 'key',
                type: 'bytes32',
            },
        ],
        name: 'positions',
        outputs: [
            {
                internalType: 'uint128',
                name: '_liquidity',
                type: 'uint128',
            },
            {
                internalType: 'uint256',
                name: 'feeGrowthInside0LastX128',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'feeGrowthInside1LastX128',
                type: 'uint256',
            },
            {
                internalType: 'uint128',
                name: 'tokensOwed0',
                type: 'uint128',
            },
            {
                internalType: 'uint128',
                name: 'tokensOwed1',
                type: 'uint128',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'protocolFees',
        outputs: [
            {
                internalType: 'uint128',
                name: 'token0',
                type: 'uint128',
            },
            {
                internalType: 'uint128',
                name: 'token1',
                type: 'uint128',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'slot0',
        outputs: [
            {
                internalType: 'uint160',
                name: 'sqrtPriceX96',
                type: 'uint160',
            },
            {
                internalType: 'int24',
                name: 'tick',
                type: 'int24',
            },
            {
                internalType: 'uint16',
                name: 'observationIndex',
                type: 'uint16',
            },
            {
                internalType: 'uint16',
                name: 'observationCardinality',
                type: 'uint16',
            },
            {
                internalType: 'uint16',
                name: 'observationCardinalityNext',
                type: 'uint16',
            },
            {
                internalType: 'uint8',
                name: 'feeProtocol',
                type: 'uint8',
            },
            {
                internalType: 'bool',
                name: 'unlocked',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'int16',
                name: 'wordPosition',
                type: 'int16',
            },
        ],
        name: 'tickBitmap',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'int24',
                name: 'tick',
                type: 'int24',
            },
        ],
        name: 'ticks',
        outputs: [
            {
                internalType: 'uint128',
                name: 'liquidityGross',
                type: 'uint128',
            },
            {
                internalType: 'int128',
                name: 'liquidityNet',
                type: 'int128',
            },
            {
                internalType: 'uint256',
                name: 'feeGrowthOutside0X128',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'feeGrowthOutside1X128',
                type: 'uint256',
            },
            {
                internalType: 'int56',
                name: 'tickCumulativeOutside',
                type: 'int56',
            },
            {
                internalType: 'uint160',
                name: 'secondsPerLiquidityOutsideX128',
                type: 'uint160',
            },
            {
                internalType: 'uint32',
                name: 'secondsOutside',
                type: 'uint32',
            },
            {
                internalType: 'bool',
                name: 'initialized',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
] as const;
