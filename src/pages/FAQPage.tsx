import Layout from '../components/Layout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQPage = () => {
  const faqs = [
    {
      question: 'What products do you offer?',
      answer: 'We offer a wide range of electronic components, robotics kits, microcontrollers, sensors, motors, and DIY project materials. Our catalog includes everything from basic resistors and capacitors to advanced Arduino and Raspberry Pi accessories.',
    },
    {
      question: 'How can I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking number via email. You can use this number on our Order Tracking page to monitor your shipment in real-time.',
    },
    {
      question: 'What are your shipping options?',
      answer: 'We offer standard shipping (5-7 business days), express shipping (2-3 business days), and same-day delivery for select areas. Shipping costs are calculated at checkout based on your location and order weight.',
    },
    {
      question: 'Do you offer bulk discounts?',
      answer: 'Yes! We offer competitive bulk pricing for educational institutions, businesses, and large orders. Please contact our sales team for a custom quote.',
    },
    {
      question: 'What is your return policy?',
      answer: 'We accept returns within 30 days of purchase for unused items in original packaging. Defective items can be returned or exchanged within 90 days. Please contact our support team to initiate a return.',
    },
    {
      question: 'Do you provide technical support?',
      answer: 'Absolutely! Our technical support team is available via email and chat to help you with product questions, project guidance, and troubleshooting. We also have extensive documentation and tutorials on our website.',
    },
    {
      question: 'Are your products covered by warranty?',
      answer: 'Most of our products come with a manufacturer warranty ranging from 6 months to 2 years. Warranty details are listed on each product page.',
    },
    {
      question: 'How can I become an affiliate or partner?',
      answer: 'We welcome partnerships with content creators, educators, and businesses. Please reach out to us through our Contact page with details about your proposal.',
    },
  ];

  return (
    <Layout>
      <div className="network-bg py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-muted-foreground">
                Find answers to common questions about our products and services.
              </p>
            </div>

            <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8">
              <Accordion type="single" collapsible className="space-y-2">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border border-border rounded-lg px-4 data-[state=open]:bg-secondary/30"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="font-medium text-foreground">
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Still have questions?{' '}
                <a href="/contact" className="text-primary hover:underline">
                  Contact our support team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;
