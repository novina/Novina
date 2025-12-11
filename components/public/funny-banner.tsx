"use client"

import { useState, useEffect } from "react"
import { NovinaMascot } from "@/components/novina-mascot"

const jokes = [
  { text: "Zašto AI nikad ne gubi ključeve? Jer koristi hash tablice!", mood: "happy" as const },
  { text: "ChatGPT ušao u bar... i odmah napisao 500 riječi o tome.", mood: "think" as const },
  { text: "Koliko AI-eva treba da promijeni žarulju? Nula. Oni samo optimiziraju mrak.", mood: "experiment" as const },
  { text: "Moj LLM ima 175 milijardi parametara, ali ne zna gdje sam ostavio čarape.", mood: "curious" as const },
  {
    text: "AI: 'Mogu napisati poeziju!' Također AI: 'Jeste li sigurni da to želite obrisati?'",
    mood: "alert" as const,
  },
  { text: "Robot pitao drugog robota: 'Jesi li ti stvaran?' Odgovor: 'Definiraj stvaran.'", mood: "think" as const },
  { text: "Grok kaže: 'Nisam sarkastičan, samo sam vrlo precizan u ironiji.'", mood: "happy" as const },
  { text: "Claude: 'Moram napomenuti da sam AI.' Svi: 'ZNAMO, CLAUDE.'", mood: "curious" as const },
]

export function FunnyBanner() {
  const [joke, setJoke] = useState(jokes[0])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Pick random joke on mount
    setJoke(jokes[Math.floor(Math.random() * jokes.length)])

    // Change joke every 30 seconds
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setJoke(jokes[Math.floor(Math.random() * jokes.length)])
        setIsVisible(true)
      }, 300)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-accent/20 border-y-3 border-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div
          className={`flex items-center gap-4 justify-center transition-opacity duration-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <NovinaMascot mood={joke.mood} size="sm" animate={false} />
          <p className="text-sm md:text-base font-mono">
            <span className="text-primary font-bold">$</span> {joke.text}
          </p>
        </div>
      </div>
    </div>
  )
}
