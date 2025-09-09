
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { ArrowRight, BarChart3, School, Soup, Users } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: <Users />,
    title: 'Comprehensive Learner Profiles',
    description: 'Maintain detailed records for every learner, from enrollment to progression.',
  },
  {
    icon: <Soup />,
    title: 'Real-time Meal Tracking',
    description: 'Easily record daily meals to ensure every child is fed and accounted for.',
  },
  {
    icon: <School />,
    title: 'School & Stock Management',
    description: 'Keep track of all schools, volunteers, and inventory from one central hub.',
  },
  {
    icon: <BarChart3 />,
    title: 'Automated Reporting',
    description: 'Generate insightful reports on attendance, meals, and stock with a single click.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Logo className="h-8 w-8" />
            <span className="font-headline text-lg">Blue Sky Feeding</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#how-it-works" className="text-muted-foreground transition-colors hover:text-foreground">
              How It Works
            </Link>
            <Link href="#contact" className="text-muted-foreground transition-colors hover:text-foreground">
              Contact
            </Link>
          </nav>
          <Button asChild>
            <Link href="/login">
              Sign In <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
            <div
                aria-hidden="true"
                className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
            >
                <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400 dark:from-blue-700"></div>
                <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300 dark:to-indigo-600"></div>
            </div>
          <div className="container mx-auto px-4 text-center md:px-6">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Optimizing School Feeding for a Brighter Future
            </h1>
            <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
              Blue Sky is a comprehensive management system designed to streamline and enhance the efficiency of school feeding programs across districts.
            </p>
            <div className="mt-6">
              <Button size="lg" asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">Key Features</h2>
                <p className="mt-4 text-muted-foreground">
                    Everything you need to manage a successful school feeding program.
                </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader className="flex flex-col items-center text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                        {feature.icon}
                    </div>
                    <CardTitle className="font-headline text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-sm text-muted-foreground">
                    {feature.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

         {/* How It Works Section */}
        <section id="how-it-works" className="py-12 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                 <div className="mx-auto mb-12 max-w-2xl text-center">
                    <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">How It Works</h2>
                    <p className="mt-4 text-muted-foreground">A simple, streamlined process for total oversight.</p>
                </div>
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
                            <div>
                                <h3 className="font-headline text-lg font-semibold">Register Schools & Enroll Learners</h3>
                                <p className="text-muted-foreground">Easily add new schools and enroll learners with detailed profiles, ensuring accurate records from day one.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
                            <div>
                                <h3 className="font-headline text-lg font-semibold">Track Daily Operations</h3>
                                <p className="text-muted-foreground">Record daily attendance and meal servings with intuitive interfaces designed for teachers, cooks, and volunteers.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
                            <div>
                                <h3 className="font-headline text-lg font-semibold">Generate Insightful Reports</h3>
                                <p className="text-muted-foreground">Access real-time data and generate comprehensive reports to monitor program effectiveness and make data-driven decisions.</p>
                            </div>
                        </div>
                    </div>
                     <div className="overflow-hidden rounded-lg">
                        <Image
                            src="https://picsum.photos/600/400"
                            data-ai-hint="children eating school"
                            alt="Children being served meals at school"
                            width={600}
                            height={400}
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>

      </main>

      <footer id="contact" className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-6">
            <div className="flex items-center gap-2">
                <Logo className="h-6 w-6" />
                <span className="font-semibold">Blue Sky Feeding</span>
            </div>
            <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Blue Sky. All rights reserved.
            </p>
        </div>
      </footer>
    </div>
  );
}
