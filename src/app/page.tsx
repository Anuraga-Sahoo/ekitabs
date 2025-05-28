
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Award, FileText, Users, ChevronRight, PlayCircle, BookOpen } from 'lucide-react';

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-muted-foreground">
    <path d="M6 4l12 8-12 8z"/>
  </svg>
);

const GooglePlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512" className="mr-2">
    <path fill="#4CAF50" d="M96 32C80 32 64 40 64 64v384c0 24 16 32 32 32h320c16 0 32-8 32-32V64c0-24-16-32-32-32H96z"/>
    <path fill="#FFC107" d="M64 64v192l160-96L64 64z"/>
    <path fill="#2196F3" d="M64 448V256l160 96L64 448z"/>
    <path fill="#F44336" d="M224 160l128 128-128 128V160z"/>
    <path fill="#FFFFFF" d="M352 288L224 160l128 128-128 128z" opacity="0.2"/>
  </svg>
);

const AppStoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 384 512" className="mr-2">
    <path fill="currentColor" d="M318.7 268.7c-.2-36.7 9.4-69.3 30.2-91.1L352 160l-20.7-34.4c-11.7-19.4-28.5-34.8-48.8-46.1l-36.4-20.2L224 80l-18.3-20.7C188.5 43.1 163.3 32 134.8 32c-34.8 0-68.3 16.2-90.5 43.8L32 88.8l12.8 20.9c21.2 34.7 28.9 76.3 20.8 117.5L64 256l.1 1.7c10.5 60.1 55.2 107.3 114.8 119.2L192 384l1.9-.1c32.9-3.4 63.6-16.3 88.3-36.7l21.1-17.3L320 304l-2.1-35.3zM192 320c-44.2 0-80-35.8-80-80s35.8-80 80-80 80 35.8 80 80-35.8 80-80 80z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.825-1.587-5.946.002-6.554 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.554-5.338 11.891-11.893 11.891-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.47.074-.72.372-.25.297-1.005 1.006-1.005 2.456 0 1.429 1.03 2.849 1.181 3.046.152.198 1.984 3.169 4.933 4.353.713.286 1.363.447 1.819.576.849.237 1.622.201 2.207.124.617-.076 1.757-.723 2.006-1.426.25-.703.25-1.296.176-1.426z"/>
  </svg>
);

const stats = [
  { icon: ShieldCheck, label: 'Registered Students', value: '7.1+ Crore', prominent: true, iconColor: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  { icon: Award, label: 'Student Selections', value: '4+ Lacs' },
  { icon: FileText, label: 'Tests Attempted', value: '242+ Crore' },
  { icon: Users, label: 'Classes Attended', value: '5.5+ Crore' },
];

const popularExamCategories = [
  "SSC Exams", "Banking Exams", "Teaching Exams", "Civil Services Exam", "Railways Exams", "Engineering Recruitment Exams"
];

const popularExams = [
  { icon: BookOpen, name: 'SSC CGL', href: '#' },
  { icon: BookOpen, name: 'SSC CHSL', href: '#' },
  { icon: ShieldCheck, name: 'Delhi Police Constable', href: '#' },
  // Add more exams as needed
];

export default function Home() {
  return (
    <div className="flex flex-col items-center space-y-10 md:space-y-12 pb-16 bg-background">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-16 text-center">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            One Destination for <span className="text-[hsl(var(--brand-green))]">Complete Exam</span> Preparation
          </h1>
          <div className="mt-6 flex justify-center items-center space-x-2 sm:space-x-4 text-sm sm:text-base text-muted-foreground">
            <span>Learn</span> <PlayIcon />
            <span>Practice</span> <PlayIcon />
            <span>Improve</span> <PlayIcon />
            <span>Succeed</span>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              size="lg"
              className="bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green))]/90 text-white font-semibold px-8 py-3 w-full sm:w-auto"
              asChild
            >
              <Link href="/mock-test">Get Started For Free</Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button variant="outline" className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto px-6 py-2.5">
              <GooglePlayIcon />
              <div>
                <div className="text-xs">GET IT ON</div>
                <div className="text-sm font-semibold">Google Play</div>
              </div>
            </Button>
            <Button variant="outline" className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto px-6 py-2.5">
              <AppStoreIcon />
               <div>
                <div className="text-xs">Download on the</div>
                <div className="text-sm font-semibold">App Store</div>
              </div>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full container px-4 md:px-6">
        <Card className="bg-[hsl(var(--brand-green-light))] p-6 shadow-lg rounded-xl">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((stat) => (
                <div key={stat.label} className={`flex flex-col items-center p-4 rounded-lg ${stat.prominent ? 'sm:col-span-1' : 'sm:col-span-1'}`}>
                  <div className={`p-3 rounded-full mb-3 ${stat.prominent ? stat.bgColor : 'bg-background/70 dark:bg-muted/70'}`}>
                    <stat.icon className={`h-8 w-8 ${stat.prominent ? stat.iconColor : 'text-primary'}`} />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Popular Exams Section */}
      <section className="w-full container px-4 md:px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Popular Exams</h2>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          Get exam-ready with concepts, questions and study notes as per the latest pattern
        </p>
        <div className="flex flex-wrap gap-2 mb-8">
          {popularExamCategories.map((category, index) => (
            <Button
              key={category}
              variant={index === 0 ? "default" : "outline"}
              className={`${index === 0 ? 'bg-[hsl(var(--brand-blue))] text-white hover:bg-[hsl(var(--brand-blue))]/90' : 'bg-background hover:bg-muted text-foreground'} rounded-full px-4 py-1.5 text-xs sm:text-sm`}
            >
              {category}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularExams.map((exam) => (
            <Card key={exam.name} className="hover:shadow-xl transition-shadow bg-card">
              <Link href={exam.href} className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-muted rounded-full">
                    <exam.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium text-foreground text-sm sm:text-base">{exam.name}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* WhatsApp FAB */}
      <Link
        href="https://wa.me/yourphonenumber" // Replace with your WhatsApp link
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[hsl(var(--brand-green))] text-white p-3.5 rounded-full shadow-lg hover:bg-[hsl(var(--brand-green))]/90 transition-colors z-50"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon />
      </Link>
    </div>
  );
}
