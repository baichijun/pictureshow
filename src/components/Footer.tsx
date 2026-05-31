import { useState } from 'react'

/** 页脚随机展示的文案，每次加载页面随机选取一条 */
const FOOTER_QUOTES = [
  '每一个定格的瞬间，都是对抗遗忘的温柔武器。',
  '我们留不住时间，但可以用相册留住时间里的光。',
  '收纳琐碎日常，珍藏人间烟火。',
]

/** 页脚组件 */
export default function Footer() {
  // 使用惰性初始化，确保每次组件挂载（页面加载）随机选定一条文案且渲染期间保持稳定
  const [quote] = useState(
    () => FOOTER_QUOTES[Math.floor(Math.random() * FOOTER_QUOTES.length)],
  )

  return (
    <footer className="mt-20 border-t border-[#262626] py-8 text-center text-sm text-[#a3a3a3]">
      <p>{quote}</p>
    </footer>
  )
}
