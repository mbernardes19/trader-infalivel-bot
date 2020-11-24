import { getChatInviteLink, exportChatsInviteLink } from '../../src/services/chatInviteLink';
import { Telegram } from 'telegraf';

process.env.ID_CANAL_BASIC = '-1001357807229';
process.env.ID_CANAL_VIP = '-1001454484339';
process.env.ID_GRUPO_PREMIUM= '-1001402964220';

jest.mock('telegraf/telegram');
const mockedTelegramClient = new Telegram('1478463075:AAFUV8x_w7gmhe-fpr4DvKi0-u2GefqlbZc') as jest.Mocked<Telegram>
mockedTelegramClient.exportChatInviteLink.mockReturnValue(Promise.resolve('invite'))

beforeAll( async () => {
    await exportChatsInviteLink(mockedTelegramClient)
})

describe('ChatInviteLink Service', () => {
    const ID_CANAL_BASIC=-1001357807229
    const ID_CANAL_VIP=-1001454484339
    const ID_GRUPO_PREMIUM=-1001402964220

    it('returns BASIC channel invite data', () => {
        const inviteData = getChatInviteLink(ID_CANAL_BASIC)
        expect(inviteData.chatName).toBe('BASIC')
        expect(inviteData.invite).toBeTruthy();
    })

    it('returns PREMIUM channel invite data', () => {
        const inviteData = getChatInviteLink(ID_GRUPO_PREMIUM)
        expect(inviteData.chatName).toBe('PREMIUM')
        expect(inviteData.invite).toBeTruthy();
    })

    it('returns VIP channel invite data', () => {
        const inviteData = getChatInviteLink(ID_CANAL_VIP)
        expect(inviteData.chatName).toBe('VIP')
        expect(inviteData.invite).toBeTruthy();
    })

    it('throws error when a invalid channel is requested', () => {
        expect(() => getChatInviteLink(123)).toThrow()
    })

    it('generates invite links for all three channel', async () => {
        jest.resetAllMocks()
        await exportChatsInviteLink(mockedTelegramClient)
        expect(mockedTelegramClient.exportChatInviteLink).toHaveBeenCalledTimes(3)
    });
})