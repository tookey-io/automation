
import { ActionContext, createAction, createPiece, PieceAuth, PieceAuthProperty, Property, Validators } from "@activepieces/pieces-framework";
import { getTokenActor } from "@psychedelic/dab-js";
import { createAccountFromMnemonic } from "@psychedelic/plug-controller/dist/utils/account/index";
import { fetchCandid, HttpAgent } from '@dfinity/agent';
import { TOKEN } from "@psychedelic/dab-js/dist/constants/standards";
import { IDL } from "@dfinity/candid";
// 
// const host = process.env.DFX_NETWORK === 'local' ? 'http://localhost:4943' : 'https://icp-api.io';
// 

const tokens: string[] = [
  "ryjl3-tyaaa-aaaaa-aaaba-cai",
  "rd6wb-lyaaa-aaaaj-acvla-cai",
  "zfcdd-tqaaa-aaaaq-aaaga-cai",
  "utozz-siaaa-aaaam-qaaxq-cai",
  "2vgyc-jqaaa-aaaao-a2gdq-cai",
  "vtrom-gqaaa-aaaaq-aabia-cai",
  "uf2wh-taaaa-aaaaq-aabna-cai",
  "mxzaz-hqaaa-aaaar-qaada-cai",
  "lcyu6-siaaa-aaaah-adk2a-cai",
  "aanaa-xaaaa-aaaah-aaeiq-cai",
  "xsi2v-cyaaa-aaaaq-aabfq-cai",
  "73mez-iiaaa-aaaaq-aaasq-cai",
  "5573k-xaaaa-aaaak-aacnq-cai",
  "rffwt-piaaa-aaaaq-aabqq-cai",
  "bf7ec-maaaa-aaaag-qcgda-cai",
  "vyisd-zyaaa-aaaah-adpiq-cai",
  "zzriv-cqaaa-aaaao-a2gjq-cai",
  "qi26q-6aaaa-aaaap-qapeq-cai",
  "4c4fd-caaaa-aaaaq-aaa3a-cai",
  "vgqnj-miaaa-aaaal-qaapa-cai",
  "7a6j3-uqaaa-aaaao-a2g5q-cai",
  "djjfs-tyaaa-aaaak-qagtq-cai",
  "2ouva-viaaa-aaaaq-aaamq-cai",
  "5gxp5-jyaaa-aaaag-qarma-cai",
  "lzvjb-wyaaa-aaaam-qarua-cai",
  "j4tiv-oaaaa-aaaan-qau7a-cai",
  "e2gn7-5aaaa-aaaal-abata-cai",
  "ilmem-diaaa-aaaak-actma-cai",
  "iy6hh-xaaaa-aaaan-qauza-cai",
  "ar2zl-5qaaa-aaaan-qavoa-cai",
  "72uqs-pqaaa-aaaak-aes7a-cai",
  "es3he-kyaaa-aaaah-abzna-cai",
  "6rdgd-kyaaa-aaaaq-aaavq-cai",
  "vlzzc-eaaaa-aaaah-ade2q-cai",
  "pcj6u-uaaaa-aaaak-aewnq-cai"
];

(BigInt.prototype as any).toJSON = function () { return this.toString() }

export const InternetComputerConnection = PieceAuth.CustomAuth({
  description: `
**You're open to setup credentials for InternetComputer wallet or left it blank. **
Without any private key or address you will be limited to use only read methods of InternetComputer.
`,
  required: true,
  props: {
    address: Property.ShortText({
      required: false,
      displayName: "Address",
      description: "If you're using external or tookey signer you can enter your address here."
    }),
    privateKey: PieceAuth.SecretText({
      required: false,
      displayName: "Private Key",
      description: "If you're using plain private key you can enter it here."
    }),
    mnemonic: PieceAuth.SecretText({
      required: false, validators: [
        Validators.pattern(/^([a-z]+\s){11,23}[a-z]+$/)
      ],
      displayName: "Mnemonic Phrase",
      description: "If you're using mnemonic phrase you can enter it here."
    })
  }
})

export const DeployFrontend = createAction({
  requireAuth: true,
  name: "deploy_frontend",
  displayName: "Deploy Frontend",
  description: "Create transaction to update canister frontend code.",
  props: {
    to: Property.ShortText({
      required: true,
      displayName: "To",
      description: "Address to send native currency to."
    }),
    file: Property.File({
      required: true,
      displayName: "File",
      description: "File to deploy."
    }),
  },

  run: function (ctx: ActionContext<PieceAuthProperty, any>): Promise<unknown> {
    throw new Error("Function not implemented.");
  }
})

export const SendNative = createAction({
  requireAuth: true,
  name: "send_native",
  displayName: "Send Native",
  description: "Create transaction to send native currency to another address.",
  props: {
    to: Property.ShortText({
      required: true,
      displayName: "To",
      description: "Address to send native currency to."
    }),
    amount: Property.Number({
      required: true,
      displayName: "Amount",
      description: "Amount of native currency to send."
    })
  },
  run: function (ctx: ActionContext<PieceAuthProperty, any>): Promise<unknown> {
    throw new Error("Function not implemented.");
  }
})

export const SendToken = createAction({
  requireAuth: true,
  name: "send_tokens",
  displayName: "Send Token",
  description: "Create transaction to send DRC20, DIP20, EXT or ICRC-1 tokens to another address.",
  props: {
    token: Property.ShortText({
      required: true,
      displayName: "Token",
      description: "Address of token to send."
    }),
    to: Property.ShortText({
      required: true,
      displayName: "To",
      description: "Address to send native currency to."
    }),
    amount: Property.Number({
      required: true,
      displayName: "Amount",
      description: "Amount of native currency to send."
    })
  },
  run: function (ctx: ActionContext<PieceAuthProperty, any>): Promise<unknown> {
    throw new Error("Function not implemented.");
  }
})

export const DevAction = createAction({
  requireAuth: true,
  auth: InternetComputerConnection,
  name: "dev_action",
  displayName: "Dev Action (test)",
  description: `
Let test features of @dfinity/agent, @psychedelic/cap-js, @psychedelic/dab-js
`,
  props: {

  },

  async run(ctx) {
    const agent = new HttpAgent({ fetch, host: 'https://icp-api.io' });

    const candid = await fetchCandid("4c4fd-caaaa-aaaaq-aaa3a-cai", agent)
    const metas = await Promise.all(tokens.map(async (canisterId) => getTokenActor({ canisterId, agent: agent as any, standard: TOKEN.dip20 })))

    return {
      candid,
      tokens: metas.map((meta, i) => {
        return {
          canisterId: tokens[i],
          meta
        }
      })
    }

    // const token = await getTokenActor({
    //   // GHOST
    //   canisterId: "4c4fd-caaaa-aaaaq-aaa3a-cai",
    //   agent,
    //   standard: TOKEN.icp
    // })

    // const first = createAccountFromMnemonic(ctx.auth.mnemonic!, 0)
    // const second = createAccountFromMnemonic(ctx.auth.mnemonic!, 1)

    // const [balance, meta, tx] = await Promise.all([
    //   token.getBalance(second.identity.getPrincipal()),
    //   token.getMetadata(),
    //   Promise.resolve(null)
    //   // token.send({
    //   //   from: second.identity.getPrincipal().toText(),
    //   //   to: first.identity.getPrincipal().toText(),
    //   //   amount: BigInt(10) * BigInt(10 ** 8)
    //   // })
    // ])


    // return {
    //   balance,
    //   meta,
    //   tx
    // }
  }
})

export const AvailableAddresses = createAction({
  auth: InternetComputerConnection,
  requireAuth: true,
  name: "available_addresses",
  displayName: "Available Addresses",
  description: "Get list of available addresses.",
  props: {},
  async run(ctx) {
    if (ctx.auth.mnemonic) {
      const mnemonic = ctx.auth.mnemonic
      return new Array(10).fill(0).map((_, i) => {
        const acc = createAccountFromMnemonic(mnemonic, i);
        return {
          principal: acc.identity.getPrincipal().toText(),
          accountId: acc.accountId
        }
      })
    } else if (ctx.auth.address) {
      return [
        ctx.auth.address
      ]
    } else {
      throw new Error("No mnemonic provided. Private key isnt yet supported")
    }
  }
})

export const InternetComputer = createPiece({
  displayName: "InternetComputer",
  auth: InternetComputerConnection,
  minimumSupportedRelease: '0.8.0',
  logoUrl: "https://raw.githubusercontent.com/tookey-io/icons/main/piece-internetcomputer.png",
  authors: [
    "Aler Denisov"
  ],
  actions: [AvailableAddresses, SendNative, DeployFrontend, DevAction,],
  triggers: [],
  tags: [
    "@tookey-io"
  ]
});
