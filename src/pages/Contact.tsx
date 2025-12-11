import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      'nyandarua-mr@machineryring.org',
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
    location: 'Njabini-Olkalou Highway, 1km away from Olkalou Town.',
    phone: '+254 741595086',
    manager: 'Jeremiah Mwangi'
  },
];

const Contact = () => {
  const emailAddress = 'nyandarua-mr@machineryring.org';
  const emailSubject = 'Inquiry from Website';
  const mailtoLink = `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}`;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Contact Us
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground max-w-2xl mx-auto px-4">
              Get in touch with our agricultural experts. We're here to help you succeed 
              with personalized support and guidance.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:gap-16 lg:grid-cols-2">
          {/* Contact CTA */}
          <div>
            <Card className="product-card">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl sm:text-2xl font-bold">
                    Get in Touch
                  </CardTitle>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Click the button below to send us an email. We'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6 text-center">
                  <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Email Us Directly</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    We'd love to hear from you. Send us an email with your questions or inquiries.
                  </p>
                  <a href={mailtoLink}>
                    <Button className="w-full sm:w-auto" variant="hero" size="lg">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </Button>
                  </a>
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-3">Or reach us via:</h4>
                  <div className="space-y-3">
                    <a 
                      href="https://wa.me/254741595086" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="h-5 w-5" />
                      <span>WhatsApp: +254 741595086</span>
                    </a>
                    <a 
                      href={mailtoLink}
                      className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                      <span>{emailAddress}</span>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              {contactInfo.map((info) => (
                <Card key={info.title} className="product-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        <info.icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-base sm:text-lg font-bold">
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
                <CardTitle className="text-lg sm:text-xl font-bold">
                  Regional Offices
                </CardTitle>
                <p className="text-muted-foreground text-sm sm:text-base">
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
                <CardTitle className="text-lg sm:text-xl font-bold">
                  Find Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center p-4">
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
      <div className="bg-muted/50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Need Quick Answers?
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Check out our frequently asked questions or browse our resource center 
              for immediate help with common farming topics.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
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
