import { MigrationInterface, QueryRunner } from 'typeorm'
import { decryptObject, encryptObject } from '../../../helper/encryption'
import { logger } from '../../../helper/logger'

export class encryptCredentials1676505294811 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        logger.info('encryptCredentials1676505294811 up: started')
        const connections = await queryRunner.query('SELECT * FROM app_connection')
        for (const currentConnection of connections) {
            currentConnection.value = encryptObject(currentConnection.value)
            await queryRunner.query(`UPDATE app_connection SET value = '${JSON.stringify(currentConnection.value)}' WHERE id = ${currentConnection.id}`)
        }
        logger.info('encryptCredentials1676505294811 up: finished')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        logger.info('encryptCredentials1676505294811 down: started')
        const connections = await queryRunner.query('SELECT * FROM app_connection')
        for (const currentConnection of connections) {
            try {
                currentConnection.value = decryptObject(currentConnection.value)
                await queryRunner.query(`UPDATE app_connection SET value = '${JSON.stringify(currentConnection.value)}' WHERE id = ${currentConnection.id}`)
            }
            catch (e) {
                logger.error(e)
            }
        }
        logger.info('encryptCredentials1676505294811 down: finished')
    }

}
