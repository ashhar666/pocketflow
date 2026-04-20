import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const Wave = () => (
  <svg
    width="129"
    height="1387"
    viewBox="0 0 129 1387"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.2131 11L106.283 106.07M106.283 106.07L117.279 117.066M106.283 106.07L22.2962 190.003M106.283 106.07L116.688 95.6708M11.2962 200.997L22.2962 190.003M22.2962 190.003L11.2529 178.96M22.2962 190.003L106.323 274.03M106.323 274.03L117.319 285.026M106.323 274.03L22.4537 357.846M106.323 274.03L116.728 263.631M11.3361 368.957L22.4537 357.846M22.4537 357.846L11.5493 346.901M22.4537 357.846L106.44 442.149M106.44 442.149L117.416 453.166M106.44 442.149L22.2962 525.925M106.44 442.149L116.865 431.769M11.2756 536.897L22.2962 525.925M22.2962 525.925L11.2737 514.861M22.2962 525.925L106.165 610.109M106.165 610.109L117.14 621.126M106.165 610.109L11 704.857M106.165 610.109L116.59 599.729M11.2131 683L106.283 778.07M106.283 778.07L117.279 789.066M106.283 778.07L22.2962 862.003M106.283 778.07L116.688 767.671M11.2962 872.997L22.2962 862.003M22.2962 862.003L11.2529 850.96M22.2962 862.003L106.323 946.03M106.323 946.03L117.319 957.026M106.323 946.03L22.4537 1029.85M106.323 946.03L116.728 935.631M11.3361 1040.96L22.4537 1029.85M22.4537 1029.85L11.5493 1018.9M22.4537 1029.85L106.44 1114.15M106.44 1114.15L117.416 1125.17M106.44 1114.15L22.2962 1197.92M106.44 1114.15L116.865 1103.77M11.2756 1208.9L22.2962 1197.92M22.2962 1197.92L11.2737 1186.86M22.2962 1197.92L106.165 1282.11M106.165 1282.11L117.14 1293.13M106.165 1282.11L11 1376.86M106.165 1282.11L116.59 1271.73"
      stroke="currentColor"
      strokeOpacity="0.2"
      strokeWidth="31"
    />
  </svg>
)

const Cross = () => (
  <svg
    width="130"
    height="130"
    viewBox="0 0 130 130"
    fill="none"
    className={'scale-125'}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11 11L118.899 119M11.101 119L119 11" stroke="currentColor" strokeOpacity="0.2" strokeWidth="31" />
  </svg>
)

export const AnimatedCard: React.FC<{
  children: React.ReactNode
  type?: 'waves' | 'crosses'
  href?: string
  onClick?: () => void
  buttonText?: string
  className?: string
}> = ({ 
  children, 
  href, 
  onClick,
  buttonText,
  className, 
  type = 'waves' 
}) => {
  const ButtonContent = (
    <button 
      onClick={onClick}
      className={'h-14 w-full bg-white !text-zinc-950 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group-hover:shadow-lg group-hover:shadow-black/5 flex items-center justify-center'}
    >
      {buttonText}
    </button>
  )

  return (
    <article
      className={cn(
        'min-h-[300px] h-full max-h-[500px] max-w-sm w-full bg-primary relative overflow-hidden rounded-3xl text-white group transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 p-8 flex flex-col items-start justify-between sm:gap-10 gap-7',
        className
      )}
    >
      <div className="relative z-10 w-full flex flex-col gap-6">
        {children}
      </div>
      
      {buttonText && (
        <div className={'relative z-10 w-full mt-auto'}>
          {href ? (
            <Link href={href} className={'w-full'}>
              {ButtonContent}
            </Link>
          ) : ButtonContent}
        </div>
      )}

      {type === 'waves' && (
        <>
          <div className={'w-fit h-fit absolute -top-[106px] sm:left-4 -left-0 animate-waves z-0 opacity-50 group-hover:opacity-100 transition-opacity duration-700'}>
            <Wave />
          </div>
          <div className={'w-fit h-fit absolute -top-[106px] sm:right-4 -right-0 animate-waves z-0 opacity-50 group-hover:opacity-100 transition-opacity duration-700'}>
            <Wave />
          </div>
        </>
      )}
      {type === 'crosses' && (
        <>
          <div
            className={'w-fit h-fit absolute top-0 -left-10 z-0 animate-[spin_10s_linear_infinite] opacity-50 group-hover:opacity-100 transition-opacity duration-700'}
          >
            <Cross />
          </div>
          <div
            className={'w-fit h-fit absolute top-1/2 -right-12 z-0 animate-[spin_15s_linear_infinite] opacity-50 group-hover:opacity-100 transition-opacity duration-700'}
          >
            <Cross />
          </div>
          <div
            className={'w-fit h-fit absolute top-[85%] -left-5 z-0 animate-[spin_20s_linear_infinite] opacity-50 group-hover:opacity-100 transition-opacity duration-700'}
          >
            <Cross />
          </div>
        </>
      )}
    </article>
  )
}

export const Heading: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <h3 className={cn('text-3xl font-black tracking-tighter leading-none uppercase italic', className)}>
    {children}
  </h3>
)

export const Metric: React.FC<{ 
  value: string; 
  label?: string; 
  className?: string 
}> = ({
  value,
  label,
  className
}) => (
  <div
    className={cn('flex flex-col items-start gap-0', className)}
  >
    <div className="text-6xl font-black tracking-tighter italic leading-[0.8]">
      {value}
    </div>
    {label && (
      <div className="text-xl font-bold tracking-tight opacity-60 mt-1 uppercase">
        / {label}
      </div>
    )}
  </div>
)

export const Paragraph: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <p className={cn('text-lg font-medium opacity-80 leading-snug', className)}>
    {children}
  </p>
)
