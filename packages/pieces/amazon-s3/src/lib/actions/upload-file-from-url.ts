import { Property, createAction } from "@activepieces/pieces-framework";
import { S3 } from "@aws-sdk/client-s3";
import axios from "axios";
import { amazonS3Auth } from "../../";

export const amazonS3UploadFileFromUrlAction = createAction({
    auth: amazonS3Auth,
        name: 'upload-file-from-url',
        displayName: "Upload File from URL",
        description: "Upload an file to S3 by using it's url",
        props: {
            url: Property.LongText({
                displayName: 'url',
                required: true,
            }),
            imageName: Property.ShortText({
                displayName: 'File Name',
                required: false,
                description: "my-file-name (no extension)"
            }),
            acl: Property.StaticDropdown({
                displayName: 'ACL',
                required: false,
                options: {
                    options: [
                        {
                            label: "private",
                            value: "private"
                        },
                        {
                            label: "public-read",
                            value: "public-read"
                        },
                        {
                            label: "public-read-write",
                            value: "public-read-write"
                        },
                        {
                            label: "authenticated-read",
                            value: "authenticated-read"
                        },
                        {
                            label: "aws-exec-read",
                            value: "aws-exec-read"
                        },
                        {
                            label: "bucket-owner-read",
                            value: "bucket-owner-read"
                        },
                        {
                            label: "bucket-owner-full-control",
                            value: "bucket-owner-full-control"
                        }
                    ]
                }
            }),
        },
        async run(context) {
            const { accessKeyId, secretAccessKey, region, bucket } = context.auth;
            const { url, imageName, acl } = context.propsValue;
            const s3 = new S3({
                credentials: {
                    accessKeyId,
                    secretAccessKey
                },
                region: region || "us-east-1"
            })

            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const contentType = response.headers['content-type'];
            const [_, ext] = contentType.split("/");
            const extension = "." + ext;

            const generatedName = new Date().toISOString() + Date.now() + extension;

            const finalFileName = imageName ? imageName + extension : generatedName;

            const uploadResponse = await s3.putObject({
                Bucket: bucket,
                Key: finalFileName,
                ACL: (!acl || acl.length === 0) ? undefined : acl,
                ContentType: contentType,
                Body: response.data,
            })

            return {
                fileName: finalFileName,
                url: `https://${bucket}.s3.${region}.amazonaws.com/${finalFileName}`,
                etag: uploadResponse.ETag,
            };
    },
});
