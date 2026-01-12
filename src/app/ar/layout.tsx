import SetLocaleAttrs from "@/components/SetLocaleAttrs";
import { Tajawal } from "next/font/google";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700"],
  display: "swap",
});

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SetLocaleAttrs locale="ar" />
      <div className={tajawal.className}>{children}</div>
    </>
  );
}
