import { useState } from 'react';
import { useQuoteRequests } from '@/hooks/useQuoteRequests';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { 
  DollarSign, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  MessageSquare
} from 'lucide-react';

const quoteUpdateSchema = z.object({
  quotedPrice: z.string().min(1, 'Please enter a price'),
  quoteNotes: z.string().optional(),
  adminNotes: z.string().optional(),
});

type QuoteUpdateForm = z.infer<typeof quoteUpdateSchema>;

export function QuoteRequestsManager() {
  const { quoteRequests, loading, updateQuoteRequest, createBookingFromQuote } = useQuoteRequests();
  const { toast } = useToast();
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  const form = useForm<QuoteUpdateForm>({
    resolver: zodResolver(quoteUpdateSchema),
    defaultValues: {
      quotedPrice: '',
      quoteNotes: '',
      adminNotes: '',
    },
  });

  const handleProvideQuote = async (data: QuoteUpdateForm) => {
    if (!selectedQuote) return;

    setUpdating(true);
    try {
      const result = await updateQuoteRequest(selectedQuote.id, {
        quoted_price: parseFloat(data.quotedPrice),
        quote_notes: data.quoteNotes,
        admin_notes: data.adminNotes,
        status: 'quoted'
      });

      if (result.success) {
        toast({
          title: "Quote Provided!",
          description: "The customer will be notified of your quote.",
        });
        setSelectedQuote(null);
        form.reset();
      } else {
        throw new Error('Failed to update quote');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to provide quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateBooking = async (quoteId: string) => {
    try {
      const result = await createBookingFromQuote(quoteId);
      
      if (result.success) {
        toast({
          title: "Booking Created!",
          description: "A new booking has been created from this quote.",
        });
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'outline',
      quoted: 'default',
      accepted: 'default',
      declined: 'destructive',
      expired: 'secondary'
    };

    const colors: Record<string, string> = {
      pending: 'text-yellow-600',
      quoted: 'text-blue-600',
      accepted: 'text-green-600',
      declined: 'text-red-600',
      expired: 'text-gray-600'
    };

    return (
      <Badge variant={variants[status] || 'outline'} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quote Requests</h2>
          <p className="text-muted-foreground">
            Manage customer quote requests and provide pricing
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quoteRequests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quoteRequests.filter(q => q.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quoted</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quoteRequests.filter(q => q.status === 'quoted').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quoteRequests.filter(q => q.status === 'accepted').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quote Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Quote Requests</CardTitle>
          <CardDescription>
            View and manage customer quote requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {quoteRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No quote requests found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quote</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quoteRequests.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quote.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{quote.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{quote.custom_device_info}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {quote.issue_description}
                    </TableCell>
                    <TableCell>{getStatusBadge(quote.status)}</TableCell>
                    <TableCell>
                      {quote.quoted_price ? `$${quote.quoted_price}` : '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(quote.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedQuote(quote);
                                form.reset({
                                  quotedPrice: quote.quoted_price?.toString() || '',
                                  quoteNotes: quote.quote_notes || '',
                                  adminNotes: quote.admin_notes || '',
                                });
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Quote Request Details</DialogTitle>
                              <DialogDescription>
                                Provide a quote for this customer request
                              </DialogDescription>
                            </DialogHeader>

                            {selectedQuote && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold">Customer Details</h4>
                                    <p><strong>Name:</strong> {selectedQuote.customer_name}</p>
                                    <p><strong>Email:</strong> {selectedQuote.customer_email}</p>
                                    <p><strong>Phone:</strong> {selectedQuote.customer_phone || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">Request Details</h4>
                                    <p><strong>Device:</strong> {selectedQuote.custom_device_info}</p>
                                    <p><strong>Status:</strong> {getStatusBadge(selectedQuote.status)}</p>
                                    <p><strong>Date:</strong> {format(new Date(selectedQuote.created_at), 'PPP')}</p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold">Issue Description</h4>
                                  <p className="mt-1 p-3 bg-muted rounded-md">
                                    {selectedQuote.issue_description}
                                  </p>
                                </div>

                                <Form {...form}>
                                  <form onSubmit={form.handleSubmit(handleProvideQuote)} className="space-y-4">
                                    <FormField
                                      control={form.control}
                                      name="quotedPrice"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Quote Price ($)</FormLabel>
                                          <FormControl>
                                            <Input 
                                              type="number" 
                                              step="0.01" 
                                              placeholder="125.00" 
                                              {...field} 
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="quoteNotes"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Quote Notes (for customer)</FormLabel>
                                          <FormControl>
                                            <Textarea
                                              placeholder="Details about the repair, parts needed, timeline, etc."
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="adminNotes"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Admin Notes (internal)</FormLabel>
                                          <FormControl>
                                            <Textarea
                                              placeholder="Internal notes about this quote..."
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <div className="flex gap-3 pt-4">
                                      <Button
                                        type="submit"
                                        disabled={updating}
                                        className="flex-1"
                                      >
                                        {updating ? (
                                          <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Updating...
                                          </div>
                                        ) : (
                                          <>
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            Provide Quote
                                          </>
                                        )}
                                      </Button>
                                      
                                      {selectedQuote.status === 'quoted' && (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() => handleCreateBooking(selectedQuote.id)}
                                          className="flex-1"
                                        >
                                          <Calendar className="h-4 w-4 mr-2" />
                                          Create Booking
                                        </Button>
                                      )}
                                    </div>
                                  </form>
                                </Form>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
