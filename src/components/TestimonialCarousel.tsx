
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
          className="w-full h-full flex flex-col justify-between text-left shadow-xl rounded-lg p-6 md:p-8 bg-card"
        >
          <div> {/* Feedback text container */}
            <div className="relative">
              {/* Large decorative quote character */}
              <span 
                aria-hidden="true" 
                className="absolute -top-5 -left-4 font-serif text-7xl text-gray-200 dark:text-gray-600 opacity-70 select-none pointer-events-none"
              >
                “
              </span>
              <p className="text-base text-gray-700 dark:text-gray-300 pt-4 pl-3 sm:pl-4 leading-relaxed line-clamp-5"> 
                {currentTestimonial.feedback}
              </p>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6"> {/* User info, margin-top to give space */}
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage 
                  src={currentTestimonial.avatar} 
                  alt={currentTestimonial.name} 
                  data-ai-hint={currentTestimonial.dataAiHint} 
                />
                <AvatarFallback>{currentTestimonial.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-sm font-semibold text-foreground">{currentTestimonial.name}</h4>
                <p className="text-xs text-muted-foreground">{currentTestimonial.role}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
