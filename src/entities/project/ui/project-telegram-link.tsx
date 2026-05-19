import { buildTelegramPhoneUrl } from '../lib/build-telegram-phone-url'

interface ProjectTelegramLinkProps {
  phone: string
  onClick?: (e: React.MouseEvent) => void
}

export function ProjectTelegramLink({ phone, onClick }: ProjectTelegramLinkProps) {
  const url = buildTelegramPhoneUrl(phone)
  if (!url) return null

  return (
    <p className="text-xs text-[#ACACAC]">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        onClick={onClick}
        className="text-funnel-preproject underline-offset-2 hover:underline"
      >
        Ссылка на телеграм
      </a>
    </p>
  )
}
