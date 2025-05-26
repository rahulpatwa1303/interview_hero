// In global.d.ts (or your chosen .d.ts file)

// Option A: If you want to be very specific to Next.js App Router pages
declare global {
    namespace NextJsAppRouter { // Use a namespace to avoid direct collision if possible
      interface PageProps<
        P extends Record<string, string | string[]> = {}, // Params
        S extends Record<string, string | string[] | undefined> = {} // SearchParams
      > {
        params: P;
        searchParams: S;
      }
    }
  }
  
  // Option B: A more direct attempt to redefine a potentially global PageProps
  // This is riskier if PageProps is used elsewhere with a different meaning.
  // declare global {
  //   interface PageProps { // Or `type PageProps = { ... }`
  //     params: Record<string, string | string[] | undefined>;
  //     searchParams: Record<string, string | string[] | undefined>;
  //     // Add other common Next.js page props if needed, like `children` for layouts
  //   }
  // }