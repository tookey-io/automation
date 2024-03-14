import { FetchHandler, ProofService, byteEncoder, PlainPacker, PackageManager, PROTOCOL_CONSTANTS, CredentialFetchRequestMessage } from '@0xpolygonid/js-sdk';
import { ActionContext, PieceAuthProperty, createAction } from '@activepieces/pieces-framework';
import { ExecutionType, PauseType } from '@activepieces/shared';
import { Token } from '@iden3/js-jwz';
import authV2verification from '../../circuts/authV2/verification_key.json';
import { initializeContext } from '../initializeContext';
import { PolygonIdAuth } from '../..';

export const waitForClaim = createAction({
    name: 'wait_claim',
    displayName: 'Wait Claim',
    description: 'Wait for claim offered before',
    props: {},
    requireAuth: true,
    auth: PolygonIdAuth,
    async run(ctx) {
        if (ctx.executionType === ExecutionType.BEGIN) {
            ctx.run.pause({
                pauseMetadata: {
                    type: PauseType.WEBHOOK,
                    actions: ['claim', 'reject'],
                },
            });
            return {
                id: 'urn:ce8b7540-0826-4f60-8b49-7ce05222c54d',
                '@context': [
                    'https://www.w3.org/2018/credentials/v1',
                    'https://schema.iden3.io/core/jsonld/iden3proofs.jsonld',
                    'ipfs://QmXEpG89uma1SF83oygEzkNoD6Wp2DSkqu6zyZcT1xAvrK',
                ],
                type: ['VerifiableCredential', 'pd'],
                credentialSubject: {
                    id: 'did:polygonid:polygon:mumbai:2qMrffmMoGEmucdZZctSzymoQKZY66YGN1z797Tqyp',
                    full_name: 'Aler Denisov',
                    email: 'ceo@tookey.io',
                    phone: '+7(985) 725-45-26',
                    type: 'pd',
                },
                issuer: 'did:iden3:polygon:mumbai:x4qtrCKd5bbspjSZkPsbQBCZQhbCpKzijBsFX2fny',
                expirationDate: '2361-03-21T19:14:48.000Z',
                issuanceDate: '2024-01-24T13:23:17.903Z',
                credentialSchema: {
                    id: 'https://ipfs.io/ipfs/QmSNbiQsJtbZSHLKgcV7mvCDYkyQo2R5hqfMBF3Ltbnb8u',
                    type: 'JsonSchema2023',
                },
                credentialStatus: {
                    id: 'https://rhs-staging.polygonid.me/node?state=896ce94142d197e13a53d74404e78f4bda302b3f462024bd04acb12b0e712e2b',
                    type: 'Iden3ReverseSparseMerkleTreeProof',
                    revocationNonce: 2782,
                },
                proof: [
                    {
                        issuerData: {
                            id: 'did:iden3:polygon:mumbai:x4qtrCKd5bbspjSZkPsbQBCZQhbCpKzijBsFX2fny',
                            state: {
                                rootOfRoots: '0000000000000000000000000000000000000000000000000000000000000000',
                                revocationTreeRoot: '0000000000000000000000000000000000000000000000000000000000000000',
                                claimsTreeRoot: '08467c8f457d983a514718846fa987599c5df02ca3f1a198f1218a5ebca64414',
                                value: '896ce94142d197e13a53d74404e78f4bda302b3f462024bd04acb12b0e712e2b',
                            },
                            mtp: {
                                existence: true,
                                siblings: [],
                            },
                            authCoreClaim:
                                'cca3371a6cb1b715004407e325bd993c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004231279f56e8bbd8e7bfd3ce4b3e41b294b6a531bfcbc2df3f81dd8ccb804010291936d4b7633a5440d1cfdfd75ffb3e8936013e6b2cecddc2692ba4c8902200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                            credentialStatus: {
                                id: 'https://rhs-staging.polygonid.me/node?state=896ce94142d197e13a53d74404e78f4bda302b3f462024bd04acb12b0e712e2b',
                                type: 'Iden3ReverseSparseMerkleTreeProof',
                                revocationNonce: 0,
                            },
                        },
                        type: 'BJJSignature2021',
                        coreClaim:
                            '5c5b50b891d29769319162f6c2f610230a0000000000000000000000000000000212ced5208c58bf3c7000bb3e4dda2ba8930fe8e9ecef952ae2fa6bbc290f009ec65bb54f180956fad7853b5d42fb28621c89bcf12feca92870f5c074525d2fe39f63f2188e8136cd34db554f54c41a741508a2e6b45a862095b9c4aad5902fde0a000000000000281cdcdf02000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a04625e64de2921db424c38e4628faace27c933106dc99342588f5e135a00c2c0000000000000000000000000000000000000000000000000000000000000000',
                        signature:
                            '94a699a997c0146cbb2dd4f5d87e3627ee1e4eeaab8eb4814334d9b2354166aa2a803481207c0ffd675aeff8de201a75cb84c9a4633c485f58c59399cf1aaf04',
                    },
                ],
            };
        } else {
            if (typeof ctx.resumePayload === 'object' && ctx.resumePayload && 'body' in ctx.resumePayload) {
                const store = await initializeContext(ctx);
                const jwz = ctx.resumePayload.body as string;
                if (!jwz || typeof jwz !== 'string') {
                    throw new Error('Invalid payload');
                }

                const parsed = await Token.parse(jwz);
                console.dir(parsed);
                let payloadDecoded = JSON.parse(parsed.getPayload()) as CredentialFetchRequestMessage;

                const id = payloadDecoded.body?.id
                if (!id) {
                    throw new Error('Invalid payload');
                }
                
                const credential = await store.credential.findCredentialById(id);

                if (!credential) {
                    throw new Error('Credential not found');
                }
                
                return {
                    id: Math.random().toString(32).substring(2),
                    type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE,
                    typ: payloadDecoded.typ ?? PROTOCOL_CONSTANTS.MediaType.PlainMessage,
                    thid: payloadDecoded.thid ?? Math.random().toString(32).substring(2),
                    body: { credential },
                    from: payloadDecoded.to,
                    to: payloadDecoded.from
                }
            } else {
                throw new Error('Invalid payload');
            }
        }
    },
});
