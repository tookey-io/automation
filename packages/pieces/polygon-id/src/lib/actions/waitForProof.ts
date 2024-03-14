import { byteEncoder } from '@0xpolygonid/js-sdk';
import { ActionContext, PieceAuthProperty, Property, createAction } from '@activepieces/pieces-framework';
import { ExecutionType, PauseType } from '@activepieces/shared';
import { Token } from '@iden3/js-jwz';
import authV2verification from '../../circuts/authV2/verification_key.json';

export const waitForProof = createAction({
    name: 'wait_proof',
    displayName: 'Wait Proof',
    description: 'Wait for proof requested before',
    props: {
        from: Property.ShortText({
            displayName: 'From',
            description: 'Polygon ID identifier of the sender',
            required: false,
        }),
    },
    async run(ctx) {
        if (ctx.executionType === ExecutionType.BEGIN) {
            ctx.run.pause({
                pauseMetadata: {
                    type: PauseType.WEBHOOK,
                    actions: ['approve', 'disapprove'],
                },
            });
            return {
                jwz: 'eyJhbGciOiJncm90aDE2IiwiY2lyY3VpdElkIjoiYXV0aFYyIiwiY3JpdCI6WyJjaXJjdWl0SWQiXSwidHlwIjoiYXBwbGljYXRpb24vaWRlbjMtemtwLWpzb24ifQ.eyJpZCI6IjAyYWQzOWVjLWZiMjUtNDA4Yy1iNTc2LWQ2ZTNhNzg3Mzc3MSIsInR5cCI6ImFwcGxpY2F0aW9uL2lkZW4zLXprcC1qc29uIiwidHlwZSI6Imh0dHBzOi8vaWRlbjMtY29tbXVuaWNhdGlvbi5pby9hdXRob3JpemF0aW9uLzEuMC9yZXNwb25zZSIsInRoaWQiOiIyODMwOWFiOC1jYzIzLTRhMzctYjE4Zi03YWFiMThjZjUxZTgiLCJib2R5Ijp7ImRpZF9kb2MiOnsiY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvZGlkL3YxIl0sImlkIjoiZGlkOnBvbHlnb25pZDpwb2x5Z29uOm11bWJhaToycU1yZmZtTW9HRW11Y2RaWmN0U3p5bW9RS1pZNjZZR04xejc5N1RxeXAiLCJzZXJ2aWNlIjpbeyJpZCI6ImRpZDpwb2x5Z29uaWQ6cG9seWdvbjptdW1iYWk6MnFNcmZmbU1vR0VtdWNkWlpjdFN6eW1vUUtaWTY2WUdOMXo3OTdUcXlwI3B1c2giLCJ0eXBlIjoicHVzaC1ub3RpZmljYXRpb24iLCJzZXJ2aWNlRW5kcG9pbnQiOiJodHRwczovL3B1c2gtc3RhZ2luZy5wb2x5Z29uaWQuY29tL2FwaS92MSIsIm1ldGFkYXRhIjp7ImRldmljZXMiOlt7ImNpcGhlcnRleHQiOiJMc3h2azlKYzRkZEpPNTB1MkZSM0xqNFJxNVVxdVZvSllsb2dYSnBKd0M0aW15cUQ3dnFHaU5nWXJLcC8vWkJwZDNHSGU3eXcxNHkxK0F4K3JiRm1ZU2E1VStMVFR1d012RnhJdlhoQnN3TlFuem9lRHFCd0ZJMm42aldJOHlxcFN6Uk9FWlpnT2xSTEpGRm0yV3ppS1NpSWVpM1h6R0Q4LzE4REV1V3d2Tm5aYWkyVVFEbTdXYSs0anVTRUZIOEFSZVg3d1NxOWZ0R0loUjlzQTk5NTZMbzB1WkljRm5XZnVmZVAvbzJsY0lYMFVDQW1OcGh6N3Z2ZjFZbGJyY0VmeGdHU3lZalRaenc2ekE0cDJTNXVmTnFqU2J4Ris0dkIrbGNjSWJRdUpVYXozQkxIanZXcWxWREVWdDZRSmx3UEdiRm9OcGNlbzVBcjU5NldnMmRabmtFYzRkODU5ZkZvQUJoQmtIN3dqcWh2NHRNTkxmN3MxLzRlUzZPV1p0eEZCdFpGOHNyQkdraEM5cjFWcElFS2N0M1loMzhDSlVsR3o2L21USU41QU9zVEY0d3M2eWp5V3BjR1hhRXRIU1RiME90bm1xUyt1YTM2US9oY1FDNGs1djhjRGJibG5LblF3QnVza1Z0SDUvZHlTY0FnYzhxZisyOG9Edk92S1NERXpFcElTc2k2Y2dEcENDWHU0RCtRNktMZlAyTGNNVG5oZDV0NDF1ZHhNUkdwci9vdkxWWmVmdklLWG85OW12dzJ1WkRvYUFWdUZWcDJRVFJRWlJiK3BlOTJFa3lma3NWWUI2VmxzeEZQWFJBdlRqOHRkc2dZSTFxalB0WUs1d0ZNY3FIWUtsOHVpOFYyR2g2Nm1BSnJadG5aNUNsQ0trTXZOcFlLTXR4dDRIaz0iLCJhbGciOiJSU0EtT0FFUC01MTIifV19fV19LCJtZXNzYWdlIjoiIiwic2NvcGUiOltdfSwiZnJvbSI6ImRpZDpwb2x5Z29uaWQ6cG9seWdvbjptdW1iYWk6MnFNcmZmbU1vR0VtdWNkWlpjdFN6eW1vUUtaWTY2WUdOMXo3OTdUcXlwIiwidG8iOiJkaWQ6aWRlbjM6cG9seWdvbjptdW1iYWk6eDRxdHJDS2Q1YmJzcGpTWmtQc2JRQkNaUWhiQ3BLemlqQnNGWDJmbnkifQ.eyJwcm9vZiI6eyJwaV9hIjpbIjE3MjkzNzcyOTg3NDA2Njk1ODgwNTgxNjM2NjgwMDI5NTkyMjEwMDAyNDg2NDAwNTcwMzQwMjE5ODgyMzk1ODc1NjI3OTk4NTE4NDc4IiwiMTQyNDI2NzU0MDQ3NTYwNTY4NTYwNzQ1ODA3NTE4MzkzOTE5MTc3NTM2NTAyNDU3NzAxMzE0ODUyMTczNzc2NjcwNjQ5NTMwNDk3MzUiLCIxIl0sInBpX2IiOltbIjkxNzQxNjc3NTUzNjA2ODg1NTE3NDczMjgzMzk5MTYzMzY0NjQ0NTE3MjI5NjgzMTk2MTI5ODQzODAzNTUxMjEyMDc4NzU0Mjc2NzYiLCIxMzIxMzE5MTcyNzYyNzAzMjc2MDIxMzAyODA2OTczODQwMjM0MDgzNDgwNzQ5NTA0MTMwNjY4MjExMjU1MzEwMDAzMjI5NTQ3MDQ4NyJdLFsiODMzMTQxMDQ4Mzk2NjYxOTczMjQ2MDY4ODQyMzg0NDI3MjQ4OTc0NzA0NDk5MTc5MzE4NDYyMzkyNDI4OTkwMTI3MTk5MjkzNDM5OCIsIjE4NDkzODEwMjI0MDE0NjU5MTA5MTAxMjA3NjY2MjQ4NDk3ODUzMDI4NzIzMDk0MzU4NDc4NjYzMjU3ODgyNzY1MDk0Njk4MjE5MjIxIl0sWyIxIiwiMCJdXSwicGlfYyI6WyIxMDk3MzM1NTkwMTkwMTcyODg1NTcxMDUxNjg3ODA1MTc2Nzg2Mjg3NDgxNTcyOTMyNjM0NjQ5NTY2MTUyMTQ0NzQ4NDkzNzYwMDMxNSIsIjEzOTk3NDM5ODQ2OTU5MDA3MTExMzA3MDQ4NTI1MzYwNzkzNjA1OTEyNjA3MTkxNDc5NTA0NTA0OTk2MzY2MTQyOTQ4MzMyOTg1NjMyIiwiMSJdLCJwcm90b2NvbCI6Imdyb3RoMTYiLCJjdXJ2ZSI6ImJuMTI4In0sInB1Yl9zaWduYWxzIjpbIjI2NzkwNzU3NDEzNDkwMjgxMDYwMjM1MTE4NzU4NzExNTYzODkwMTA2ODI4Mjc1OTE3NzM4Mzc3MzM0NzYxMjY4NDk2NDM3NzYyIiwiMTgwMTAyNDE4NjU2NjgzODI3OTQwMDk3MjYyMTcwNjA1OTg5MDA4MzE4OTE4MzQ0MzE5MjE3ODYxNjc1OTQ1MTQyMzI1MjIyMzU2MzciLCIxOTM1OTMwNDU1NTM5OTE1ODg5MDk0NTE5Mjk1MjE0NDExMDUyMTQ2MDk2NjY1MTY2NjI4NzUyNjE0NzAzMzE0MTI3Mzg0MDUxNzA5MSJdfQ',
                verified: true,
                payloadDecoded: {
                    id: '02ad39ec-fb25-408c-b576-d6e3a7873771',
                    typ: 'application/iden3-zkp-json',
                    type: 'https://iden3-communication.io/authorization/1.0/response',
                    thid: '28309ab8-cc23-4a37-b18f-7aab18cf51e8',
                    body: {
                        did_doc: {
                            context: ['https://www.w3.org/ns/did/v1'],
                            id: 'did:polygonid:polygon:mumbai:2qMrffmMoGEmucdZZctSzymoQKZY66YGN1z797Tqyp',
                            service: [
                                {
                                    id: 'did:polygonid:polygon:mumbai:2qMrffmMoGEmucdZZctSzymoQKZY66YGN1z797Tqyp#push',
                                    type: 'push-notification',
                                    serviceEndpoint: 'https://push-staging.polygonid.com/api/v1',
                                    metadata: {
                                        devices: [
                                            {
                                                ciphertext:
                                                    'Lsxvk9Jc4ddJO50u2FR3Lj4Rq5UquVoJYlogXJpJwC4imyqD7vqGiNgYrKp//ZBpd3GHe7yw14y1+Ax+rbFmYSa5U+LTTuwMvFxIvXhBswNQnzoeDqBwFI2n6jWI8yqpSzROEZZgOlRLJFFm2WziKSiIei3XzGD8/18DEuWwvNnZai2UQDm7Wa+4juSEFH8AReX7wSq9ftGIhR9sA9956Lo0uZIcFnWfufeP/o2lcIX0UCAmNphz7vvf1YlbrcEfxgGSyYjTZzw6zA4p2S5ufNqjSbxF+4vB+lccIbQuJUaz3BLHjvWqlVDEVt6QJlwPGbFoNpceo5Ar596Wg2dZnkEc4d859fFoABhBkH7wjqhv4tMNLf7s1/4eS6OWZtxFBtZF8srBGkhC9r1VpIEKct3Yh38CJUlGz6/mTIN5AOsTF4ws6yjyWpcGXaEtHSTb0OtnmqS+ua36Q/hcQC4k5v8cDbblnKnQwBuskVtH5/dyScAgc8qf+28oDvOvKSDEzEpISsi6cgDpCCXu4D+Q6KLfP2LcMTnhd5t41udxMRGpr/ovLVZefvIKXo99mvw2uZDoaAVuFVp2QTRQZRb+pe92EkyfksVYB6VlsxFPXRAvTj8tdsgYI1qjPtYK5wFMcqHYKl8ui8V2Gh66mAJrZtnZ5ClCKkMvNpYKMtxt4Hk=',
                                                alg: 'RSA-OAEP-512',
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                        message: '',
                        scope: [],
                    },
                    from: 'did:polygonid:polygon:mumbai:2qMrffmMoGEmucdZZctSzymoQKZY66YGN1z797Tqyp',
                    to: 'did:iden3:polygon:mumbai:x4qtrCKd5bbspjSZkPsbQBCZQhbCpKzijBsFX2fny',
                },
            };
        } else {
            if (typeof ctx.resumePayload === 'object' && ctx.resumePayload && 'body' in ctx.resumePayload) {
                const jwz = ctx.resumePayload.body as string;
                if (!jwz || typeof jwz !== 'string') {
                    throw new Error('Invalid payload');
                }

                const parsed = await Token.parse(jwz);
                let payloadDecoded: Record<string, unknown> & {
                    id: string;
                    typ: string;
                    type: string;
                    thid: string;
                    body: Object;
                    from: string;
                    to: string;
                } = JSON.parse(parsed.getPayload());

                const verified = await parsed.verify(byteEncoder.encode(JSON.stringify(authV2verification)));
                if (!verified) {
                    throw new Error('Invalid payload');
                }

                if (ctx.propsValue.from && payloadDecoded.from !== ctx.propsValue.from) {
                    throw new Error('Invalid sender');
                }

                return {
                    jwz,
                    verified,
                    payloadDecoded,
                };
            } else {
                throw new Error('Invalid payload');
            }
        }
    },
});
