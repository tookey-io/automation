import { createAction, Property } from '@activepieces/pieces-framework';
import { Dimension, googleSheetsCommon, objectToArray, stringifyArray, ValueInputOption } from '../common/common';
import { googleSheetsAuth } from '../..';

export const insertRowAction = createAction({
    auth: googleSheetsAuth,
    name: 'insert_row',
    description: 'Append a row of values to an existing sheet',
    displayName: 'Insert Row',
    props: {
        spreadsheet_id: googleSheetsCommon.spreadsheet_id,
        include_team_drives: googleSheetsCommon.include_team_drives,
        sheet_id: googleSheetsCommon.sheet_id,
        as_string: Property.Checkbox({
            displayName: 'As String',
            description: 'Inserted values that are dates and formulas will be entered strings and have no effect',
            required: false,
        }),
        first_row_headers: Property.Checkbox({
            displayName: 'Are the First row Headers?',
            description: 'If the first row is headers',
            required: true,
            defaultValue: false,
        }),
        values: googleSheetsCommon.values,

    },
    async run({propsValue, auth}) {
        const values = propsValue['values'];
        const sheetName = await googleSheetsCommon.findSheetName(auth['access_token'],
            propsValue['spreadsheet_id'], propsValue['sheet_id']);
        if (!sheetName) {
            return {}
        }
        const formattedValues = propsValue.first_row_headers ? objectToArray(values) : values['values'];
        const res = await googleSheetsCommon.appendGoogleSheetValues({
            accessToken: auth['access_token'],
            majorDimension: Dimension.COLUMNS,
            range: sheetName,
            spreadSheetId: propsValue['spreadsheet_id'],
            valueInputOption: propsValue['as_string']
                ? ValueInputOption.RAW
                : ValueInputOption.USER_ENTERED,
            values: stringifyArray(formattedValues),
        });
        return res.body;
    },

});
