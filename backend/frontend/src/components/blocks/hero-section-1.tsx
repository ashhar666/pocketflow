"use client"

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/shadcn-button'
import { cn } from '@/lib/utils'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(8px)',
            y: 10,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.2,
                duration: 0.6,
            },
        },
    },
}

interface LightningProps {
    hue?: number;
    xOffset?: number;
    speed?: number;
    intensity?: number;
    size?: number;
    temperature?: number;
}

const Lightning: React.FC<LightningProps> = ({
    hue = 230,
    xOffset = 0,
    speed = 1,
    intensity = 1,
    size = 1,
    temperature = 0.5,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(0);
    const propsRef = useRef({ hue, xOffset, speed, intensity, size, temperature });

    // Keep props in sync for the animation loop
    useEffect(() => {
        propsRef.current = { hue, xOffset, speed, intensity, size, temperature };
    }, [hue, xOffset, speed, intensity, size, temperature]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl");
        if (!gl) {
            console.error("WebGL not supported");
            return;
        }

        const vertexShaderSource = `
            attribute vec2 aPosition;
            void main() {
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform vec2 iResolution;
            uniform float iTime;
            uniform float uHue;
            uniform float uXOffset;
            uniform float uSpeed;
            uniform float uIntensity;
            uniform float uSize;
            uniform float uTemperature;
            
            #define OCTAVE_COUNT 10

            vec3 hsv2rgb(vec3 c) {
                vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
                return c.z * mix(vec3(1.0), rgb, c.y);
            }

            float hash11(float p) {
                p = fract(p * .1031);
                p *= p + 33.33;
                p *= p + p;
                return fract(p);
            }

            float hash12(vec2 p) {
                vec3 p3 = fract(vec3(p.xyx) * .1031);
                p3 += dot(p3, p3.yzx + 33.33);
                return fract((p3.x + p3.y) * p3.z);
            }

            mat2 rotate2d(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat2(c, -s, s, c);
            }

            float noise(vec2 p) {
                vec2 ip = floor(p);
                vec2 fp = fract(p);
                float a = hash12(ip);
                float b = hash12(ip + vec2(1.0, 0.0));
                float c = hash12(ip + vec2(0.0, 1.0));
                float d = hash12(ip + vec2(1.0, 1.0));
                
                vec2 t = smoothstep(0.0, 1.0, fp);
                return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
            }

            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                for (int i = 0; i < OCTAVE_COUNT; ++i) {
                    value += amplitude * noise(p);
                    p *= rotate2d(0.45);
                    p *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
                vec2 uv = fragCoord / iResolution.xy;
                uv = 2.0 * uv - 1.0;
                uv.x *= iResolution.x / iResolution.y;
                uv.x += uXOffset;
                float localSpeed = uSpeed * (0.5 + uTemperature * 1.5);
                float localSize = uSize * (1.0 + uTemperature * 0.5);
                uv += 2.0 * fbm(uv * localSize + 0.8 * iTime * localSpeed) - 1.0;
                float dist = abs(uv.x);
                vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7 - uTemperature * 0.3, 0.8 + uTemperature * 0.2));
                vec3 col = baseColor * pow(mix(0.0, 0.07 + uTemperature * 0.05, hash11(iTime * localSpeed)) / dist, 1.0) * uIntensity;
                col = pow(col, vec3(1.0));
                fragColor = vec4(col, 1.0);
            }

            void main() {
                mainImage(gl_FragColor, gl_FragCoord.xy);
            }
        `;

        const compileShader = (source: string, type: number): WebGLShader | null => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("Shader compile error:", gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
        if (!vertexShader || !fragmentShader) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Program linking error:", gl.getProgramInfoLog(program));
            return;
        }

        const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const aPosition = gl.getAttribLocation(program, "aPosition");
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
        const iTimeLocation = gl.getUniformLocation(program, "iTime");
        const uHueLocation = gl.getUniformLocation(program, "uHue");
        const uXOffsetLocation = gl.getUniformLocation(program, "uXOffset");
        const uSpeedLocation = gl.getUniformLocation(program, "uSpeed");
        const uIntensityLocation = gl.getUniformLocation(program, "uIntensity");
        const uSizeLocation = gl.getUniformLocation(program, "uSize");
        const uTemperatureLocation = gl.getUniformLocation(program, "uTemperature");

        const resizeCanvas = () => {
            if (!canvas) return;
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        let active = true;
        const startTime = performance.now();
        const render = () => {
            if (!active || !gl || !program) return;

            gl.useProgram(program);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);

            const currentTime = performance.now();
            const { hue, xOffset, speed, intensity, size, temperature } = propsRef.current;

            gl.uniform1f(iTimeLocation, (currentTime - startTime) / 1000.0);
            gl.uniform1f(uHueLocation, hue);
            gl.uniform1f(uXOffsetLocation, xOffset);
            gl.uniform1f(uSpeedLocation, speed);
            gl.uniform1f(uIntensityLocation, intensity);
            gl.uniform1f(uSizeLocation, size);
            gl.uniform1f(uTemperatureLocation, temperature);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestRef.current = requestAnimationFrame(render);
        };
        requestRef.current = requestAnimationFrame(render);

        return () => {
            active = false;
            window.removeEventListener("resize", resizeCanvas);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []); // Run only once

    return <canvas ref={canvasRef} className="w-full h-full relative" />;
};

export function HeroSection() {
    const shouldReduceMotion = useReducedMotion()
    const [temperature, setTemperature] = React.useState(0.5);
    const lightningHue = 230 - (temperature * 200); // 230 (Blue) -> 30 (Orange/Red)
    const activeColor = `hsl(${lightningHue}, 100%, 50%)`;
    const glowColor = `hsla(${lightningHue}, 100%, 50%, 0.8)`;

    return (
        <div className="bg-background text-foreground min-h-screen relative overflow-hidden transition-colors duration-400">
            {/* Aurora Background Blobs (Blurred) */}
            <div className="aurora-bg">
                <motion.div
                    animate={shouldReduceMotion ? {} : {
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="aurora-blob w-[600px] h-[600px] bg-emerald-500/20 left-[-10%] top-[-10%]"
                />
                <motion.div
                    animate={shouldReduceMotion ? {} : {
                        scale: [1.2, 1, 1.2],
                        x: [0, -40, 0],
                        y: [0, 60, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="aurora-blob w-[500px] h-[500px] bg-indigo-500/20 right-[-5%] top-[10%]"
                />
                <motion.div
                    animate={shouldReduceMotion ? {} : {
                        scale: [1, 1.3, 1],
                        x: [0, 30, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="aurora-blob w-[700px] h-[700px] bg-purple-500/10 left-[20%] bottom-[-20%]"
                />
            </div>

            {/* Lightning Layer (Unblurred) */}
            <div className="absolute inset-0 z-[1] opacity-70 pointer-events-none">
                <Lightning
                    hue={lightningHue}
                    xOffset={0}
                    speed={1.2}
                    intensity={0.4}
                    size={1.5}
                    temperature={temperature}
                />
            </div>

            {/* Dark Overlay for Text Legibility */}
            <div className="absolute inset-0 bg-black/40 mix-blend-multiply z-[2] pointer-events-none"></div>

            {/* Nixie Temperature HUD (Absolute to Hero) */}
            <div className="absolute bottom-10 right-10 z-50 flex items-end gap-6 select-none pointer-events-none hidden md:flex">
                <div className="flex flex-col items-end">
                    <div className="text-[10px] uppercase tracking-[0.2em] mb-1 font-mono transition-colors duration-300" style={{ color: activeColor, opacity: 0.5 }}>Module Temp</div>
                    <div className="flex items-baseline gap-1 font-mono">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={Math.floor(3000 + temperature * 9000)}
                                initial={{ opacity: 0.5, filter: 'blur(2px)' }}
                                animate={{
                                    opacity: 1,
                                    filter: 'blur(0px)',
                                    color: activeColor,
                                    textShadow: `0 0 15px ${glowColor}, 0 0 5px ${activeColor}`
                                }}
                                className="text-4xl font-bold"
                            >
                                {Math.floor(3000 + temperature * 9000).toLocaleString()}
                            </motion.span>
                        </AnimatePresence>
                        <span className="text-xl font-bold transition-colors duration-300" style={{ color: activeColor, opacity: 0.8 }}>K</span>
                    </div>
                </div>

                {/* Vertical Slider Control */}
                <div className="pointer-events-auto flex flex-col items-center h-48 group pb-2">
                    <div className="relative h-full w-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="absolute bottom-0 w-full transition-colors duration-300"
                            style={{
                                height: `${temperature * 100}%`,
                                backgroundColor: activeColor,
                                boxShadow: `0 0 10px ${glowColor}`
                            }}
                        />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            style={{ WebkitAppearance: 'none', appearance: 'none', padding: 0, writingMode: 'vertical-lr', direction: 'rtl' }}
                        />
                    </div>
                </div>
            </div>

            <HeroHeader />
            <main className="relative z-10">
                <section>
                    <div className="relative pt-32 md:pt-48 pb-20">
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto">
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.1,
                                            },
                                        },
                                    }}
                                    className="flex flex-col items-center"
                                >
                                    <motion.div variants={transitionVariants}>
                                        <Link
                                            href="/register"
                                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 px-3 text-sm font-medium text-zinc-300 hover:bg-white/10 transition-colors backdrop-blur-md"
                                        >
                                            <span className="text-[10px] font-black text-emerald-400 italic">[NEW]</span>
                                            <span>AI Intelligence Hub & Telegram Sync live</span>
                                            <span className="text-[10px] font-black text-zinc-500 italic">[&gt;]</span>
                                        </Link>
                                    </motion.div>

                                    <motion.h1
                                        variants={transitionVariants}
                                        className="mt-8 max-w-5xl mx-auto text-balance text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9]"
                                    >
                                        <span className="sr-only">PocketFlow — AI-Powered Personal Expense Tracker. </span>
                                        Track Fast. <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40">Spend Smart.</span>
                                    </motion.h1>

                                    <motion.p
                                        variants={transitionVariants}
                                        className="mx-auto mt-8 max-w-2xl text-balance text-lg md:text-xl text-zinc-400 font-medium leading-relaxed"
                                    >
                                        A high-fidelity command center for the modern era.
                                        Capture, analyze, and master your capital with proprietary AI and seamless Telegram sync.
                                    </motion.p>

                                    <motion.div
                                        variants={transitionVariants}
                                        className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row w-full"
                                    >
                                        <Button
                                            asChild
                                            size="lg"
                                            className="h-14 rounded-2xl px-10 text-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold border-none transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
                                        >
                                            <Link href="/register" aria-label="Sign up for PocketFlow — free expense tracking">
                                                <span>Deploy Capital</span>
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            size="lg"
                                            variant="ghost"
                                            className="h-14 rounded-2xl px-10 text-lg border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all font-semibold"
                                        >
                                            <Link href="/login" aria-label="Log in to your PocketFlow account">
                                                <span>Access System</span>
                                            </Link>
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            </div>
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
                    isScrolled ? 'bg-background/40 max-w-4xl border-border/10 backdrop-blur-xl py-2 px-4 shadow-lg' : 'py-4'
                )}>
                    <div className="relative flex items-center justify-between gap-6">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link href="/" className="flex items-center space-x-3 group/logo">
                                <div className="size-8 rounded-lg flex items-center justify-center shadow-lg group-hover/logo:scale-110 transition-transform overflow-hidden">
                                    <img src="/logo.png" alt="PocketFlow Logo" className="size-full object-cover" />
                                </div>
                                <div className="flex flex-col -space-y-1">
                                    <span className="font-black text-xl tracking-tighter hidden sm:block text-foreground uppercase italic font-display">PocketFlow</span>
                                    <div className="flex items-center gap-2">
                                        <div className="size-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600 italic">v1.4.0 / Systems Active</span>
                                    </div>
                                </div>
                            </Link>

                             <button
                                onClick={() => setMenuState(!menuState)}
                                className="relative z-20 block cursor-pointer p-2 lg:hidden text-[10px] font-black uppercase tracking-widest text-white italic border border-white/10 rounded-lg px-3">
                                {menuState ? 'CLOSE' : 'MENU'}
                            </button>
                        </div>

                        <div className="hidden lg:block">
                            <ul className="flex gap-10 text-sm font-medium">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-zinc-400 hover:text-emerald-400 transition-colors">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={cn(
                            "flex items-center gap-4 transition-all duration-300",
                            menuState ? "fixed inset-0 top-[72px] bg-background flex-col p-8 lg:static lg:bg-transparent lg:flex-row lg:p-0" : "hidden lg:flex"
                        )}>
                            <div className="lg:hidden w-full space-y-4 mb-8">
                                {menuItems.map((item, index) => (
                                    <Link key={index} href={item.href} className="block text-2xl font-semibold" onClick={() => setMenuState(false)}>
                                        {item.name}
                                    </Link>
                                ))}
                            </div>

                            <Button asChild variant="ghost" className="text-zinc-400 hover:text-white transition-colors">
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6 shadow-md shadow-emerald-500/10 transition-all duration-300">
                                <Link href="/register">Join Now</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
