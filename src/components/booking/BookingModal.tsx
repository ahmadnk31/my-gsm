import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Smartphone, CheckCircle, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { useDeviceCategories, useDeviceBrands, useDeviceModels, useDeviceParts } from "@/hooks/useRepairQueries";

type DeviceCategory = Tables<'device_categories'>;
type DeviceBrand = Tables<'device_brands'>;
type DeviceModel = Tables<'device_models'>;
type DevicePart = Tables<'device_parts'>;
type PartPricing = Tables<'part_pricing'>;

interface PartWithPricing extends DevicePart {
  pricing: PartPricing[];
}

const bookingSchema = z.object({
  device: z.string().min(1, "Please select your device"),
  brand: z.string().min(1, "Please select device brand"),
  model: z.string().min(1, "Please select device model"),
  service: z.string().min(1, "Please select a service"),
  quality: z.string().optional(), // For quality selection
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string().min(1, "Please select a time"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  issue: z.string().min(10, "Please describe the issue (minimum 10 characters)"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM"
];

interface SelectedPart {
  id: string;
  name: string;
  category: string;
  model: string;
  brand: string;
  device_type: string;
  quality_type: string;
  price: number;
  estimated_duration: string;
}

interface BookingModalProps {
  children: React.ReactNode;
  selectedPart?: SelectedPart;
}

export function BookingModal({ children, selectedPart }: BookingModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(selectedPart ? 2 : 1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");


  // Use the correct hooks for data fetching
  const categoriesQuery = useDeviceCategories();
  const brandsQuery = useDeviceBrands(selectedCategory);
  const modelsQuery = useDeviceModels(selectedBrand);
  const partsQuery = useDeviceParts(selectedModel);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      device: selectedPart?.device_type || "",
      brand: selectedPart?.brand || "",
      model: selectedPart?.model || "",
      service: selectedPart?.id || "",
      quality: selectedPart?.quality_type || "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      issue: selectedPart ? `${selectedPart.name} repair (${selectedPart.quality_type} quality)` : "",
    },
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (open && !selectedPart) {
      setSelectedCategory("");
      setSelectedBrand("");
      setSelectedModel("");
    }
    
    if (selectedPart) {
      form.setValue("device", selectedPart.device_type);
      form.setValue("brand", selectedPart.brand);
      form.setValue("model", selectedPart.model);
      form.setValue("service", selectedPart.id);
      form.setValue("quality", selectedPart.quality_type);
      form.setValue("issue", `${selectedPart.name} repair (${selectedPart.quality_type} quality)`);
      setStep(2);
    }
  }, [open, selectedPart, form]);

  const onSubmit = async (data: BookingFormData) => {
    console.log('Form submission started with data:', data);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found, redirecting to auth');
        toast.error("Authentication Required", {
          description: "Please sign in to book a repair",
        });
        navigate('/auth');
        return;
      }

      console.log('User authenticated:', user.id);

      // Get quality type and price
      const qualityType = selectedPart?.quality_type || (data.quality ? data.quality.split('-')[1] : null);
      let price = selectedPart?.price || 50; // Default price

      const bookingData = {
        user_id: user.id,
        device_type: selectedPart ? selectedPart.device_type : getCategoryName(data.device),
        device_model: selectedPart ? selectedPart.model : getModelName(data.model),
        issue_description: data.issue,
        preferred_date: format(data.date, "yyyy-MM-dd"),
        preferred_time: data.time,
        customer_name: `${data.firstName} ${data.lastName}`,
        customer_email: data.email,
        customer_phone: data.phone,
        part_id: selectedPart?.id || data.service || null,
        selected_quality_type: qualityType,
        estimated_cost: price,
        quoted_price: price,
        status: 'pending' as const
      };

      console.log('Submitting booking data:', bookingData);

      const { error } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Booking submitted successfully');

      toast.success("Booking Confirmed!", {
        description: `Your repair appointment has been scheduled for ${format(data.date, "PPP")} at ${data.time}.`,
      });
      
      setOpen(false);
      setStep(selectedPart ? 2 : 1);
      form.reset();
      setSelectedCategory("");
      setSelectedBrand("");
      setSelectedModel("");
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error("Booking Failed", {
        description: error.message || "There was an error submitting your booking. Please try again.",
      });
    }
  };

  const selectedService = selectedPart ? {
    id: selectedPart.id,
    name: selectedPart.name,
    description: `${selectedPart.category} repair for ${selectedPart.brand} ${selectedPart.model}`,
    estimated_price: selectedPart.price,
    estimated_duration: selectedPart.estimated_duration
  } : (partsQuery.data as PartWithPricing[])?.find(s => s.id === form.watch("service"));

  // Helper functions to get names from IDs
  const getCategoryName = (categoryId: string) => {
    const category = categoriesQuery.data?.find(cat => cat.id === categoryId);
    console.log('Getting category name for ID:', categoryId, 'Found:', category?.name);
    return category?.name || categoryId;
  };

  const getBrandName = (brandId: string) => {
    const brand = brandsQuery.data?.find(brand => brand.id === brandId);
    console.log('Getting brand name for ID:', brandId, 'Found:', brand?.name);
    return brand?.name || brandId;
  };

  const getModelName = (modelId: string) => {
    const model = modelsQuery.data?.find(model => model.id === modelId);
    console.log('Getting model name for ID:', modelId, 'Found:', model?.name);
    return model?.name || modelId;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Book Your Repair
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-4">
            {(selectedPart ? [2, 3] : [1, 2, 3]).map((stepNum, index) => (
              <div key={stepNum} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step >= stepNum 
                    ? "bg-primary text-white" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {step > stepNum ? <CheckCircle className="h-4 w-4" /> : (selectedPart && stepNum === 2 ? 1 : selectedPart && stepNum === 3 ? 2 : stepNum)}
                </div>
                {index < (selectedPart ? 1 : 2) && (
                  <div className={cn(
                    "w-16 h-0.5 mx-2",
                    step > stepNum ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <div className="space-y-6">
            {selectedPart && step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Repair Service</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{selectedPart.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedPart.brand} {selectedPart.model} - {selectedPart.category} repair
                        </p>
                        <Badge className="mt-2">
                          {selectedPart.quality_type.charAt(0).toUpperCase() + selectedPart.quality_type.slice(1)} Quality
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">${selectedPart.price}</div>
                        <div className="text-xs text-muted-foreground">{selectedPart.estimated_duration}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!selectedPart && step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Device & Service Selection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="device"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Category</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedCategory(value);
                          form.setValue("brand", "");
                          form.setValue("model", "");
                          form.setValue("service", "");
                        }}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your device category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoriesQuery.data?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedCategory && (
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device Brand</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedBrand(value);
                            form.setValue("model", "");
                            form.setValue("service", "");
                          }}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your device brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {brandsQuery.data?.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                  {brand.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedBrand && (
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device Model</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedModel(value);
                          }}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your device model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {modelsQuery.data?.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                  {model.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedModel && (
                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repair Service</FormLabel>
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select the service you need" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {partsQuery.isLoading ? (
                                <SelectItem value="loading" disabled>Loading services...</SelectItem>
                              ) : partsQuery.data?.length === 0 ? (
                                <SelectItem value="no-services" disabled>
                                  No services available for selected device
                                </SelectItem>
                              ) : (
                                partsQuery.data?.map((part) => (
                                  <SelectItem key={part.id} value={part.id}>
                                    <div className="flex justify-between items-center w-full">
                                      <span>{part.name}</span>
                                      <span className="text-sm text-muted-foreground ml-4">
                                        From ${part.pricing?.[0]?.price || 50}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedService && (
                    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{selectedService.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{selectedService.description}</p>
                        </div>
                                                 <div className="text-right">
                           <div className="text-sm font-medium">From ${'estimated_price' in selectedService ? selectedService.estimated_price : (selectedService.pricing?.[0]?.price || 50)}</div>
                           <div className="text-xs text-muted-foreground">{'estimated_duration' in selectedService ? selectedService.estimated_duration : '30-60 min'}</div>
                         </div>
                      </div>

                      {selectedService && 'pricing' in selectedService && selectedService.pricing && selectedService.pricing.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Available Quality Options:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedService.pricing.map((price) => (
                              <div key={price.id} className="flex items-center gap-2 text-xs bg-background p-2 rounded border">
                                <Badge 
                                  variant={price.quality_type === 'original' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {price.quality_type === 'original' ? 'Original' : 'Copy'}
                                </Badge>
                                <span className="font-medium">${price.price}</span>
                              </div>
                            ))}
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="quality"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select Quality</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Choose quality option" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {selectedService.pricing.map((price) => (
                                      <SelectItem key={price.id} value={price.quality_type}>
                                        <div className="flex justify-between items-center w-full">
                                          <span>{price.quality_type === 'original' ? 'Original' : 'Copy'} Quality</span>
                                          <span className="text-sm text-muted-foreground ml-4">
                                            ${price.price}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="issue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Describe the Issue</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please describe the problem with your device in detail..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Select Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Appointment Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() || date.getDay() === 0 // Disable past dates and Sundays
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointment Time</FormLabel>
                        <Select onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a time slot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Booking Summary */}
                  <div className="bg-muted/50 p-4 rounded-lg mt-6">
                    <h4 className="font-medium mb-3">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Device:</span>
                        <span>
                          {selectedPart ? 
                            `${selectedPart.brand} ${selectedPart.model}` : 
                            (() => {
                              const categoryName = getCategoryName(form.watch("device"));
                              const brandName = getBrandName(form.watch("brand"));
                              const modelName = getModelName(form.watch("model"));
                              console.log('Booking summary device:', { categoryName, brandName, modelName });
                              return `${categoryName} ${brandName} ${modelName}`;
                            })()
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service:</span>
                        <span>{selectedPart ? selectedPart.name : selectedService?.name}</span>
                      </div>
                      {selectedPart && (
                        <div className="flex justify-between">
                          <span>Quality:</span>
                          <span>{selectedPart.quality_type.charAt(0).toUpperCase() + selectedPart.quality_type.slice(1)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{form.watch("date") ? format(form.watch("date"), "PPP") : "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span>{form.watch("time") || "-"}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Price:</span>
                        <span>
                          {selectedPart ? `$${selectedPart.price}` : 
                           form.watch("quality") && selectedService && 'pricing' in selectedService ? 
                           (() => {
                             const quality = form.watch("quality");
                             const price = selectedService.pricing.find(p => p.quality_type === quality);
                                                           return `$${price?.price || ('estimated_price' in selectedService ? selectedService.estimated_price : 50)}`;
                           })() : 
                                                       `From ${'estimated_price' in selectedService ? selectedService.estimated_price : (selectedService?.pricing?.[0]?.price || 50)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(Math.max(selectedPart ? 2 : 1, step - 1))}
                disabled={step === (selectedPart ? 2 : 1)}
              >
                Previous
              </Button>
              
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (!selectedPart && step === 1 && (!form.watch("device") || !form.watch("brand") || !form.watch("model") || !form.watch("service"))) ||
                    (step === 2 && (!form.watch("date") || !form.watch("time"))) ||
                    (!selectedPart && step === 1 && selectedService && 'pricing' in selectedService && selectedService.pricing.length > 0 && !form.watch("quality"))
                  }
                >
                  Next
                </Button>
              ) : (
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <Button type="submit" onClick={() => console.log('Confirm Booking button clicked')}>
                    Confirm Booking
                  </Button>
                </form>
              )}
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}