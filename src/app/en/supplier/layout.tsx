import { ReactNode } from "react";
import { SupplierLayout } from "@/components/supplier-layout";

export default function Layout({ children }: { children: ReactNode }) {
  return <SupplierLayout locale="en">{children}</SupplierLayout>;
}
