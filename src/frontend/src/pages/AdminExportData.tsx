import { Download, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetAllCustomerOrdersAdmin } from '../hooks/useQueries';
import { formatPaymentMethod } from '../hooks/useQueries';
import { arrayToCsv, downloadCsv, generateTimestampedFilename } from '../utils/csvExport';
import { useState } from 'react';

export default function AdminExportData() {
  const { data: customerOrders, isLoading, error } = useGetAllCustomerOrdersAdmin();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (!customerOrders || customerOrders.length === 0) {
      return;
    }

    setIsExporting(true);

    try {
      // Define CSV headers
      const headers = [
        'Order ID',
        'Customer Name',
        'Email',
        'Phone',
        'Address',
        'Order Date',
        'Products',
        'Quantities',
        'Prices',
        'Payment Method',
        'Total'
      ];

      // Convert orders to CSV rows
      const rows = customerOrders.map(order => {
        const productNames = order.items.map(item => `Product ${item.productId}`).join('; ');
        const quantities = order.items.map(item => item.quantity.toString()).join('; ');
        const prices = order.items.map(item => `₹${item.price}`).join('; ');
        
        // Format order date (currently 0 in backend, but handle it)
        const orderDate = order.orderDate > 0 
          ? new Date(Number(order.orderDate) / 1000000).toLocaleDateString() 
          : 'N/A';

        return [
          order.id.toString(),
          order.customerDetails.name,
          order.customerDetails.email,
          order.customerDetails.contactNumber,
          order.customerDetails.shippingAddress,
          orderDate,
          productNames,
          quantities,
          prices,
          formatPaymentMethod(order.paymentMethod),
          `₹${order.totalAmount}`
        ];
      });

      // Generate CSV content
      const csvContent = arrayToCsv(headers, rows);

      // Download the file
      const filename = generateTimestampedFilename('customer-data');
      downloadCsv(csvContent, filename);
    } catch (err) {
      console.error('Error exporting data:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Export Customer Data
        </h1>
        <p className="text-muted-foreground text-lg">
          Download all customer order information as a CSV file
        </p>
      </div>

      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Customer Order Data
          </CardTitle>
          <CardDescription>
            Export comprehensive customer order details including contact information, products, and payment methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load customer data. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {!error && (
            <>
              <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Export Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? '...' : customerOrders?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Format</p>
                    <p className="text-2xl font-bold text-foreground">CSV</p>
                  </div>
                </div>
              </div>

              <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                <h4 className="font-semibold mb-2 text-sm">Exported Fields:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Order ID, Customer Name, Email, Phone</li>
                  <li>• Shipping Address, Order Date</li>
                  <li>• Products, Quantities, Prices</li>
                  <li>• Payment Method, Total Amount</li>
                </ul>
              </div>

              <Button
                onClick={handleExport}
                disabled={isLoading || isExporting || !customerOrders || customerOrders.length === 0}
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-lg h-14"
              >
                <Download className="mr-2 h-5 w-5" />
                {isExporting ? 'Exporting...' : 'Export Customer Data'}
              </Button>

              {!isLoading && customerOrders && customerOrders.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No customer orders available to export. Orders will appear here once customers complete their purchases.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
