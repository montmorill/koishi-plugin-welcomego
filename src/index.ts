import type { Context, Session } from 'koishi'
import { h, Schema } from 'koishi'

export const name = 'welcomego'

declare module 'koishi' {
  interface User {
    avatar?: string
  }
}

export interface Config {
  added: string
  removed: string
}

export const Config: Schema<Config> = Schema.object({
  added: Schema.string().default('{at}，欢迎加入群聊！').description('加入群聊的模板'),
  removed: Schema.string().default('{username}退出了群聊。').description('退出群聊的模板'),
})

export function apply(ctx: Context, config: Config) {
  ctx.i18n.define('', {
    added: config.added,
    removed: config.removed,
  })

  function makeParams(session: Session): object {
    const avatar = (session.user as any)?.avatar
    return {
      user: session.user,
      userId: session.userId,
      username: session.username,
      avatar,
      img: h.img(avatar),
      at: h.at(session.userId),
      channel: session.channel,
      channelId: session.channelId,
      guild: session.guild,
      guildId: session.guildId,
    }
  }

  ctx.on('guild-member-added', async (session) => {
    await session.send(session.text('added', makeParams(session)))
  })

  ctx.on('guild-member-removed', async (session) => {
    await session.send(session.text('removed', makeParams(session)))
  })
}
