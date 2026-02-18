import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeftRight, Wallet, History, ChartPie } from 'lucide-react'

export function Sidebar() {
  return (
    <aside className='flex h-screen min-w-[302px] flex-col justify-between border-r border-(--border) bg-(--panel) p-4 text-(--text) font-sans'>
      <div>
        <div className='mb-4'>
          <div className='flex items-center gap-3'>
            <Image src='/assets/Logo.svg' alt='Logo' width={32} height={32} />
            <span className='text-[32px] font-mono tracking-wide text-[#FAFAFA]'>Abrium</span>
          </div>
        </div>
        <nav>
          <ul className='flex flex-col gap-2'>
            <li>
              <Link
                href='/'
                className='flex items-center gap-3 rounded-xl bg-(--swap-action-bg) px-3 py-2.5 text-[16px] font-medium text-(--swap-action-text) shadow-sm'
              >
                <ArrowLeftRight size={16} />
                Swap
              </Link>
            </li>
            {[
              { label: 'Portfolio', icon: <Wallet size={16} /> },
              { label: 'History', icon: <History size={16} /> },
              { label: 'Analytics', icon: <ChartPie size={16} /> }
            ].map(item => (
              <li key={item.label}>
                <Link
                  href='#'
                  className='flex items-center gap-3 rounded-xl px-3 py-2.5 text-[16px] font-medium text-(--muted) hover:bg-(--token-row-hover-bg) hover:text-(--text) transition-colors'
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className='flex items-center justify-around border-t border-(--border) pt-4 px-2'>
        <SocialLink href='#' icon={<DocsIcon />} />
        <SocialLink href='#' icon={<XIcon />} />
        <SocialLink href='#' icon={<DiscordIcon />} />
        <SocialLink href='#' icon={<GithubIcon />} />
      </div>
    </aside>
  )
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className='text-(--muted) hover:text-(--text) transition-colors'>
      {icon}
    </Link>
  )
}

function DocsIcon() {
  return (
    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M14 2V8H20'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M16 13H8'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M16 17H8'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M10 9H8'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M18.9015 3.00006H22.0815L15.1325 10.9411L23.3045 21.7501H16.9035L11.8905 15.1951L6.15148 21.7501H2.96948L10.4285 13.2241L2.59348 3.00006H9.17248L13.6705 8.94906L18.9015 3.00006ZM17.7855 19.8471H19.5475L8.16748 4.79306H6.27548L17.7855 19.8471Z'
        fill='currentColor'
      />
    </svg>
  )
}

function DiscordIcon() {
  return (
    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M18.875 5.25C17.4375 4.625 15.875 4.1875 14.1875 4C14.0312 4.25 13.8438 4.65625 13.7188 5C12 4.75 10.3125 4.75 8.625 5C8.46875 4.65625 8.3125 4.25 8.125 4C6.4375 4.1875 4.875 4.625 3.4375 5.25C0.53125 9.53125 1.34375 13.7188 1.84375 17.8438C3.78125 19.25 5.625 20.125 7.4375 20.125C7.90625 19.5 8.3125 18.8438 8.6875 18.125C8.03125 17.875 7.40625 17.5625 6.84375 17.2188C7 17.0938 7.15625 16.9688 7.28125 16.8438C10.9688 18.5312 14.4375 18.5312 18 16.8438C18.1562 16.9688 18.2812 17.0938 18.4375 17.2188C17.875 17.5625 17.25 17.875 16.5938 18.125C16.9688 18.8438 17.4062 19.5 17.8438 20.125C19.6875 20.125 21.5 19.25 23.4375 17.8438C24.0312 13.4062 23.0312 9.25 20.25 5.25L18.875 5.25ZM8.53125 14.6562C7.46875 14.6562 6.59375 13.6875 6.59375 12.5C6.59375 11.3125 7.4375 10.3438 8.53125 10.3438C9.625 10.3438 10.5 11.3125 10.5 12.5C10.5 13.6875 9.65625 14.6562 8.53125 14.6562ZM15.8125 14.6562C14.75 14.6562 13.875 13.6875 13.875 12.5C13.875 11.3125 14.7188 10.3438 15.8125 10.3438C16.9062 10.3438 17.7812 11.3125 17.7812 12.5C17.7812 13.6875 16.9375 14.6562 15.8125 14.6562Z'
        fill='currentColor'
      />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M15 22V18C15.1392 16.7466 14.726 15.5165 13.84 14.58C16.64 14.26 19.58 13.18 19.58 8.36C19.5843 7.12643 19.1026 5.94056 18.24 5.06C18.6186 3.99615 18.5772 2.83354 18.13 1.8C18.13 1.8 17.05 1.46 14.6 3.12C12.4925 2.54044 10.2675 2.54044 8.16 3.12C5.71 1.46 4.63 1.8 4.63 1.8C4.18279 2.83354 4.14138 3.99615 4.52 5.06C3.65342 5.9429 3.17173 7.13193 3.18 8.37C3.18 13.17 6.11 14.26 8.91 14.59C8.04938 15.5147 7.625 16.7265 7.75 17.97L7.75 22M7.75 19C3.15 20.37 3.15 17.47 2.15 17.2'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
