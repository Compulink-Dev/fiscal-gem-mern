import Label from "./Label"


interface TaxpayerInfoProps {
  name: string
  tin: string
  branch: string
  address: {
    province: string
    city: string
    street: string
    houseNo: string
  }
  contacts: {
    phoneNo: string
    email: string
  }
  vatNumber: string
}

function TaxpayerInfo({
  name,
  tin,
  branch,
  address = {
    province: 'N/A',
    city: 'N/A',
    street: 'N/A',
    houseNo: 'N/A'
  },
  contacts = {
    phoneNo: 'N/A',
    email: 'N/A'
  },
  vatNumber
}: TaxpayerInfoProps) {
  // Format the address into a single string
  const formattedAddress = `${address.houseNo} ${address.street}, ${address.city}, ${address.province}`

  return (
    <div className="custom-style">
      <div className="text-lg font-bold mb-4 title">Tax Payer Details</div>
      <div className="flex items-center justify-between">
        <Label htmlFor="" className="">Tax Payer Name:</Label>
        <Label htmlFor="" className="">{name}</Label>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="" className="">Tax Payer TIN:</Label>
        <Label htmlFor="" className="">{tin}</Label>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="" className="">Tax Payer Branch:</Label>
        <Label htmlFor="" className="">{branch}</Label>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="" className="">Tax Payer Address:</Label>
        <Label htmlFor="" className="">{formattedAddress}</Label>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="" className="">VAT Number:</Label>
        <Label htmlFor="" className="">{vatNumber}</Label>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="" className="">Tax Payer Phone Number:</Label>
        <Label htmlFor="" className="">{contacts.phoneNo}</Label>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="" className="">Tax Payer Email:</Label>
        <Label htmlFor="" className="">{contacts.email}</Label>
      </div>
    </div>
  )
}

export default TaxpayerInfo
