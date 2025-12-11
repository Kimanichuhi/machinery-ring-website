import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Clock, Award } from 'lucide-react';

const services = [
  {
    id: 1,
    name: 'Mechanization Services',
    description: 'Professional agricultural advice from certified experts to optimize your farming practices.',
    price: 'Price Per Service',
    duration: 'Based on Workload',
    rating: 4.8,
    features: [
      'Disc Harrow',
      'Mouldboard Plough',
      'Chisel Plough',
      'Subsoiler',
      'Rotavator',
      'Motorised Sprayer',
      'Maize Planter',
      'Potato Planter',
      'Potato Harvester',
      'Maize Sheller',
      'Feed Mixer',
      'Chopper',
      'Follow-up support'
    ],
    category: 'Paid-Service',
    bookings: '3000+'
  },
  {
    id: 2,
    name: 'Feed Formulation Services',
    description: 'Professional agricultural advice from certified experts to optimize your farming practices.',
    price: 'From KES 5,000',
    duration: '2-4 hours',
    rating: 4.8,
    features: [
      'Custom feed mixing for different livestock.',
      'Feed cost analysis and management.',
      'Use of organic and locally available materials.',
      'Packaging and storage best practices.',
      'Feed ratio optimization and cost reduction.',
      'Dairy feed formulation for milk yield improvement.',
      'Poultry feed formulation (layers, broilers, chicks).',
      'Feed quality testing and control.',
      'Balancing protein, energy, and minerals.',
      'Custom feed mixing for different livestock.',
      'Follow-up support'
    ],
    category: 'Paid-Service',
    bookings: '500+'
  },
  {
    id: 3,
    name: 'Capacity Building',
    description: 'Professional agricultural training from certified experts to optimize your farming practices.',
    price: 'Free',
    duration: '2-4 hours',
    rating: 4.8,
    features: [
      'Intergrated soil fertility management (Soil sampling and testing Services)',
      'Soil acidity management training and Demonstrations (Liming)',
      'Economic Management and Business Service development Traininig',
      'Training and demonstrations on Potatoes value Chain (Markies Variety)',
      'Post harvest handling training',
      'Dairy value chain training (Calf rearing, Dairy cow Feeding and Housing)',
      'Climate smart Farming (CSF Training',
      'Follow-up support'
    ],
    category: 'Training',
    bookings: '500+'
  },
  {
    id: 4,
    name: 'Agronomy Services',
    description: 'We offer professional Farm Consultancy services that guide farmers to improve yields and sustainability',
    price: 'From KES 5,000',
    duration: '2-4 hours',
    rating: 4.8,
    features: [
      'Crop selection and Planting guidance',
      'Soil fertility management',
      'Farming practice optimization',
      'Yield improvement strategies',
      'Pest and disease management support',
      'Field monitoring and advisory visits',
      'Training on crop rotation.',
      'Yield improvement and sustainability strategies',
      'Follow-up support'
    ],
    category: 'Consultancy',
    bookings: '500+'
  },
  {
    id: 5,
    name: 'Soil Testing',
    description: 'Comprehensive soil analysis to determine nutrient levels and pH for optimal crop growth.',
    price: 'KES 3,500',
    duration: '5-7 days',
    features: [
      'Soil sampling and analysis',
      'pH level and Fertility testing',
      'Nutrient profiling and recommendations',
      'Organic matter assessment',
      'Detailed soil report',
      'Fertilizer recommendations and Application',
      'Identification of soil deficiencies',
      'Follow-up support'
    ],
    category: 'Testing',
    rating: 4.8,
    bookings: '1,200+'
  },
  {
    id: 6,
    name: 'Agro-Dealership',
    description: 'We provide Farmers with quality products and expert advice to help them boost productivity and practice sustainable agriculture.',
    price: 'Check our Markertplace for amazing products.',
    duration: '1-2 days on order',
    features: [
      'Supply of Quality & Certified farm inputs',
      'Fertilizers and soil enhancers',
      'Pesticides and herbicides',
      'Animal feeds and supplements',
      'Farm tools and equipment',
      'Agrochemicals and protective gear',
      'Advisory services on input use',
      'Follow-up support'
    ],
    category: 'Agri-Busness',
    rating: 4.7,
    bookings: '300+'
  },
  {
    id: 7,
    name: 'Aggregation and Marketing',
    description: 'We connect farmers to reliable markets',
    price: 'As Agreed',
    duration: 'Flexible',
    features: [
      'Aggregating of produce',
      'Ensuring fair prices',
      'Improve income for farmers.',
      'Improve bargaining power for farmers',
      'Market Information and price updates',
      'Establishment of market linkages and partnerships',
      'Follow-up support'
    ],
    category: 'Agri-Business',
    rating: 4.6,
    bookings: '800+'
  }
];

const Services = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Expert Agricultural Services
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground max-w-2xl mx-auto px-4">
              Professional farming services from certified experts to help you maximize yields, 
              optimize resources and grow your agricultural business.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-muted/50 py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-3 text-center">
            <div>
              <div className="flex justify-center mb-2">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-primary">50+</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Certified Experts</p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-primary">2,800+</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Services Completed</p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-primary">98%</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id} className="product-card">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {service.category}
                    </Badge>
                    <CardTitle className="text-lg sm:text-xl font-bold">
                      {service.name}
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm sm:text-base">
                      {service.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-2">
                  <div>
                    <p className="text-base sm:text-lg font-bold text-primary">{service.price}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{service.duration}</span>
                      </div>
                      <span>★ {service.rating}</span>
                      <span>{service.bookings} bookings</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-3 mb-4 sm:mb-6">
                  <h4 className="font-semibold text-sm">What's included:</h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-xs sm:text-sm">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="flex-1" variant="hero">
                    Book Service
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Need Custom Agricultural Support?
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Our team of agricultural experts is ready to provide personalized solutions 
              for your specific farming needs.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary">
                Contact Our Experts
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Request Quote
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
