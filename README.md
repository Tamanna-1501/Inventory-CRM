# Inventual: Inventory Management CRM

A web-based inventory management system for tracking products, stock across warehouses, purchases, sales, invoices, expenses and stock transfers, with role-based access for every user.

Built with Next.js (App Router), Prisma and MySQL.

## Features

- **Dashboard**: summary of sales, purchases, stock and activity
- **Products**: products, categories, brands, units, barcode generation, stock adjustments
- **Trading**
  - Purchases and purchase returns
  - Sales, POS sales and sales returns
  - Sale, purchase and expense invoices with payment tracking
- **People**: customers, suppliers and billers
- **Expenses**: expense categories, expenses and expense payments
- **Warehouses and stock**: stock per warehouse, low-stock alerts
- **Transfers**: move stock between warehouses, with Excel import and export
- **Reports**: sales, purchase, stock, expense, payment, tax, discount, shipping charge, customer, supplier, product, warehouse and user reports
- **User management**: users, roles and a permission page where the admin ticks what each role can do
- **Administrative tools**: settings and role permissions
- **Email and notifications**: internal messages between users and in-app notifications
- **Exports**: PDF and Excel downloads
- **Light and dark mode**

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Database | MySQL with Prisma ORM 5 |
| Authentication | JWT (7-day token), passwords hashed with bcrypt |
| Styling | Tailwind CSS 4 and CSS |
| Exports | jsPDF, jsPDF-AutoTable, ExcelJS |
| Icons | lucide-react |

## Requirements

- Node.js 20.9 or later
- MySQL 8 (a running server and an empty database)
- npm

## Getting started

**1. Clone and install**

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
npm install
```

During install you may see `Unknown command "skills"` from a `postinstall` script. It is harmless and the install still completes.

**2. Create the database**

```sql
CREATE DATABASE inventual_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**3. Configure the environment**

Create a `.env` file in the project root (see `.env.example`):

```env
DATABASE_URL="mysql://USER:PASSWORD@127.0.0.1:3306/inventual_db"
JWT_SECRET="a-long-random-secret-string"
```

If your password contains special characters such as `@` or `#`, URL-encode them (for example `@` becomes `%40`). Never commit the `.env` file.

**4. Create the tables**

```bash
npx prisma migrate deploy
npx prisma generate
```

**5. Run the app**

```bash
npm run dev
```

Open http://localhost:3000.

**6. Create the first admin**

Open `/register` and sign up. The **first user** created in an empty database automatically becomes the **ADMIN**. After that, registration is closed and only an admin (or a user with the permission) can create new users from the User Management page.

## Roles and permissions

- The **ADMIN** role always has full access.
- Every other role is created by the admin. The admin ticks view, add, edit and delete permissions per module on the role permission page, and these are saved on the role.
- Permissions are checked both in the pages (menu items and routes) and in the API routes, so hiding a menu item is not the only protection.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production build (run `npm run build` first) |
| `npm run lint` | Run ESLint |

## Project structure

```
app/
  api/            API routes (auth, products, sales, purchases, expenses, transfers, ...)
  dashboard/      Dashboard page
  products/       Products, categories, brands, units, barcode, adjustments
  trading/        Purchases, sales, POS, returns, invoices
  people/         Customers, suppliers, billers
  expense/        Expenses and expense categories
  transfer/       Stock transfers
  warehouse/      Warehouses
  reports/        Report pages
  user-management/ Users and roles
  administrative-tools/ Settings and role permissions
  email/          Internal messages
components/       Shared UI (AppShell, Sidebar, ...)
context/          Auth context
lib/              Auth, permissions, route access, Prisma client, stock helpers
prisma/           schema.prisma and migrations
middleware.js     Route protection
```

## Deployment notes

- Set `DATABASE_URL` and a strong, unique `JWT_SECRET` in the hosting environment.
- Run `npx prisma migrate deploy` on the production database. Do not use `prisma migrate dev` or `prisma db push` there.
- Build and start with `npm run build` and `npm start`.

## Known items before production

- Make `Purchase.reference` required (it is optional while testing).
- Clean all test and dummy data from the database.
- Make `Expense.warehouseId` required (it is optional because older test records had no warehouse).
- Decide whether `Sale.reference`, `PurchaseReturn.reference` and `SaleReturn.reference` should become required.
- If two users mark the same pending transfer as completed at the same moment, stock can move twice. Add an `updateMany` guard before going live.

## License

Add a license of your choice (for example MIT), or keep the project private.
