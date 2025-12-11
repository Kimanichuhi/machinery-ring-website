import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Leaf, Users, Award, Target, Heart, Globe } from 'lucide-react';

const stats = [
  { name: 'Farmers Served', value: '6,000+', icon: Users },
  { name: 'Years of Experience', value: '4+', icon: Award },
  { name: 'Sub-Counties Covered', value: '2', icon: Globe },
  { name: 'Success Rate', value: '80%', icon: Target },
];

const team = [
  {
    name: 'Jeremiah Mwangi',
    role: 'MR Manager',
    bio: 'PhD in Agricultural Sciences with 15+ years of experience in crop production and sustainable farming.',
    image: '/placeholder.svg'
  },
  {
    name: 'Reuben Murituh',
    role: 'Assistant MR Manager',
    bio: 'Former cooperative leader with extensive knowledge of East African farming practices and market dynamics.',
    image: '/placeholder.svg'
  },
  {
    name: 'Pauline Kariuki',
    role: 'Accounting and Monitoring and Evaluation Officer',
    bio: 'Expert in agricultural technology and digital solutions for modern farming challenges.',
    image: '/placeholder.svg'
  }
];

const values = [
  {
    icon: Leaf,
    title: 'Farmer Organization',
    description: 'We promote environmentally responsible farming practices that preserve our land for future generations.'
  },
  {
    icon: Users,
    title: 'Mechanisation',
    description: 'Building strong relationships with farmers and creating networks that support mutual growth and learning.'
  },
  {
    icon: Users,
    title: 'Capacity Building',
    description: 'Delivering high-quality products and services that exceed expectations and drive agricultural success.'
  },
  {
    icon: Heart,
    title: 'Farmer-to-Farmer Agency',
    description: 'Operating with honesty, transparency, and fairness in all our dealings with farmers and partners.'
  }
];

const About = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Text Section */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
                About Machinery Ring
              </h1>
              <p className="text-lg leading-8 text-muted-foreground text-justify">
                <span className="float-right ml-6 mb-4 w-full sm:w-1/2 md:w-2/5 lg:w-1/3">
                  <img
                    src="/mrlogo.png"
                    alt="Machinery Ring farmers"
                    className="rounded-xl shadow-md object-cover w-full h-auto"
                  />
                </span>
                Machinery Ring Ltd is a farmer-based agricultural organization dedicated to empowering smallholder farmers through shared resources, modern technologies, and innovative farming solutions. Founded on the principle of collective strength, the firm enables farmers to pool their challenges and efforts together, creating a strong network that supports mechanization, training, and agribusiness growth. Its core focus areas include Farmers Organization, Mechanisation, Capacity Building, and Farmer-to-Farmer Services, all designed to enhance productivity, sustainability, and profitability across the agricultural value chain.
                <br /><br />
                The organization also engages in complementary services such as Agro-Dealership, Agronomy Services, Soil Sampling and Testing, Aggregation and Marketing, and Feed Formulation. These services ensure farmers have access to quality farm inputs, technical guidance, and reliable markets for their produce. With branches spread across ten regions including Kaimbaga, Rurii, Matura, Weru, Tumaini, Kihoto, Mawingu, Kanjuiri, Ngorika, and Mirangine, Machinery Ring brings agricultural transformation closer to rural communities through hands-on support and professional expertise.
                <br /><br />
                Guided by the slogan “Service to Farmers,” Machinery Ring Ltd continues to be a trusted partner in advancing modern agriculture. Through collaboration with farmers, training of trainers (TOTs), and innovative agricultural programs, the firm is bridging the gap between traditional and modern farming. Its commitment to capacity building, mechanization, and market access has made it a driving force in improving livelihoods and promoting sustainable farming practices across Nyandarua County and beyond.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-muted/50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.name} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-hero">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight text-primary">{stat.value}</p>
                <p className="text-sm leading-6 text-muted-foreground">{stat.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Our Mission
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                To transform East African agriculture by connecting farmers with quality inputs, 
                expert knowledge, and innovative solutions that increase productivity, improve livelihoods, 
                and promote sustainable farming practices.
              </p>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                We believe that every farmer deserves access to the tools and knowledge needed to succeed, 
                regardless of their location or farm size.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Our Vision
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                To be the leading agricultural platform in East Africa, fostering a thriving ecosystem 
                where farmers achieve food security, economic prosperity, and environmental sustainability 
                through innovative agricultural practices.
              </p>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                We envision a future where technology and traditional wisdom work hand in hand to 
                create resilient and productive farming communities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-muted/50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Core Values
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              The principles that guide everything we do at Machinery Ring.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            {values.map((value) => (
              <Card key={value.title} className="product-card">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-hero">
                      <value.icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold">
                      {value.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Meet Our Team
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Agricultural experts and technology professionals dedicated to supporting farmers
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            {team.map((member) => (
              <Card key={member.name} className="product-card">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div>
                      <CardTitle className="text-lg font-bold">
                        {member.name}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Join Our Community?
            </h2>
            <p className="mt-6 text-lg leading-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Become part of a thriving network of farmers who are transforming agriculture 
              across Kenya with sustainable and profitable farming practices.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary">
                Get Started Today
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
