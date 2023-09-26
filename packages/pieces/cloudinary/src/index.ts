import {
    ActionContext,
    createAction,
    createPiece,
    PieceAuth,
    PieceAuthProperty,
    Property,
} from '@activepieces/pieces-framework';

import axios from 'axios';

import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryAuth = PieceAuth.SecretText({
    required: true,
    displayName: 'API Environment variable',
    description: `
  To obtain your API environment variable, follow these steps:

  1. Log in to your Cloudinary account.
  2. Visit [Dashboard](https://console.cloudinary.com/console)
  3. Copy the API environment variable.
  `,
});

export const urlToConfig = (url: string) => {
    if (url.startsWith('CLOUDINARY_URL=')) {
        url = url.replace('CLOUDINARY_URL=', '');
    }

    const regex = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/;

    const match = url.match(regex);

    if (match) {
        const [, api_key, api_secret, cloud_name] = match;
        return { api_key, api_secret, cloud_name };
    }
    throw new Error('Invalid Cloudinary URL: ' + url + match);
};

export const UploadImage = createAction({
    auth: CloudinaryAuth,
    requireAuth: true,
    displayName: 'Upload Image',
    name: 'upload_image',
    description: 'Uploads an image to Cloudinary',
    props: {
        image: Property.File({
            description: 'URL or base64 bytes of the audio to classify',
            displayName: 'Input URL or bytes',
            required: true,
        }),
    },
    run: async function (ctx) {
        cloudinary.config({
            secure: false,
            ...urlToConfig(ctx.auth),
        });

        return cloudinary.uploader.upload(
            `data:image/png;base64,${ctx.propsValue.image.base64}`
        );
    },
});

export const ResizeImage = createAction({
    requireAuth: true,
    auth: CloudinaryAuth,
    name: 'resize_image',
    displayName: 'Resize Image',
    description: 'Resize an image to a specific size',
    props: {
        id: Property.ShortText({
            displayName: 'Image ID',
            description: 'The ID of the image to resize',
            required: true,
        }),
        width: Property.Number({
            displayName: 'Width',
            description: 'The width of the image',
            required: true,
        }),
        height: Property.Number({
            displayName: 'Height',
            description: 'The height of the image',
            required: true,
        }),
        crop: Property.StaticDropdown({
            displayName: 'Crop',
            description: 'The crop mode',
            required: false,
            options: {
                options: [
                    'scale',
                    'fit',
                    'limit',
                    'mfit',
                    'fill',
                    'lfill',
                    'pad',
                    'lpad',
                    'mpad',
                    'crop',
                    'thumb',
                    'imagga_crop',
                    'imagga_scale',
                ].map((v) => ({ label: v, value: v })),
            },
        }),
        format: Property.StaticDropdown({
            displayName: 'Format',
            description: 'The format of the image',
            required: false,
            options: {
                options: [
                    'gif',
                    'png',
                    'jpg',
                    'bmp',
                    'ico',
                    'pdf',
                    'tiff',
                    'eps',
                    'jpc',
                    'jp2',
                    'psd',
                    'webp',
                    'zip',
                    'svg',
                    'webm',
                    'wdp',
                    'hpx',
                    'djvu',
                    'ai',
                    'flif',
                    'bpg',
                    'miff',
                    'tga',
                    'heic',
                ].map((v) => ({ label: v, value: v })),
            },
        }),
    },
    run: async ({ auth, propsValue: { id, crop, width, height, format } }) => {
        cloudinary.config({
            secure: false,
            ...urlToConfig(auth),
        });

        const url = cloudinary.url(id, {
            crop,
            width,
            height,
            format
        });

        const file = await axios.get(url, {
          responseType: 'arraybuffer'
        }).then((res) => {
          const buffer = Buffer.from(res.data, 'binary')

          return {
            size: buffer.length,
            base64: buffer.toString('base64')
          }
        })

        return {
          file,
          url
        }
    },
});

// export const ConvertImage = createAction({
//
// })

export const Cloudinary = createPiece({
    displayName: 'Cloudinary',
    description:
        'Programmable Media AI-powered APIs automate image and video lifecycles',
    auth: CloudinaryAuth,
    minimumSupportedRelease: '0.8.0',
    logoUrl: 'https://raw.githubusercontent.com/tookey-io/icons/main/piece-cloudinary.png',
    authors: [],
    actions: [UploadImage, ResizeImage],
    triggers: [],
});
