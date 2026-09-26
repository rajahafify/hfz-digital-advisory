// Single source of truth for every price on the site.
// Edit numbers here only. Do not hardcode prices in markup.
// All values in Malaysian Ringgit (RM), exclusive of SST.

export const company = {
  name: "HFZ Digital Advisory Sdn. Bhd.",
  address:
    "16-3, Menara Mutiara Sentral, No. 2, Jalan Desa Aman 1, Cheras Business Centre, 56000 Cheras, Kuala Lumpur",
  phone: "+60173252311",
  whatsapp: "60173252311",
  email: "info@hfzgroup.com.my",
};

export const domains = [
  { tld: ".com", register: 59, renewal: 105 },
  { tld: ".my", register: 119, renewal: 179 },
  { tld: ".com.my", register: 79, renewal: 105 },
  { tld: ".net", register: 99, renewal: 109 },
  { tld: ".org", register: 99, renewal: 115 },
  { tld: ".biz", register: 129, renewal: 165 },
  { tld: ".online", register: 49, renewal: 259 },
  { tld: ".site", register: 69, renewal: 215 },
  { tld: ".store", register: 39, renewal: 425 },
  { tld: ".digital", register: 249, renewal: 249 },
  { tld: ".blog", register: 49, renewal: 199 },
  { tld: ".cloud", register: 49, renewal: 169 },
];

export const hosting = [
  {
    name: "HFZ Digital Starter",
    price: "RM500 / year",
    bestFor: "Startups and basic business websites",
  },
  {
    name: "HFZ Digital Business",
    price: "RM700 / year",
    bestFor: "Growing SMEs and multiple websites",
  },
  {
    name: "HFZ Digital Pro",
    price: "RM1,200 / year",
    bestFor: "Businesses with higher resource requirements",
  },
];

export const hostingFeatures = [
  "cPanel control panel",
  "NVMe storage",
  "Free SSL",
  "Email capability",
  "Anti-spam",
  "Scheduled backups",
];

export const emailServices = [
  { name: "Business email setup: up to 5 accounts", price: "RM150", unit: "one-time" },
  { name: "Additional email account setup", price: "RM30", unit: "per account" },
  { name: "Email migration: basic", price: "From RM250", unit: "per domain" },
  { name: "Email troubleshooting / configuration", price: "From RM80", unit: "per task" },
  { name: "Microsoft 365 setup & tenant configuration", price: "From RM300", unit: "one-time" },
  { name: "Microsoft 365 user licence", price: "Quoted separately", unit: "per user / year" },
  { name: "Google Workspace setup", price: "From RM300", unit: "one-time" },
  { name: "Google Workspace licence", price: "Quoted separately", unit: "per user / year" },
];

export const seoServices = [
  { name: "SEO audit", price: "From RM500" },
  { name: "Monthly SEO: Starter", price: "RM800 / month" },
  { name: "Monthly SEO: Business", price: "RM1,500 / month" },
  { name: "Monthly SEO: Professional", price: "RM2,500 / month" },
  { name: "Website content writing", price: "From RM200 / page" },
  { name: "Google Business Profile management", price: "From RM300 / month" },
  { name: "Social media setup: Facebook / Instagram", price: "RM300" },
  { name: "Social media monthly management", price: "From RM800 / month" },
];

export const websitePackages = [
  {
    name: "HFZ Website Starter",
    price: "RM1,500",
    scope: [
      "Up to 5 pages",
      "Responsive design",
      "Contact form",
      "Basic SEO",
    ],
    featured: false,
  },
  {
    name: "HFZ Website Business",
    price: "RM2,800",
    scope: [
      "Up to 10 pages",
      "CMS",
      "Contact and WhatsApp integration",
      "Basic SEO",
    ],
    featured: true,
  },
  {
    name: "HFZ Website Professional",
    price: "RM4,500",
    scope: [
      "Up to 15 pages",
      "Advanced forms",
      "Blog",
      "Analytics",
      "Enhanced SEO setup",
    ],
    featured: false,
  },
];

export const extraBuilds = [
  { name: "E-Commerce Website", price: "From RM5,500", scope: "Online store, product catalogue, payment and shipping integration" },
  { name: "Custom Website / Web Application", price: "From RM8,000", scope: "Custom requirements; quotation after scope review" },
];

export const maintenance = [
  { name: "Basic", price: "RM1,800 / year", scope: "Minor text and image updates, checks and routine maintenance" },
  { name: "Business", price: "RM3,600 / year", scope: "Updates, backups, security checks and up to 2 hours support" },
  { name: "Professional", price: "RM7,200 / year", scope: "Priority support, updates, backups, monitoring and up to 5 hours support" },
];

export const addons = [
  { name: "Additional website page", price: "RM250 / page" },
  { name: "Landing page", price: "From RM500" },
  { name: "Contact / enquiry form", price: "From RM150" },
  { name: "WhatsApp integration", price: "RM100" },
  { name: "Google Analytics / tracking setup", price: "RM200" },
  { name: "Google Search Console setup", price: "RM150" },
  { name: "Basic on-page SEO setup", price: "From RM500" },
  { name: "Google Business Profile setup", price: "From RM250" },
  { name: "Website speed optimisation", price: "From RM350" },
  { name: "SSL installation / configuration", price: "RM100" },
  { name: "Website backup setup", price: "RM150" },
];

export const bundles = [
  {
    name: "HFZ Launch Package",
    price: "RM1,999",
    includes:
      "Domain (.com) 1 year + Starter Hosting 1 year + 5-page website + business email setup + SSL + basic SEO",
  },
  {
    name: "HFZ Business Online Package",
    price: "RM3,499",
    includes:
      "Domain (.com) 1 year + Business Hosting 1 year + up to 10-page website + email setup + SSL + analytics + basic SEO",
  },
  {
    name: "HFZ Professional Online Package",
    price: "RM5,499",
    includes:
      "Domain 1 year + Pro Hosting 1 year + up to 15-page website + email setup + analytics + SEO setup + 3 months basic maintenance",
  },
];
