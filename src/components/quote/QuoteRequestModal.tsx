import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare } from 'lucide-react';

const quoteRequestSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Please enter a valid email address'),
  customerPhone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  deviceInfo: z.string().min(5, 'Please provide device information'),
  issueDescription: z.string().min(10, 'Please describe the issue in detail'),
});

type QuoteRequestForm = z.infer<typeof quoteRequestSchema>;

interface QuoteRequestModalProps {
  children: React.ReactNode;
  deviceCategoryId?: string;
  deviceBrandId?: string;
  deviceModelId?: string;
  devicePartId?: string;
  triggerClassName?: string;
}

export function QuoteRequestModal({
  children,
  deviceCategoryId,
  deviceBrandId,
  deviceModelId,
  devicePartId,
  triggerClassName
}: QuoteRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<QuoteRequestForm>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      customerName: '',
      customerEmail: user?.email || '',
      customerPhone: '',
      deviceInfo: '',
      issueDescription: '',
    },
  });

  const onSubmit = async (data: QuoteRequestForm) => {
    if (!user) {
      toast({
        title: t('quote.authenticationRequired'),
        description: t('quote.signInToRequest'),
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const quoteData = {
        user_id: user.id,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone || null,
        custom_device_info: data.deviceInfo,
        issue_description: data.issueDescription,
        device_category_id: deviceCategoryId || null,
        device_brand_id: deviceBrandId || null,
        device_model_id: deviceModelId || null,
        device_part_id: devicePartId || null,
        status: 'pending'
      };

      const { error } = await supabase
        .from('quote_requests')
        .insert([quoteData]);

      if (error) throw error;

      toast({
        title: t('quote.quoteSubmitted'),
        description: t('quote.quoteSubmittedDescription'),
      });

      setOpen(false);
      form.reset();
    } catch (error: any) {
      console.error('Error submitting quote request:', error);
      toast({
        title: t('quote.error'),
        description: t('quote.errorDescription'),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={triggerClassName}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t('quote.title')}
          </DialogTitle>
          <DialogDescription>
            {t('quote.description')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('quote.fullName')}</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('quote.email')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('quote.phoneNumber')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder={t('quote.phonePlaceholder')} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deviceInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('quote.deviceInfo')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('quote.deviceInfoPlaceholder')} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issueDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('quote.issueDescription')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('quote.issuePlaceholder')}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                {t('quote.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('quote.submitting')}
                  </div>
                ) : (
                  <>
                    <Phone className="h-4 w-4 mr-2" />
                    {t('quote.requestQuote')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
