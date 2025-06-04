"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  feedback: string;
  avatar: string;
  dataAiHint: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  interval?: number;
}

export default function TestimonialCarousel({ testimonials, interval = 7000 }: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (!testimonials || testimonials.length <= 1) return;

    const timer = setInterval(() => {
      setIsAnimatingOut(true); // Start fade-out
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        setIsAnimatingOut(false); // New item will be visible and start fade-in
      }, 500); // This duration should match the fade-out part of the animation
    }, interval);

    return () => clearInterval(timer);
  }, [testimonials, interval]);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="relative w-full max-w-3xl mx-auto overflow-hidden h-80 md:h-72"> {/* Fixed height for consistent layout */}
      <div
        className={`
          absolute inset-0 
          transition-opacity duration-500 ease-in-out
          ${isAnimatingOut ? 'opacity-0' : 'opacity-100'}
        `}
      >
        <Card
          className="w-full h-full flex flex-col justify-center items-center text-center shadow-xl rounded-lg p-6 md:p-8 bg-card"
        >
          <CardContent className="p-0">
            <Avatar className="w-20 h-20 mx-auto mb-4 border-2 border-primary shadow-md">
              <AvatarImage 
                src={currentTestimonial.avatar} 
                alt={currentTestimonial.name} 
                data-ai-hint={currentTestimonial.dataAiHint} 
              />
              <AvatarFallback>{currentTestimonial.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <p className="text-md md:text-lg font-medium text-foreground/90 italic mb-4 px-4 line-clamp-4 md:line-clamp-3">
              "{currentTestimonial.feedback}"
            </p>
            <h4 className="text-md font-semibold text-primary">{currentTestimonial.name}</h4>
            <p className="text-sm text-muted-foreground">{currentTestimonial.role}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
