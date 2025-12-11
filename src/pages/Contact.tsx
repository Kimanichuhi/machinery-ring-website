import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Phone, Mail, Clock, MessageSquare } from 'lucide-react';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Main Office',
    details: [
      'Machinery Ring - Nyandarua',
      'Njabini - Olkalou Highway',
      'Nyandarua, Kenya'
    ]
  },
  {
    icon: Phone,
    title: 'Phone Numbers',
    details: [
      'WhatsApp: +254 741595086'
    ]
  },
  {
    icon: Mail,
    title: 'Email Addresses',
    details: [
      'Nyandarua-mr@machineryring@org',
    ]
  },
  {
    icon: Clock,
    title: 'Business Hours',
    details: [
      'Monday - Friday: 8:00 AM - 5:00 PM',
      'Saturday: Closed',
      'Sunday: Closed'
    ]
  }
];

const offices = [
  {
    city: 'Olkalou',
    address: 'Njabini-Olkalou Highway, Nyandarua',
    Location: 'Njabini-Olkalou Highway, 1km away from Olkalou Town.',
    phone: '+254 741595086',
    manager: 'Jeremiah Mwangi'
  },
];

const Contact = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Contact Us
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Get in touch with our agricultural experts. We're here to help you succeed 
              with personalized support and guidance.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Contact Form */}
          <div>
            <Card className="product-card">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-2xl font-bold">
                    Send us a Message
                  </CardTitle>
                </div>
                <p className="text-muted-foreground">
                  Fill in the form below and we'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      First Name *
                    </label>
                    <Input placeholder="Enter your first name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Last Name *
                    </label>
                    <Input placeholder="Enter your last name" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email Address *
                  </label>
                  <Input type="email" placeholder="Enter your email address" />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Phone Number *
                  </label>
                  <Input placeholder="Enter your phone number" />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Machinery Ring
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your Local MR" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kaimbaga">Kaimbaga</SelectItem>
                      <SelectItem value="Rurii">Rurii</SelectItem>
                      <SelectItem value="Matura">Matura</SelectItem>
                      <SelectItem value="Weru">Weru</SelectItem>
                      <SelectItem value="Tumaini">Tumaini</SelectItem>
                      <SelectItem value="Kihoto">Kihoto</SelectItem>
                      <SelectItem value="Mawingu">Mawingu</SelectItem>
                      <SelectItem value="Kanjuiri">kanjuiri</SelectItem>
                      <SelectItem value="Ngorika">Ngorika</SelectItem>
                      <SelectItem value="Mirangine">Mirangine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Subject *
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="What can we help you with?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="services">Book a Service</SelectItem>
                      <SelectItem value="products">Product Information</SelectItem>
                      <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                      <SelectItem value="support">Technical Support</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Message *
                  </label>
                  <Textarea 
                    placeholder="Tell us more about your inquiry..."
                    className="min-h-[120px]"
                  />
                </div>
                
                <Button className="w-full" variant="hero">
                  Send Message
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  By submitting this form, you agree to our privacy policy and terms of service.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {contactInfo.map((info) => (
                <Card key={info.title} className="product-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-hero">
                        <info.icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-lg font-bold">
                        {info.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {info.details.map((detail, index) => (
                        <p key={index} className="text-sm text-muted-foreground">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Regional Offices */}
            <Card className="product-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Regional Offices
                </CardTitle>
                <p className="text-muted-foreground">
                  Visit us at any of our regional offices across Kenya.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {offices.map((office) => (
                    <div key={office.city} className="border-l-2 border-primary pl-4">
                      <h4 className="font-semibold text-foreground">{office.city} Office</h4>
                      <p className="text-sm text-muted-foreground">{office.address}</p>
                      <p className="text-sm text-muted-foreground">{office.phone}</p>
                      <p className="text-sm text-primary">Manager: {office.manager}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card className="product-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Find Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Interactive map coming soon</p>
                    <p className="text-sm text-muted-foreground">
                      Main Office: Njabini - Ol Kalou Highway, Nyandarua 1km from Olkalou town.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ CTA */}
      <div className="bg-muted/50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Need Quick Answers?
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Check out our frequently asked questions or browse our resource center 
              for immediate help with common farming topics.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="hero">
                View FAQ
              </Button>
              <Button size="lg" variant="outline">
                Browse Resources
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
