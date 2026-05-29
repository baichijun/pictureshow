/** 多平台部署域名配置（与 deploy/targets.json 保持一致） */
export const DEPLOY_TARGETS = {
  github: {
    id: 'github',
    domain: 'ai-pictureshow-git.qiguangming.com',
    platform: 'GitHub Pages',
  },
  edgeone: {
    id: 'edgeone',
    domain: 'ai.pictureshow-edgeone-qiguangming.com',
    platform: 'Tencent EdgeOne Pages',
  },
} as const

export type DeployTargetId = keyof typeof DEPLOY_TARGETS

/** 当前构建目标（构建时注入，默认 github） */
export const DEPLOY_TARGET: DeployTargetId =
  (import.meta.env.VITE_DEPLOY_TARGET as DeployTargetId) || 'github'

export const SITE_DOMAIN = DEPLOY_TARGETS[DEPLOY_TARGET]?.domain ?? DEPLOY_TARGETS.github.domain
