import { Label } from "@/components/ui/label";

interface TaxpayerInfoProps {
  name: string;
  tin: string;
  branch: string;
  address: {
    province: string;
    city: string;
    street: string;
    houseNo: string;
  };
  contacts: {
    phoneNo: string;
    email: string;
  };
  vatNumber: string;
}

function TaxpayerInfo({
  name,
  tin,
  branch,
  address = {
    province: "N/A",
    city: "N/A",
    street: "N/A",
    houseNo: "N/A",
  },
  contacts = {
    phoneNo: "N/A",
    email: "N/A",
  },
  vatNumber,
}: TaxpayerInfoProps) {
  // Format the address into a single string
  const formattedAddress = `${address.houseNo} ${address.street}, ${address.city}, ${address.province}`;

  return (
    <div className="border p-4 rounded-lg md:col-span-3 space-y-2">
      <div className="text-lg font-bold mb-4">Tax Payer Details</div>
      <div className="flex items-center justify-between">
        <Label className="font-medium">Tax Payer Name</Label>
        <Label className="text-muted-foreground">{name}</Label>
      </div>
      <div className="flex items-center justify-between">
        <Label className="font-medium">Tax Payer TIN</Label>
        <Label className="text-muted-foreground">{tin}</Label>
      </div>
      <div className="flex items-center justify-between">
        <Label className="font-medium">Tax Payer Branch</Label>
        <Label className="text-muted-foreground">{branch}</Label>
      </div>
      <div className="flex items-center justify-between">
        <Label className="font-medium">Tax Payer Address</Label>
        <Label className="text-muted-foreground">{formattedAddress}</Label>
      </div>
      <div className="flex items-center justify-between">
        <Label className="font-medium">VAT Number</Label>
        <Label className="text-muted-foreground">{vatNumber}</Label>
      </div>
      <div className="flex items-center justify-between">
        <Label className="font-medium">Tax Payer Phone Number</Label>
        <Label className="text-muted-foreground">{contacts.phoneNo}</Label>
      </div>
      <div className="flex items-center justify-between">
        <Label className="font-medium">Tax Payer Email</Label>
        <Label className="text-muted-foreground">{contacts.email}</Label>
      </div>
    </div>
  );
}

export default TaxpayerInfo;
