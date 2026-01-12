import Link from "next/link";

export default function Page() {
  return (
    <main className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">اختبار الاتجاه</h1>
        <Link href="/ar" className="underline">
          العودة إلى العربية
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 rounded-lg border border-border p-4">
          <h2 className="font-medium">فقرة</h2>
          <p className="text-muted-foreground">
            تساعد هذه الصفحة في التأكد من محاذاة العناصر بين الاتجاهين. راقب
            المسافات وعلامات الترقيم واستقامة السطور أثناء التصفح السريع.
          </p>
        </div>

        <div className="space-y-2 rounded-lg border border-border p-4">
          <h2 className="font-medium">تفاصيل</h2>
          <ul className="list-disc space-y-1 pr-5 text-muted-foreground">
            <li>النقاط والقوائم تظهر بمحاذاة صحيحة.</li>
            <li>الأرقام والعناوين تحافظ على نفس المسافات.</li>
            <li>الأيقونات المضمنة تبقى على نفس الخط الأساسي.</li>
            <li>التفاف النص يتم بدون اقتطاع أو تراكب.</li>
          </ul>
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="font-medium">نموذج</h2>
          <label className="block text-sm font-medium" htmlFor="name-ar">
            اسم التواصل
          </label>
          <input
            id="name-ar"
            type="text"
            placeholder="أدخل اسماً"
            className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            إرسال
          </button>
        </div>

        <div className="space-y-2 rounded-lg border border-border p-4">
          <h2 className="font-medium">إحصائيات</h2>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-md bg-muted p-3 text-center">
              <div className="text-xs text-muted-foreground">طلبات الشراء</div>
              <div className="text-lg font-semibold tabular-nums">18</div>
            </div>
            <div className="rounded-md bg-muted p-3 text-center">
              <div className="text-xs text-muted-foreground">العروض</div>
              <div className="text-lg font-semibold tabular-nums">27</div>
            </div>
            <div className="rounded-md bg-muted p-3 text-center">
              <div className="text-xs text-muted-foreground">الوظائف</div>
              <div className="text-lg font-semibold tabular-nums">9</div>
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-border p-4">
          <h2 className="font-medium">قيم رئيسية</h2>
          <div className="divide-y divide-border text-sm">
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">العميل</span>
              <span className="font-medium">شركة أكمي</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">المشروع</span>
              <span className="font-medium">أطلس</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">الحالة</span>
              <span className="font-medium">قيد المراجعة</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
