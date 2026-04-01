"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight, Menu, X, Target } from 'lucide-react'
import { Button } from '@/components/ui/shadcn-button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { ContainerScroll } from '@/components/ui/container-scroll'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection() {
    return (
        <div className="bg-[#030303] text-white min-h-screen">
            <HeroHeader />
            <main className="relative">
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring' as const,
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="absolute inset-0 -z-20">
                            <Image
                                src="/img/img.png"
                                alt="background"
                                className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 dark:block opacity-20"
                                width={3276}
                                height={4095}
                                priority
                            />
                        </AnimatedGroup>
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        href="/register"
                                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground text-sm">Start managing your wealth today</span>
                                        <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    <h1
                                        className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem] font-bold tracking-tight">
                                        Master Your Money with Expense Tracker
                                    </h1>
                                    <p
                                        className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground">
                                        Beautifully simple expense tracking, automated budgets, and goal-oriented savings. All in one premium dashboard.
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-4 md:flex-row">
                                    <div
                                        key={1}
                                        className="bg-foreground/10 rounded-[14px] border p-0.5">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-xl px-8 text-base bg-emerald-600 hover:bg-emerald-500 text-white border-none transition-all duration-300 shadow-lg shadow-emerald-500/20">
                                            <Link href="/register">
                                                <span className="text-nowrap font-semibold">Get Started Free</span>
                                            </Link>
                                        </Button>
                                    </div>
                                    <Button
                                        key={2}
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="h-12 rounded-xl px-8 text-base hover:bg-white/5 transition-all">
                                        <Link href="/login">
                                            <span className="text-nowrap">Sign In</span>
                                        </Link>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <div className="flex flex-col overflow-hidden">
                            <ContainerScroll
                                titleComponent={
                                    <div className="flex items-center flex-col">
                                        <h1 className="text-4xl font-black text-white md:text-[6rem] leading-none uppercase italic tracking-tighter">
                                            The Future of <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">Wealth Management</span>
                                        </h1>
                                    </div>
                                }
                            >
                                <Image
                                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070&auto=format&fit=crop"
                                    alt="hero"
                                    height={720}
                                    width={1400}
                                    className="mx-auto rounded-2xl object-cover h-full object-left-top scale-110"
                                    draggable={false}
                                />
                            </ContainerScroll>
                        </div>
                    </div>
                </section>

                <section className="bg-[#030303] pb-16 pt-16 md:pb-32">
                    <div className="group relative m-auto max-w-5xl px-6 border-b border-white/5 pb-24">
                        <div className="text-center mb-12">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-indigo-400">Trusted by modern savers</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                            <div className="flex items-center justify-center font-bold text-xl text-slate-400">FINANCE.IO</div>
                            <div className="flex items-center justify-center font-bold text-xl text-slate-400">WEALTHY</div>
                            <div className="flex items-center justify-center font-bold text-xl text-slate-400">SAVVY</div>
                            <div className="flex items-center justify-center font-bold text-xl text-slate-400">GROWTH</div>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    )
}

const menuItems = [
    { name: 'How it Works', href: '#process' },
    { name: 'Milestones', href: '#achievements' },
    { name: 'Budgets', href: '#budgets' },
    { name: 'Savings', href: '#savings' },
]

const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-50 w-full px-4 group top-4">
                <div className={cn(
                    'mx-auto max-w-6xl px-6 transition-all duration-500 rounded-2xl border border-transparent',
                    isScrolled ? 'bg-background/80 max-w-4xl border-white/10 backdrop-blur-xl py-2 px-4 shadow-lg' : 'py-4'
                )}>
                    <div className="relative flex items-center justify-between gap-6">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link href="/" className="flex items-center space-x-3 group/logo">
                                <div className="size-8 bg-white rounded-lg flex items-center justify-center shadow-lg group-hover/logo:scale-110 transition-transform">
                                    <Target className="size-5 text-black" />
                                </div>
                                <div className="flex flex-col -space-y-1">
                                    <span className="font-black text-xl tracking-tighter hidden sm:block text-white uppercase italic">ExpenseTracker</span>
                                    <div className="flex items-center gap-2">
                                        <div className="size-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600 italic">v1.4.0 / Systems Active</span>
                                    </div>
                                </div>
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                className="relative z-20 block cursor-pointer p-2 lg:hidden text-foreground">
                                {menuState ? <X className="size-6" /> : <Menu className="size-6" />}
                            </button>
                        </div>

                        <div className="hidden lg:block">
                            <ul className="flex gap-10 text-sm font-medium">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-zinc-400 hover:text-indigo-400 transition-colors">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={cn(
                            "flex items-center gap-4 transition-all duration-300",
                            menuState ? "fixed inset-0 top-[72px] bg-zinc-950 flex-col p-8 lg:static lg:bg-transparent lg:flex-row lg:p-0" : "hidden lg:flex"
                        )}>
                            <div className="lg:hidden w-full space-y-4 mb-8">
                                {menuItems.map((item, index) => (
                                    <Link key={index} href={item.href} className="block text-2xl font-semibold" onClick={() => setMenuState(false)}>
                                        {item.name}
                                    </Link>
                                ))}
                            </div>

                            <Button asChild variant="ghost" className="text-slate-400 hover:text-white transition-colors">
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 shadow-md shadow-indigo-500/10 transition-all duration-300">
                                <Link href="/register">Join Now</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
