import { createAction, Property } from '@activepieces/pieces-framework';
import { ValueInputOption } from '../common/common';
import { googleSheetsCommon } from '../common/common';
export const updateRowAction = createAction({
    name: 'update_row',
    description: 'Overwrite values in an existing row',
    displayName: 'Update Row',
    props: {
        authentication: googleSheetsCommon.authentication,
        spreadsheet_id: googleSheetsCommon.spreadsheet_id,
        sheet_id: googleSheetsCommon.sheet_id,
        row_id: Property.Number({
            displayName: 'Row Number',
            description: 'The row number to update',
            required: true,
        }),
        values: Property.Array({
            displayName: 'Values',
            description: 'These are the cell values of the row that will be updated',
            required: true,
        }),
    },
    async run(context) {
        const values = context.propsValue['values'];

        const sheetName = await googleSheetsCommon.findSheetName(context.propsValue['authentication']['access_token'], context.propsValue['spreadsheet_id'], context.propsValue['sheet_id']);
        if (!sheetName) {
            throw Error("Sheet not found in spreadsheet");
        }
        if (Array.isArray(values)) {
            const res = await googleSheetsCommon.updateGoogleSheetRow({
                accessToken: context.propsValue['authentication']['access_token'],
                rowIndex:  Number(context.propsValue.row_id),
                sheetName: sheetName,
                spreadSheetId: context.propsValue['spreadsheet_id'],
                valueInputOption: ValueInputOption.USER_ENTERED,
                values: values as string[],
            });

            
            res.body.updatedRange = res.body.updatedRange.replace(sheetName + "!", "");
            res.body.updatedRange = res.body.updatedRange.split(":");
            const UpdatedRows = [];
            
            for (let i = 0; i < res.body.updatedRange.length; i++) 
                UpdatedRows.push({ [res.body.updatedRange[i].charAt(0)]: parseInt(res.body.updatedRange[i].slice(1)) });
            

            return UpdatedRows;
        } else {
            throw Error("Values passed are not an array")
        }
    },
});