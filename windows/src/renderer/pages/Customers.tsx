import Button from "../../components/Button";
import Dialog from "../../components/Dailog";
import Input from "../../components/Input";
import Label from "../../components/Label";
import TextArea from "../../components/TextArea";
import React from "react";

function Customers() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog isOpen={open} onClose={() => setOpen(false)}>
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Enter name" />
        <Label htmlFor="message">Message</Label>
        <TextArea id="message" rows={4} />
        <Button className="mt-2" onClick={() => {}}>
          Submit
        </Button>
      </Dialog>
    </>
  );
}

export default Customers;
