import { BasicAuthPropertyValue, Property } from '@activepieces/pieces-framework';
import {httpClient, HttpRequest, HttpMethod } from '@activepieces/pieces-common';

export const trelloCommon = {
    baseUrl: "https://api.trello.com/1/",
    board_id: Property.Dropdown({
        displayName: 'Boards',
        description: 'List of boards',
        required: true,
        refreshers: [],
        options: async ({ auth }) => {
            if (!auth) {
                return {
                    disabled: true,
                    placeholder: 'connect your account first',
                    options: [],
                };
            }

            const basicAuthProperty = auth as BasicAuthPropertyValue;
            const user = await getAuthorisedUser(basicAuthProperty.username, basicAuthProperty.password);
            const boards = await listBoards(basicAuthProperty.username, basicAuthProperty.password, user['id']);

            return {
                options: boards.map((board: { id: string; name: string; }) => ({
                    value: board.id,
                    label: board.name,
                }))
            }
        }
    }),
    list_id: Property.Dropdown({
        displayName: 'Lists',
        description: 'Get lists from a board',
        required: true,
        refreshers: ['board_id'],
        options: async ({ auth, board_id }) => {
            if (auth === undefined || board_id === undefined) {
                return {
                    disabled: true,
                    placeholder: 'connect your account first and select board',
                    options: [],
                };
            }

            const basicAuthProperty = auth as BasicAuthPropertyValue;
            const lists = await listBoardLists(basicAuthProperty.username, basicAuthProperty.password, board_id as string);

            console.log(lists);

            return {
                options: lists.map((list: { id: string; name: string; }) => ({
                    value: list.id,
                    label: list.name,
                }))
            }
        }
    }),
}

/**
 * Gets the authenticated user via API and token
 * @param apikey API Key
 * @param token  Token Key
 * @returns JSON containing Trello user
 */
async function getAuthorisedUser(apikey: string, token: string) {

    const request: HttpRequest = {
        method: HttpMethod.GET,
        url: `${trelloCommon.baseUrl}members/me`
            + `?key=` + apikey
            + `&token=` + token,
        headers: {
            Accept: 'application/json'
        },
        body: {},
        queryParams: {},
    };
    const response = await httpClient.sendRequest(request);

    return response.body;
}

/**
 * Lists all boards a member has access to in Trello
 * @param apikey API Key
 * @param token  API Token
 * @param user_id ID of the user
 * @returns JSON Array of boards user has access to
 */
async function listBoards(apikey: string, token: string, user_id: string) {

    const request: HttpRequest = {
        method: HttpMethod.GET,
        url: `${trelloCommon.baseUrl}members/${user_id}/boards`
            + `?key=` + apikey
            + `&token=` + token,
        headers: {
            Accept: 'application/json'
        },
        body: {},
        queryParams: {},
    };
    const response = await httpClient.sendRequest<{ id: string; name: string; }[]>(request);

    return response.body;
}

/**
 * Gets all the lists inside of a board
 * @param apikey API Key
 * @param token  API Token
 * @param board_id Board to fetch lists from
 * @returns JSON Array of lists
 */
async function listBoardLists(apikey: string, token: string, board_id: string) {

    const request: HttpRequest = {
        method: HttpMethod.GET,
        url: `${trelloCommon.baseUrl}boards/${board_id}/lists`
            + `?key=` + apikey
            + `&token=` + token,
        headers: {
            Accept: 'application/json'
        },
        body: {},
        queryParams: {},
    };
    const response = await httpClient.sendRequest<{ id: string; name: string; }[]>(request);

    return response.body;
}
