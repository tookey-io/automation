import { OAuth2PropertyValue, Property } from "@activepieces/pieces-framework";
import { AuthenticationType, httpClient, HttpMessageBody, HttpMethod, HttpResponse } from "@activepieces/pieces-common";

export const salesforcesCommon = {
    object: Property.Dropdown<string>({
        displayName: "Object",
        required: true,
        description: "Select the Object",
        refreshers: [],
        options: async ({ auth }) => {
            if(!auth){
                return {
                    disabled: true,
                    placeholder: 'connect your account first',
                    options: [],
                }
            }
            const options = await getSalesforceObjects(auth as OAuth2PropertyValue);
            return {
                disabled: false,
                options: options.body['sobjects'].map((object: any) => {
                    return {
                        label: object.label,
                        value: object.name
                    }
                }).sort((a: {label: string}, b: {label: string}) => a.label.localeCompare(b.label))
                .filter((object: {label: string}) => !object.label.startsWith("_"))
            }
        }
    }),
    field: Property.Dropdown<string>({
        displayName: "Field",
        description: "Select the Field",
        required: true,
        refreshers: ['object'],
        options: async ({ auth, object }) => {
            if(auth === undefined || !object){
                return {
                    disabled: true,
                    placeholder: 'connect your account first',
                    options: [],
                }
            }
            const options = await getSalesforceFields(auth as OAuth2PropertyValue, object as string);
            return {
                disabled: false,
                options: options.body['fields'].map((field: any) => {
                    return {
                        label: field.label,
                        value: field.name
                    }
                })
            }
        }
    })
}


export async function callSalesforceApi<T extends HttpMessageBody>(method: HttpMethod,
    authentication: OAuth2PropertyValue,
    url: string,
    body: Record<string,unknown> | undefined): Promise<HttpResponse<T>> {
    return await httpClient.sendRequest<T>({
        method: method,
        url: `${authentication.data['instance_url']}${url}`,
        body,
        authentication: {
            type: AuthenticationType.BEARER_TOKEN,
            token: authentication['access_token']
        }
    });
}

export async function querySalesforceApi<T extends HttpMessageBody>(method: HttpMethod,
    authentication: OAuth2PropertyValue,
    query: string): Promise<HttpResponse<T>> {
    return await httpClient.sendRequest<T>({
        method: method,
        url: `${authentication.data['instance_url']}/services/data/v56.0/query`,
        queryParams: {
            q: query
        },
        authentication: {
            type: AuthenticationType.BEARER_TOKEN,
            token: authentication['access_token']
        }
    });
}

async function getSalesforceObjects(authentication: OAuth2PropertyValue): Promise<HttpResponse<HttpMessageBody>> {
    return await httpClient.sendRequest<HttpMessageBody>({
        method: HttpMethod.GET,
        url: `${authentication.data['instance_url']}/services/data/v56.0/sobjects`,
        authentication: {
            type: AuthenticationType.BEARER_TOKEN,
            token: authentication['access_token']
        }
    });
}
// Write function to list all fields name inside salesforce object
async function getSalesforceFields(authentication: OAuth2PropertyValue, object: string): Promise<HttpResponse<HttpMessageBody>> {
    return await httpClient.sendRequest<HttpMessageBody>({
        method: HttpMethod.GET,
        url: `${authentication.data['instance_url']}/services/data/v56.0/sobjects/${object}/describe`,
        authentication: {
            type: AuthenticationType.BEARER_TOKEN,
            token: authentication['access_token']
        }
    });
}
