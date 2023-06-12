import { createPiece } from '@activepieces/pieces-framework';
import { telegramSendMessageAction } from './lib/action/send-text-message.action';
import { telegramNewMessage } from './lib/trigger/new-message';

export const telegramBot = createPiece({
	displayName: "Telegram bot",
	logoUrl: 'https://cdn.activepieces.com/pieces/telegram_bot.png',
	actions: [telegramSendMessageAction],
	authors: ['abuaboud', 'Abdallah-Alwarawreh'],
	triggers: [telegramNewMessage],
});
