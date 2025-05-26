export type PageProps = {
    params?: Record<string, string | string[] | undefined>;
    searchParams?: Record<string, string | string[] | undefined>; // <<<< CORRECTED
    // ... any other common properties for your pages
  };
  