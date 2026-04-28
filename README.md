# DPMEM E-Commerce Demand and Pricing Platform

Full-stack site for the diploma project about demand and price management in e-commerce. The system shows how a business user can analyze products, monitor demand, manage pricing recommendations, keep decision history, and control catalog data through an admin workspace.

## Main Sections

- `Overview` - main page with a short explanation of the system.
- `Product Intelligence` - product catalog, filters, comparison, and local pricing queue.
- `Pricing Center` - pricing recommendation approval workflow.
- `Analytics` - demand, regional performance, and model monitoring.
- `Profile` - user workspace and pricing decision history.
- `Admin` - admin panel for users, roles, product editing, and product creation.

## Product Intelligence

The catalog is used to inspect product signals before a product goes into a pricing workflow.

Controls:

- `Search` searches by product name and description.
- `Category` filters products by category.
- `Sort by` changes product order.
- `Min price` and `Max price` limit the price range.
- `Min rating` filters by rating.
- `Demand floor` filters by minimum demand index.
- `Active signal only` keeps products with active stock signal.
- `Top demand`, `Budget range`, `Premium`, `In stock` are quick presets.
- `Reset all` clears filters.
- `Grid` and `List` switch catalog layout.

Product card actions:

- `+` / `*` adds or removes a product from watchlist.
- `Queue for pricing` adds a product to local pricing queue.
- `Compare` adds a product to comparison.
- `Clear comparison` clears selected comparison products.
- `Prev`, `Next`, and page numbers control pagination.

## Pricing Center

Pricing Center is the decision workflow for model-generated pricing recommendations.

Main actions:

- `Approve` approves one recommendation.
- `Approve all` approves all recommendations.
- `Recalculate` recalculates recommendation prices and confidence.
- `Apply override` saves a manually entered price from `Override price`.

Displayed fields:

- `Current` - current product price.
- `Recommended` - model recommended price.
- `Elasticity` - demand elasticity estimate.
- `Status` - recommendation state: pending, approved, overridden, or recalculated.

## Analytics

Analytics shows demand and model signals.

Controls and blocks:

- `Timeframe` switches period: `24h`, `7d`, `30d`.
- `Region` filters regional performance.
- `Volatility guard` sets a price volatility limit.
- `Peak Demand by Hour` shows hourly demand.
- `Regional Performance` shows regional demand and uplift.
- `Model diagnostics` shows MAPE, data freshness, and RL reward stability.
- `Scenario simulation` shows pricing scenario cards.
- `Model activity feed` shows recent model events.

## Profile

Profile stores user workspace information.

Features:

- `Name` changes user name.
- `Email` is read-only.
- `Save changes` saves profile changes.
- `Recent decision history` shows approved and overridden pricing decisions.

## Admin Panel

Admin panel is available only for users with `ROLE_ADMIN`. The `Admin` navigation item appears only for admins.

Admin account:

```text
admin@dpmem.com / admin123
```

Top area:

- `Refresh data` reloads admin data from backend.
- KPI cards show users, products, recommendations, and catalog value.

### Overview Tab

- `Pending` shows pending pricing recommendations.
- `Approved` shows approved recommendations.
- `Overridden` shows manually changed recommendations.
- `Average demand` shows average catalog demand index.
- `Admin notes` explains what admin controls.

### Users Tab

- User table shows name, email, role, and creation date.
- `Change role` changes user role.
- `Analyst` gives normal workspace access.
- `Admin` gives access to admin panel.

### Catalog Control Tab

This tab has two product management flows.

Product signal editor:

- `Product` selects an existing product by SKU.
- `Price` updates current product price.
- `Stock` updates product stock.
- `Demand index` updates demand index from 0 to 100.
- `Save product signal` saves changes to backend.
- `Selected product` previews the chosen product.

Add product:

- `SKU` is the unique product identifier.
- `Name` is the product name shown in the catalog.
- `Category` is used by catalog filtering.
- `Price` is the current product price.
- `Stock` is the available quantity.
- `Rating` is the displayed product rating.
- `Reviews` is the number of product reviews.
- `Demand index` is the demand score from 0 to 100.
- `Image URL` is the product image shown in the catalog.
- `Description` is the short product description.
- `Add product` creates the product in PostgreSQL and immediately adds it to the catalog.

## Backend

Backend is responsible for persistence, business logic, security, and REST API.

PostgreSQL stores:

- users;
- products;
- pricing recommendations;
- pricing decision history.

Backend features:

- product list loading;
- pricing recommendation workflow;
- manual price override;
- recommendation recalculation;
- analytics summary;
- decision history;
- admin summary;
- user role management;
- product signal editing;
- product creation.

## Tech Stack

- Frontend: React, React Router
- Backend: Spring Boot, Spring Security, Spring Data JPA
- Database: PostgreSQL `localhost:5432`, user `postgres`, password `root`
- API format: REST JSON

## Run

Backend:

```powershell
cd ..\ecommerce
.\mvnw.cmd spring-boot:run
```

Frontend:

```powershell
cd ..\e-commerce
npm start
```

Open site: `http://localhost:3000`.

Demo accounts:

```text
demo@dpmem.com / demo123
admin@dpmem.com / admin123
```

Backend uses PostgreSQL and creates/updates tables through Hibernate.

## API

- `GET /api/products` - product list.
- `GET /api/pricing/recommendations` - pricing recommendations.
- `POST /api/pricing/approve-all` - approve all recommendations.
- `POST /api/pricing/{sku}/approve` - approve one recommendation.
- `PATCH /api/pricing/{sku}/override` - manually override recommended price.
- `POST /api/pricing/recalculate` - recalculate recommendations.
- `GET /api/analytics/summary` - analytics summary.
- `GET /api/profile/decisions` - user pricing decision history.
- `GET /api/admin/summary` - admin panel summary.
- `GET /api/admin/users` - users list.
- `PATCH /api/admin/users/{userId}/role` - update user role.
- `POST /api/admin/products` - create product.
- `PATCH /api/admin/products/{sku}` - update product price, stock, or demand index.
