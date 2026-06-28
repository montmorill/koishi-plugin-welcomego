import type { Context, Session } from 'koishi'
import { h, Schema } from 'koishi'
import {} from 'koishi-plugin-qq-user-info'

export const name = 'welcomego'
export const inject = {
  optional: ['qq-user-info'],
}

export interface Config {
  added: string
  removed: string
}

export const Config: Schema<Config> = Schema.object({
  added: Schema.string().default('{at}，欢迎加入群聊！').description('入群模板。'),
  removed: Schema.string().default('{username}退出了群聊。').description('退群模板。'),
}).description('模板设置')

export function apply(ctx: Context, config: Config) {
  ctx.i18n.define('', {
    added: config.added,
    removed: config.removed,
  })

  async function resolveParams(session: Session): Promise<object> {
    await session.observeUser(['name'])
    await ctx['qq-user-info']?.processSession?.(session)
    const avatar = session.event.user?.avatar
    const params = {
      user: session.user,
      userId: session.userId,
      username: session.username,
      avatar,
      img: avatar ? h.img(avatar) : undefined,
      at: h.at(session.userId),
      channel: session.channel,
      channelId: session.channelId,
      guild: session.guild,
      guildId: session.guildId,
    }
    return params
  }

  ctx.on('guild-member-added', async (session) => {
    await session.send(session.text('added', await resolveParams(session)))
  })

  ctx.on('guild-member-removed', async (session) => {
    await session.send(session.text('removed', await resolveParams(session)))
  })
}
